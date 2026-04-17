import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { coordination_proposal_id } = body;

    const coordinationProposal = await base44.asServiceRole.entities.BoardProposal.get(coordination_proposal_id);
    if (!coordinationProposal || coordinationProposal.approval_stage !== 'passed') {
      return Response.json({ error: 'Invalid proposal or not in passed state' }, { status: 400 });
    }

    // Get all related initiatives
    const allProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      proposal_type: 'build',
      channel_id: 'cross-product-initiatives'
    });

    // Mark all as approved/execution ready
    const executionReadyItems = [];
    for (const proposal of allProposals) {
      if (proposal.id !== coordination_proposal_id) {
        await base44.asServiceRole.entities.BoardProposal.update(proposal.id, {
          status: 'approved',
          approval_stage: 'passed',
          approval_history: [
            ...(proposal.approval_history || []),
            {
              stage: 'execution_ready',
              timestamp: new Date().toISOString(),
              reviewed_by: 'system_auto_execute',
              notes: 'Auto-approved via coordination proposal unanimous vote'
            }
          ]
        });

        executionReadyItems.push({
          id: proposal.id,
          title: proposal.title,
          products: proposal.products_involved
        });
      }
    }

    // Create execution action items for each initiative
    const actionItems = [];
    for (const item of executionReadyItems) {
      const actionItem = await base44.asServiceRole.entities.ActionItem.create({
        title: `[Execution Ready] ${item.title}`,
        description: `Cross-product build initiative approved for immediate development. Products: ${item.products.join(', ')}`,
        category: 'proposal',
        priority: 'high',
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: item.id,
        status: 'in_progress',
        due_date: getExecutionDeadline(),
        auto_triggered: true
      });

      actionItems.push(actionItem.id);
    }

    // Notify board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: coordination_proposal_id,
        proposal_title: coordinationProposal.title,
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `${executionReadyItems.length} cross-product BUILD initiatives APPROVED for execution. All proposals marked as Execution Ready.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      message: 'All initiatives marked as Execution Ready',
      coordination_proposal_id,
      initiatives_approved: executionReadyItems.length,
      action_items_created: actionItems.length,
      execution_deadline: getExecutionDeadline()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getExecutionDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 14); // 2-week execution window
  return date.toISOString().split('T')[0];
}