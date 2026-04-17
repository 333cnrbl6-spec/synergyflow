import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { product_name, current_readiness, target_readiness, metrics } = body;

    if (!product_name || current_readiness === undefined) {
      return Response.json({ error: 'Missing product_name or current_readiness' }, { status: 400 });
    }

    const readinessGap = (target_readiness || 100) - current_readiness;

    // Create proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.create({
      title: `Bring ${product_name} to 100% Product Readiness`,
      summary: `${product_name} is currently at ${current_readiness}% readiness. Proposal to close the ${readinessGap}% gap and achieve full market readiness. Monthly MRR: £${metrics?.monthly_mrr || 0}, Sell-Now Value: £${metrics?.sell_now_value || 0}M`,
      raised_by: 'The Board (Collective)',
      channel_id: 'readiness',
      channel_name: 'Product Readiness',
      proposal_type: 'readiness',
      products_involved: [product_name],
      status: 'pending_chairman',
      is_unanimous: false,
      approval_stage: 'needs_review',
      discussion_count: 0,
      yes_votes: [],
      no_votes: [],
      abstain_votes: [],
      approval_history: [{
        stage: 'created',
        timestamp: new Date().toISOString(),
        reviewed_by: 'system',
        notes: `Readiness gap: ${readinessGap}% - from ${current_readiness}% to ${target_readiness || 100}%`
      }],
      timestamp: new Date().toISOString()
    });

    // Generate readiness gaps to close
    const readinessAreas = identifyReadinessGaps(product_name, current_readiness);
    const actionItems = [];

    for (const area of readinessAreas) {
      const actionItem = await base44.asServiceRole.entities.ActionItem.create({
        title: `[${product_name} Readiness] ${area.name}`,
        description: `Close readiness gap in ${area.name}. Priority: ${area.priority}. This is critical for achieving 100% market readiness and maximizing valuation.`,
        category: 'readiness',
        priority: area.priority,
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: proposal.id,
        related_product_id: product_name,
        related_product_name: product_name,
        status: 'open',
        due_date: getReadinessDueDate(),
        auto_triggered: true
      });

      actionItems.push(actionItem);
    }

    // Notify board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: proposal.id,
        proposal_title: proposal.title,
        notification_type: 'needs_review',
        current_stage: 'needs_review',
        recipient: member.app_name,
        message: `${product_name} readiness proposal: Close ${readinessGap}% gap. Current: ${current_readiness}%, Target: 100%. Sell-Now Value at stake: £${metrics?.sell_now_value || 0}M`,
        action_required: true,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      message: `${product_name} readiness proposal created`,
      proposal_id: proposal.id,
      readiness_gap_percent: readinessGap,
      current_readiness,
      target_readiness: target_readiness || 100,
      action_items_created: actionItems.length,
      metrics: {
        monthly_mrr: metrics?.monthly_mrr,
        sell_now_value: metrics?.sell_now_value
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function identifyReadinessGaps(productName, currentReadiness) {
  const gaps = [];
  const percentagePerGap = 100 / 5; // ~20% per major gap

  // Define readiness areas
  const readinessAreas = [
    { name: 'Documentation & Specifications', priority: 'high' },
    { name: 'Performance Optimization & Testing', priority: 'high' },
    { name: 'Security & Compliance Audit', priority: 'critical' },
    { name: 'Enterprise Integration & APIs', priority: 'high' },
    { name: 'Go-to-Market Materials & Sales Enablement', priority: 'high' }
  ];

  // Calculate gaps based on readiness percentage
  const numberofGapsToCover = Math.ceil((100 - currentReadiness) / percentagePerGap);

  for (let i = 0; i < numberofGapsToCover; i++) {
    gaps.push(readinessAreas[i] || { name: `Readiness Area ${i + 1}`, priority: 'medium' });
  }

  return gaps.length > 0 ? gaps : [{ name: 'General Product Refinement', priority: 'medium' }];
}

function getReadinessDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 21); // 3-week deadline for readiness closure
  return date.toISOString().split('T')[0];
}