import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all products, subscriptions, and benchmarks
    const [products, subscriptions, benchmarks, existingActions] = await Promise.all([
      base44.entities.Product.list(),
      base44.entities.Subscription.list(),
      base44.entities.Benchmark.list(),
      base44.entities.ActionItem.list()
    ]);

    const flaggedProducts = [];
    const actionItems = [];

    // Calculate churn rate for each product and compare to benchmarks
    for (const product of products) {
      const productSubs = subscriptions.filter(s => s.product_id === product.id);
      
      if (productSubs.length === 0) continue;

      const cancelledSubs = productSubs.filter(s => s.status === 'cancelled').length;
      const churnRate = (cancelledSubs / productSubs.length) * 100;

      // Find churn benchmark for this product
      const churnBenchmark = benchmarks.find(
        b => b.metric_type === 'churn_rate' && 
             (b.product_id === product.id || !b.product_id)
      );

      if (churnBenchmark && churnRate > churnBenchmark.value) {
        flaggedProducts.push({
          product_id: product.id,
          product_name: product.name,
          current_churn: churnRate.toFixed(2),
          benchmark_churn: churnBenchmark.value,
          exceeded_by: (churnRate - churnBenchmark.value).toFixed(2),
          total_subs: productSubs.length,
          cancelled_subs: cancelledSubs
        });

        // Check if action item already exists for this product
        const existingAction = existingActions.find(
          a => a.related_product_id === product.id &&
               a.category === 'product_health' &&
               a.status === 'open'
        );

        if (!existingAction) {
          // Create action item for customer success team
          actionItems.push({
            title: `High Churn Alert: ${product.name}`,
            description: `Churn rate is ${churnRate.toFixed(2)}% vs benchmark of ${churnBenchmark.value}%. Exceeded by ${(churnRate - churnBenchmark.value).toFixed(2)}%. Contact ${cancelledSubs} at-risk customers for retention outreach.`,
            category: 'product_health',
            priority: churnRate > churnBenchmark.value * 1.5 ? 'critical' : 'high',
            trigger_entity_type: 'Product',
            trigger_entity_id: product.id,
            related_product_id: product.id,
            related_product_name: product.name,
            status: 'open',
            auto_triggered: true
          });
        }
      }
    }

    // Create action items
    if (actionItems.length > 0) {
      await base44.asServiceRole.entities.ActionItem.bulkCreate(actionItems);
    }

    return Response.json({
      flagged_count: flaggedProducts.length,
      flagged_products: flaggedProducts,
      actions_created: actionItems.length
    });
  } catch (error) {
    console.error('Error flagging high churn products:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});