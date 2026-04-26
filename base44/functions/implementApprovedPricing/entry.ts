import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all pricing proposals that have been approved
    const proposals = await base44.asServiceRole.entities.BoardProposal.filter({
      proposal_type: 'pricing',
      status: 'approved'
    });

    if (proposals.length === 0) {
      return Response.json({ message: 'No approved pricing proposals to implement' });
    }

    let implemented = 0;

    for (const proposal of proposals) {
      // Get associated pricing structure
      const pricingData = await base44.asServiceRole.entities.PricingStructure.filter({
        board_proposal_id: proposal.id,
        status: 'pending_board_approval'
      });

      if (pricingData.length === 0) continue;

      const pricing = pricingData[0];
      const productId = pricing.product_id;

      // Check if this product already has active pricing
      const activePricing = await base44.asServiceRole.entities.PricingStructure.filter({
        product_id: productId,
        status: 'active'
      });

      // Archive previous active pricing
      for (const old of activePricing) {
        await base44.asServiceRole.entities.PricingStructure.update(old.id, {
          status: 'archived',
          previous_version_id: old.id
        });
      }

      // Activate new pricing
      await base44.asServiceRole.entities.PricingStructure.update(pricing.id, {
        status: 'active'
      });

      // Update product pricing tiers
      const product = await base44.asServiceRole.entities.Product.get(productId);
      if (product) {
        await base44.asServiceRole.entities.Product.update(productId, {
          pricing_tiers: pricing.tiers,
          pricing_updated_date: new Date().toISOString()
        });
      }

      // Create action item to notify users
      await base44.asServiceRole.entities.ActionItem.create({
        title: `Pricing Update: ${pricing.product_name}`,
        description: `New pricing structure is now active. ${pricing.rationale}`,
        category: 'revenue',
        priority: 'high',
        trigger_entity_type: 'PricingStructure',
        trigger_entity_id: pricing.id,
        related_product_id: productId,
        related_product_name: pricing.product_name,
        status: 'open'
      });

      implemented++;
    }

    return Response.json({
      success: true,
      message: `Implemented ${implemented} approved pricing proposals`,
      count: implemented
    });
  } catch (error) {
    console.error('Implementation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});