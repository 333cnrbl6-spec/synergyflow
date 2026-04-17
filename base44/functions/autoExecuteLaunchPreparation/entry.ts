import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id } = body;

    // Fetch the proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal || proposal.approval_stage !== 'passed') {
      return Response.json({ error: 'Invalid proposal or not in passed state' }, { status: 400 });
    }

    // Only execute for readiness/launch proposals
    if (!['readiness', 'go_to_market'].includes(proposal.proposal_type)) {
      return Response.json({ error: 'Not a launch-type proposal' }, { status: 400 });
    }

    // Get all products
    const products = await base44.asServiceRole.entities.Product.list();
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });

    // Calculate launch preparedness baseline
    const baseline = calculateBaselineMetrics(products);

    // Create preparation action items for each product
    const actionItems = [];
    for (const product of products) {
      const gaps = identifyPreparationGaps(product, baseline);

      if (gaps.length > 0) {
        // Create action items to close gaps
        for (const gap of gaps) {
          const actionItem = await base44.asServiceRole.entities.ActionItem.create({
            title: `[Launch Prep] ${product.name}: ${gap.area}`,
            description: `Standardize ${gap.area} to level-peg with portfolio baseline for unified launch`,
            category: 'readiness',
            priority: 'high',
            trigger_entity_type: 'BoardProposal',
            trigger_entity_id: proposal_id,
            related_product_id: product.id,
            related_product_name: product.name,
            status: 'open',
            due_date: getUnifiedLaunchDate(),
            auto_triggered: true
          });

          actionItems.push(actionItem);
        }
      }
    }

    // Create launch preparation milestone
    const launchMilestone = await base44.asServiceRole.entities.ActionItem.create({
      title: `Unified Launch Preparedness - All Products Level-Pegged`,
      description: `Execute unified launch across all products with standardized pricing, features, and go-to-market approach. Board proposal: "${proposal.title}"`,
      category: 'readiness',
      priority: 'critical',
      trigger_entity_type: 'BoardProposal',
      trigger_entity_id: proposal_id,
      status: 'in_progress',
      due_date: getUnifiedLaunchDate(),
      auto_triggered: true
    });

    // Notify board members of execution
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: proposal_id,
        proposal_title: proposal.title,
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `Launch preparedness strategy EXECUTED. ${actionItems.length} product alignment tasks created. Unified launch date: ${getUnifiedLaunchDate()}`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    // Update proposal status to mark as executed
    await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
      status: 'approved',
      chairman_notes: `Auto-executed: Launch preparation initiated. ${actionItems.length} level-peg action items created.`
    });

    return Response.json({
      success: true,
      message: 'Launch preparation executed and products level-pegged',
      proposal_id,
      action_items_created: actionItems.length,
      unified_launch_date: getUnifiedLaunchDate(),
      products_standardized: products.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateBaselineMetrics(products) {
  if (products.length === 0) return {};

  // Calculate average metrics across all products
  const avgPricingTiers = products.reduce((sum, p) => sum + (p.pricing_tiers?.length || 0), 0) / products.length;
  const avgFeatures = products.reduce((sum, p) => sum + (p.features?.length || 0), 0) / products.length;
  const hasIcon = products.filter(p => p.icon_url).length > 0;
  const hasDescription = products.filter(p => p.description).length > 0;

  return {
    avgPricingTiers,
    avgFeatures,
    hasIcon,
    hasDescription
  };
}

function identifyPreparationGaps(product, baseline) {
  const gaps = [];

  // Check pricing
  if (!product.pricing_tiers || product.pricing_tiers.length === 0) {
    gaps.push({ area: 'Pricing Strategy', severity: 'high' });
  }

  // Check features
  if (!product.features || product.features.length === 0) {
    gaps.push({ area: 'Feature Documentation', severity: 'high' });
  }

  // Check branding
  if (!product.icon_url) {
    gaps.push({ area: 'Product Icon/Branding', severity: 'medium' });
  }

  // Check marketing assets
  if (!product.description || product.description.length < 50) {
    gaps.push({ area: 'Marketing Description', severity: 'medium' });
  }

  // Check target market definition
  if (!product.target_market) {
    gaps.push({ area: 'Target Market Definition', severity: 'medium' });
  }

  return gaps;
}

function getUnifiedLaunchDate() {
  // Set launch date 30 days from now
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}