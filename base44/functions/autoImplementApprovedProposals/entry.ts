import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only trigger when status or approval_stage changes to approved/passed
    const statusChanged = old_data?.status !== data.status || old_data?.approval_stage !== data.approval_stage;
    if (!statusChanged) {
      return Response.json({ skipped: true, reason: 'no_status_change' });
    }

    const isApproved = data.status === 'approved' || data.approval_stage === 'passed';
    if (!isApproved) {
      return Response.json({ skipped: true, reason: 'not_approved' });
    }

    // Check for majority vote approval (50%+ yes votes)
    const totalVotes = (data.yes_votes?.length || 0) + (data.no_votes?.length || 0) + (data.abstain_votes?.length || 0);
    const yesVotes = data.yes_votes?.length || 0;
    const hasMajority = totalVotes === 0 || (yesVotes / totalVotes) >= 0.5;

    if (!hasMajority) {
      return Response.json({ skipped: true, reason: 'no_majority' });
    }

    // Create action item to track implementation
    const actionItem = await base44.asServiceRole.entities.ActionItem.create({
      title: `Implement: ${data.title}`,
      description: `${data.proposal_type.toUpperCase()} proposal approved and scheduled for implementation. ${data.summary}`,
      category: data.proposal_type === 'readiness' ? 'readiness' : 'proposal',
      priority: data.proposal_type === 'readiness' ? 'critical' : 'high',
      trigger_entity_type: 'BoardProposal',
      trigger_entity_id: event.entity_id,
      status: 'in_progress',
      auto_triggered: true,
      related_product_id: data.products_involved?.[0] || null,
      related_product_name: data.products_involved?.[0] || null
    });

    // Route to specific implementation handlers
    let executionResult = null;

    if (data.proposal_type === 'readiness' && data.products_involved?.[0]) {
      executionResult = await base44.asServiceRole.functions.invoke('autoExecuteReadinessPlan', {
        proposal_id: event.entity_id,
        product_name: data.products_involved[0]
      });
    } else if (data.proposal_type === 'build') {
      executionResult = await base44.asServiceRole.functions.invoke('executeBuildProposal', {
        proposal_id: event.entity_id
      });
    } else if (data.proposal_type === 'pricing') {
      executionResult = await base44.asServiceRole.functions.invoke('executePricingProposal', {
        proposal_id: event.entity_id
      });
    } else if (data.proposal_type === 'go_to_market') {
      executionResult = await base44.asServiceRole.functions.invoke('executeGoToMarketProposal', {
        proposal_id: event.entity_id
      });
    }

    // Update proposal to reflect implementation start
    await base44.asServiceRole.entities.BoardProposal.update(event.entity_id, {
      status: 'approved',
      approval_history: [
        ...(data.approval_history || []),
        {
          stage: 'implementation_started',
          timestamp: new Date().toISOString(),
          reviewed_by: 'system',
          notes: 'Automated implementation initiated'
        }
      ]
    });

    // Notify board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: event.entity_id,
        proposal_title: data.title,
        notification_type: 'passed',
        current_stage: 'implementation',
        recipient: member.app_name,
        message: `✓ Approved proposal is now being implemented: ${data.title}. Implementation reference: ${actionItem.id}`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      proposal_id: event.entity_id,
      action_item_id: actionItem.id,
      proposal_type: data.proposal_type,
      status: 'implementation_started',
      execution_result: executionResult,
      message: `${data.proposal_type} proposal approved and implementation started`
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});