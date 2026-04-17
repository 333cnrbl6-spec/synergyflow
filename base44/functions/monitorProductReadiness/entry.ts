import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all products with readiness data
    const readiness = await base44.asServiceRole.entities.ProductReadiness.list();
    
    const alertsTriggered = [];
    const today = new Date().toISOString().split('T')[0];

    for (const product of readiness) {
      // Check if readiness is below 90%
      if (product.overall_readiness_percentage < 90 && !product.alert_triggered) {
        
        // Identify critical gaps
        const gaps = product.identified_gaps || [];
        const criticalGaps = gaps.filter(g => g.priority === 'critical' || g.priority === 'high');
        
        // Create Low Readiness Alert proposal
        const alertProposal = await base44.asServiceRole.entities.BoardProposal.create({
          title: `🚨 Low Readiness Alert: ${product.product_name}`,
          summary: `${product.product_name} readiness is at ${product.overall_readiness_percentage}% (below 90% threshold). Immediate action required to address identified gaps.`,
          raised_by: 'System Automation',
          channel_id: 'governance',
          channel_name: '#governance',
          proposal_type: 'readiness',
          products_involved: [product.product_id],
          status: 'pending_chairman',
          approval_stage: 'needs_review',
          discussion_count: 0,
          timestamp: new Date().toISOString()
        });

        // Update ProductReadiness to mark alert as triggered
        await base44.asServiceRole.entities.ProductReadiness.update(product.id, {
          alert_triggered: true,
          related_proposal_id: alertProposal.id
        });

        // Notify board members
        const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
        for (const member of boardMembers) {
          await base44.asServiceRole.entities.ProposalNotification.create({
            proposal_id: alertProposal.id,
            proposal_title: alertProposal.title,
            notification_type: 'needs_review',
            current_stage: 'needs_review',
            recipient: member.app_name,
            message: `Low Readiness Alert for ${product.product_name} (${product.overall_readiness_percentage}%). Review proposal and consider initiating Product Readiness Proposal. Critical gaps: ${criticalGaps.map(g => g.category).join(', ') || 'Multiple areas'}`,
            action_required: true,
            timestamp: new Date().toISOString()
          });
        }

        alertsTriggered.push({
          product_id: product.product_id,
          product_name: product.product_name,
          readiness_percentage: product.overall_readiness_percentage,
          proposal_id: alertProposal.id,
          critical_gaps: criticalGaps.length
        });
      }
    }

    return Response.json({
      success: true,
      alerts_triggered: alertsTriggered.length,
      alerts: alertsTriggered,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});