import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get products
    const products = await base44.asServiceRole.entities.Product.list();
    if (!products || products.length === 0) {
      return Response.json({ error: 'No products found' }, { status: 400 });
    }

    // Create quotas for first product
    const product = products[0];
    const tierCounts = {
      starter: { calls: 10000, storage: 10, members: 5, data: 50, runs: 100, reports: 50 },
      professional: { calls: 100000, storage: 100, members: 25, data: 500, runs: 1000, reports: 500 },
      enterprise: { calls: 1000000, storage: 1000, members: 1000, data: 5000, runs: 10000, reports: 5000 }
    };

    const defaultTier = 'professional';
    const limits = tierCounts[defaultTier];

    const existingQuota = await base44.asServiceRole.entities.SubscriptionQuota.filter({
      user_email: user.email,
      product_id: product.id
    });

    if (existingQuota.length === 0) {
      await base44.asServiceRole.entities.SubscriptionQuota.create({
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        subscription_tier: defaultTier,
        api_calls_limit: limits.calls,
        data_processing_limit_gb: limits.data,
        storage_limit_gb: limits.storage,
        team_members_limit: limits.members,
        concurrent_sessions_limit: 10,
        documents_limit: 10000,
        automation_runs_limit: limits.runs,
        reports_limit: limits.reports,
        current_api_calls_month: Math.floor(limits.calls * 0.45),
        current_data_processed_gb: limits.data * 0.35,
        current_storage_used_gb: limits.storage * 0.25,
        current_team_members: Math.floor(limits.members * 0.6),
        current_automation_runs: Math.floor(limits.runs * 0.3),
        current_reports: Math.floor(limits.reports * 0.4),
        reset_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        alerts_enabled: true,
        alert_threshold_percent: 80
      });
    }

    // Create sample metrics for last 30 days
    const today = new Date();
    const metricsToCreate = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const apiCalls = Math.floor(Math.random() * 1000 + 500);
      const dataProcessed = Math.random() * 5 + 2;
      const docsCreated = Math.floor(Math.random() * 50 + 10);
      const reportsGen = Math.floor(Math.random() * 10 + 2);
      const automationRuns = Math.floor(Math.random() * 200 + 50);
      const storageUsed = limits.storage * (0.2 + Math.random() * 0.15);

      metricsToCreate.push({
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        metric_date: dateStr,
        api_calls: apiCalls,
        data_processed_gb: dataProcessed,
        storage_used_gb: storageUsed,
        documents_created: docsCreated,
        reports_generated: reportsGen,
        automation_runs: automationRuns,
        active_sessions: Math.floor(Math.random() * 5 + 1),
        users_active: Math.floor(Math.random() * 3 + 1),
        metric_type: 'daily'
      });
    }

    // Create metrics in batches
    await base44.asServiceRole.entities.UsageMetrics.bulkCreate(metricsToCreate);

    return Response.json({
      success: true,
      message: `Created quota and 31 sample metrics for ${product.name}`,
      product: product.name,
      tier: defaultTier
    });
  } catch (error) {
    console.error('Seed failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});