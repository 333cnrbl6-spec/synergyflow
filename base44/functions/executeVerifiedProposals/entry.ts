import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { proposal_ids } = await req.json().catch(() => ({}));

    // Fetch proposals to execute
    const allApproved = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    const toExecute = proposal_ids && proposal_ids.length > 0 
      ? allApproved.filter(p => proposal_ids.includes(p.id))
      : allApproved;

    const executionResults = {
      started: 0,
      failed: 0,
      details: []
    };

    for (const proposal of toExecute) {
      try {
        // Create action item
        const actionItem = await base44.asServiceRole.entities.ActionItem.create({
          title: `[VERIFIED] Execute: ${proposal.title}`,
          description: `${proposal.proposal_type.toUpperCase()} proposal verified and approved for execution. ${proposal.summary}`,
          category: proposal.proposal_type === 'readiness' ? 'readiness' : 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal.id,
          status: 'in_progress',
          auto_triggered: true
        });

        // Route to handler
        let result = null;
        if (proposal.proposal_type === 'build') {
          result = await base44.asServiceRole.functions.invoke('executeBuildProposal', {
            proposal_id: proposal.id
          }).catch(e => ({ error: e.message }));
        } else if (proposal.proposal_type === 'readiness' && proposal.products_involved?.[0]) {
          result = await base44.asServiceRole.functions.invoke('autoExecuteReadinessPlan', {
            proposal_id: proposal.id,
            product_name: proposal.products_involved[0]
          }).catch(e => ({ error: e.message }));
        } else if (proposal.proposal_type === 'pricing') {
          result = await base44.asServiceRole.functions.invoke('executePricingProposal', {
            proposal_id: proposal.id
          }).catch(e => ({ error: e.message }));
        }

        executionResults.started++;
        executionResults.details.push({
          proposal_id: proposal.id,
          title: proposal.title,
          status: 'execution_initiated',
          action_item_id: actionItem.id
        });
      } catch (error) {
        executionResults.failed++;
        executionResults.details.push({
          proposal_id: proposal.id,
          title: proposal.title,
          status: 'execution_failed',
          error: error.message
        });
      }
    }

    // Notify board
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: 'verified_execution',
        proposal_title: 'Verified Proposals Execution',
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `✓ ${executionResults.started} verified proposal(s) now being executed autonomously.`,
        action_required: false,
        timestamp: new Date().toISOString()
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      execution_summary: executionResults,
      message: 'Verified proposals execution initiated'
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});