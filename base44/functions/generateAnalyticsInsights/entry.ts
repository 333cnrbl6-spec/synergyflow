import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Generates actionable insights from portfolio analytics
 * Called when advanced analytics reveal concerning trends
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_insights') {
      return await generateInsights(base44);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function generateInsights(base44) {
  try {
    const products = await base44.asServiceRole.entities.Product.list();
    const subscriptions = await base44.asServiceRole.entities.Subscription.list();

    const insights = [];

    for (const product of products) {
      const productSubs = subscriptions.filter(s => s.product_id === product.id);
      const activeSubs = productSubs.filter(s => s.status === 'active').length;
      const cancelledSubs = productSubs.filter(s => s.status === 'cancelled').length;
      const totalSubs = productSubs.length;

      const churnRate = totalSubs > 0 ? (cancelledSubs / totalSubs) * 100 : 0;
      const monthlyPrice = productSubs.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;
      const monthlyARPU = activeSubs > 0 ? monthlyPrice / activeSubs : 0;
      const monthlyChurnRate = churnRate / 100;
      const retention = Math.max(1 - monthlyChurnRate, 0);

      // Generate insights based on metrics
      if (churnRate > 25) {
        insights.push({
          product_name: product.name,
          type: 'high_churn',
          severity: 'critical',
          metric: churnRate,
          insight: `${product.name} has a ${churnRate.toFixed(1)}% churn rate. This is above the 25% threshold.`,
          actions: [
            'Survey recent churners to identify pain points',
            'Review product pricing against competitor offerings',
            'Increase customer support and onboarding quality',
            'Implement retention features or loyalty programs'
          ]
        });
      } else if (churnRate > 15) {
        insights.push({
          product_name: product.name,
          type: 'elevated_churn',
          severity: 'high',
          metric: churnRate,
          insight: `${product.name} churn is elevated at ${churnRate.toFixed(1)}%. Monitor closely.`,
          actions: [
            'Conduct win-loss analysis with key accounts',
            'Create customer health scoring to predict churn',
            'Develop targeted retention campaigns'
          ]
        });
      }

      if (retention > 0.95) {
        insights.push({
          product_name: product.name,
          type: 'excellent_retention',
          severity: 'positive',
          metric: retention * 100,
          insight: `${product.name} has excellent ${(retention * 100).toFixed(0)}% monthly retention.`,
          actions: [
            'Leverage satisfied customers for case studies',
            'Implement upsell/cross-sell programs',
            'Gather testimonials and expand feature sets based on usage data',
            'Consider raising prices given strong retention'
          ]
        });
      }

      if (monthlyARPU < 50 && activeSubs > 0) {
        insights.push({
          product_name: product.name,
          type: 'low_arpu',
          severity: 'high',
          metric: monthlyARPU,
          insight: `${product.name} has low ARPU at $${monthlyARPU.toFixed(2)}/month. Limited revenue potential.`,
          actions: [
            'Introduce premium tier or add-on features',
            'Implement usage-based pricing to capture more value',
            'Bundle with complementary products',
            'Review pricing strategy relative to feature set'
          ]
        });
      }

      if (activeSubs === 0 && product.name) {
        insights.push({
          product_name: product.name,
          type: 'no_active_subs',
          severity: 'critical',
          metric: 0,
          insight: `${product.name} has zero active subscriptions.`,
          actions: [
            'Evaluate product-market fit',
            'Review go-to-market strategy and messaging',
            'Consider trial period or free tier to drive adoption',
            'May require sunset or repositioning'
          ]
        });
      }

      if (activeSubs > 0 && (!product.pricing_tiers || product.pricing_tiers.length === 0)) {
        insights.push({
          product_name: product.name,
          type: 'missing_pricing_tiers',
          severity: 'high',
          metric: activeSubs,
          insight: `${product.name} has active subscriptions but lacks pricing tier definition.`,
          actions: [
            'Immediately define pricing tiers (Basic, Pro, Enterprise)',
            'Map existing customers to appropriate tiers',
            'Set up tiered pricing to capture expansion revenue',
            'Consider grandfather clause for current customers'
          ]
        });
      }
    }

    // Portfolio-level insights
    const totalChurn = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalSubs = subscriptions.length;
    const portfolioChurnRate = totalSubs > 0 ? (totalChurn / totalSubs) * 100 : 0;

    if (portfolioChurnRate > 20) {
      insights.push({
        product_name: 'Portfolio',
        type: 'portfolio_churn_risk',
        severity: 'critical',
        metric: portfolioChurnRate,
        insight: `Portfolio churn rate is ${portfolioChurnRate.toFixed(1)}%, indicating systemic retention issues.`,
        actions: [
          'Conduct cross-product churn analysis to identify patterns',
          'Review customer support and success metrics',
          'Assess overall product quality and feature roadmap',
          'Consider enterprise customer success programs'
        ]
      });
    }

    return Response.json({
      success: true,
      insights_count: insights.length,
      insights
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}