import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { recommendationId, newTier } = payload;

    if (!recommendationId) {
      return Response.json({ error: 'Missing recommendationId' }, { status: 400 });
    }

    // Mark recommendation as converted
    const recommendation = await base44.entities.UpsellRecommendation.get(recommendationId);
    
    await base44.entities.UpsellRecommendation.update(recommendationId, {
      status: 'converted'
    });

    // Update subscription tier
    const quota = await base44.entities.SubscriptionQuota.filter({
      user_email: user.email,
      product_id: recommendation.product_id
    });

    if (quota.length > 0) {
      await base44.entities.SubscriptionQuota.update(quota[0].id, {
        subscription_tier: newTier || recommendation.recommended_tier
      });
    }

    // Create action item for conversion
    await base44.entities.ActionItem.create({
      title: `Upsell Conversion: ${recommendation.product_name}`,
      description: `User upgraded from ${recommendation.current_tier} to ${recommendation.recommended_tier}`,
      category: 'revenue',
      priority: 'high',
      trigger_entity_type: 'UpsellRecommendation',
      trigger_entity_id: recommendationId,
      related_product_id: recommendation.product_id,
      related_product_name: recommendation.product_name,
      status: 'completed'
    });

    return Response.json({
      success: true,
      message: 'Conversion tracked',
      recommendation: recommendation,
      newTier: newTier || recommendation.recommended_tier
    });
  } catch (error) {
    console.error('Tracking failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});