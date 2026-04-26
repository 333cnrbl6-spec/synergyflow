import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all upsell recommendations
    const recommendations = await base44.asServiceRole.entities.UpsellRecommendation.list();

    const metrics = {
      total_recommendations: recommendations.length,
      active: recommendations.filter(r => r.status === 'active').length,
      converted: recommendations.filter(r => r.status === 'converted').length,
      dismissed: recommendations.filter(r => r.status === 'dismissed').length,
      expired: recommendations.filter(r => r.status === 'expired').length,
      conversion_rate: 0,
      avg_click_through: 0,
      total_potential_mrr: 0,
      by_metric: {}
    };

    // Calculate metrics
    if (metrics.total_recommendations > 0) {
      metrics.conversion_rate = (metrics.converted / metrics.total_recommendations * 100).toFixed(2);
      metrics.avg_click_through = (
        recommendations.reduce((sum, r) => sum + (r.click_count || 0), 0) / metrics.total_recommendations
      ).toFixed(2);

      // Calculate potential MRR
      metrics.total_potential_mrr = recommendations
        .filter(r => r.status === 'active')
        .reduce((sum, r) => sum + (r.monthly_price_increase || 0), 0);

      // Group by trigger metric
      recommendations.forEach(r => {
        const metric = r.trigger_metric;
        if (!metrics.by_metric[metric]) {
          metrics.by_metric[metric] = { count: 0, conversions: 0 };
        }
        metrics.by_metric[metric].count++;
        if (r.status === 'converted') {
          metrics.by_metric[metric].conversions++;
        }
      });
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics
    });
  } catch (error) {
    console.error('Metrics generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});