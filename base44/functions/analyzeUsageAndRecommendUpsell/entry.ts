import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscriptions and quotas
    const quotas = await base44.entities.SubscriptionQuota.filter({
      user_email: user.email
    });

    if (quotas.length === 0) {
      return Response.json({ message: 'No subscriptions found' });
    }

    const recommendations = [];

    for (const quota of quotas) {
      // Check if usage exceeds 80% threshold
      const usagePercents = {
        api_calls: (quota.current_api_calls_month / quota.api_calls_limit) * 100,
        data_processing: (quota.current_data_processed_gb / quota.data_processing_limit_gb) * 100,
        storage: (quota.current_storage_used_gb / quota.storage_limit_gb) * 100,
        team_members: (quota.current_team_members / quota.team_members_limit) * 100,
        automation_runs: (quota.current_automation_runs / quota.automation_runs_limit) * 100,
        reports: (quota.current_reports / quota.reports_limit) * 100
      };

      const metricsAt80 = Object.entries(usagePercents).filter(([_, pct]) => pct >= 80);

      if (metricsAt80.length === 0) continue;

      // Get current tier and determine next tier
      const currentTier = quota.subscription_tier;
      const tierProgression = {
        starter: 'professional',
        professional: 'enterprise',
        enterprise: 'enterprise'
      };

      const nextTier = tierProgression[currentTier];
      if (!nextTier || nextTier === currentTier) continue;

      // Get metrics history for growth analysis
      const metrics = await base44.entities.UsageMetrics.filter({
        user_email: user.email,
        product_id: quota.product_id
      }, '-metric_date', 30);

      if (metrics.length === 0) continue;

      // Calculate growth rate
      const recent = metrics.slice(0, 7);
      const older = metrics.slice(-7);
      
      let growthRate = 0;
      if (recent.length >= 1 && older.length >= 1) {
        const recentAvg = recent.reduce((s, m) => s + (m.api_calls || 0), 0) / recent.length;
        const olderAvg = older.reduce((s, m) => s + (m.api_calls || 0), 0) / older.length;
        growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg * 100) : 0;
      }

      // Determine primary trigger metric
      const [triggerMetric] = metricsAt80.sort((a, b) => b[1] - a[1])[0] || ['api_calls'];
      const maxUsagePercent = Math.max(...Object.values(usagePercents));

      // Estimate days until limit
      let daysUntilLimit = 30;
      if (growthRate > 0) {
        const percentageLeft = 100 - maxUsagePercent;
        daysUntilLimit = Math.ceil((percentageLeft / growthRate) * 7);
      }

      // Get pricing for tiers to calculate benefits
      const pricingData = await base44.entities.PricingStructure.filter({
        product_id: quota.product_id,
        status: 'active'
      });

      let monthlyPriceIncrease = 0;
      let projectedBenefit = '';
      let roiMonths = 0;

      if (pricingData.length > 0) {
        const pricing = pricingData[0];
        const currentTierData = pricing.tiers?.find(t => t.tier_id === currentTier);
        const nextTierData = pricing.tiers?.find(t => t.tier_id === nextTier);

        if (currentTierData && nextTierData) {
          monthlyPriceIncrease = nextTierData.monthly_price_gbp - currentTierData.monthly_price_gbp;

          // Calculate benefits
          const currentLimit = quota.api_calls_limit;
          const nextLimit = nextTierData.api_calls_monthly || currentLimit * 10;
          const capacityIncrease = ((nextLimit - currentLimit) / currentLimit * 100).toFixed(0);

          projectedBenefit = `Upgrade to ${nextTier} plan provides ${capacityIncrease}% more capacity across all resources, plus enhanced features and support.`;

          // Simple ROI: cost of upgrade vs productivity gains (assume 1% productivity improvement per 10% headroom)
          const productivityGain = (capacityIncrease / 10) * 0.01;
          if (productivityGain > 0) {
            roiMonths = Math.ceil(monthlyPriceIncrease / (productivityGain * monthlyPriceIncrease * 100)) || 3;
          }
        }
      }

      // Determine most used feature
      const mostUsedFeature = metrics[0]?.documents_created > 0
        ? 'document creation'
        : metrics[0]?.api_calls > 0
        ? 'API integration'
        : 'data processing';

      // Check if recommendation already exists and is active
      const existing = await base44.entities.UpsellRecommendation.filter({
        user_email: user.email,
        product_id: quota.product_id,
        status: 'active'
      });

      if (existing.length === 0) {
        const recommendation = await base44.entities.UpsellRecommendation.create({
          user_email: user.email,
          product_id: quota.product_id,
          product_name: quota.product_name,
          current_tier: currentTier,
          recommended_tier: nextTier,
          trigger_metric: metricsAt80.length > 1 ? 'multiple' : triggerMetric,
          current_usage_percent: Math.round(maxUsagePercent),
          projected_upgrade_benefit: projectedBenefit,
          monthly_price_increase: monthlyPriceIncrease,
          roi_months: roiMonths,
          usage_analysis: {
            growth_rate: Math.round(growthRate),
            days_until_limit: daysUntilLimit,
            most_used_feature: mostUsedFeature
          },
          status: 'active',
          expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        recommendations.push({
          product: quota.product_name,
          tier: nextTier,
          usage: Math.round(maxUsagePercent)
        });
      }
    }

    return Response.json({
      success: true,
      message: `Analyzed ${quotas.length} subscriptions, created ${recommendations.length} recommendations`,
      recommendations
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});