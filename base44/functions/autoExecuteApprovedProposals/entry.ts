import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all approved proposals
    const approvedProposals = await base44.entities.BoardProposal.filter({ 
      status: 'approved'
    }).catch(() => []);

    if (approvedProposals.length === 0) {
      return Response.json({ 
        status: 'no_proposals',
        message: 'No approved proposals to execute'
      });
    }

    // Separate by execution status
    const inProgress = approvedProposals.filter(p => p.approval_stage === 'passed');
    const notStarted = approvedProposals.filter(p => p.approval_stage !== 'passed');

    let executedCount = 0;
    let actionItemsCreated = 0;

    // Execute proposals that haven't started yet
    for (const proposal of notStarted) {
      try {
        // Create action item for execution
        await base44.entities.ActionItem.create({
          title: `Execute: ${proposal.title}`,
          description: `Auto-execute approved proposal - ${proposal.summary}`,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal.id,
          status: 'in_progress',
          auto_triggered: true,
        }).catch(() => null);

        actionItemsCreated++;

        // Update proposal status to execution stage
        await base44.entities.BoardProposal.update(proposal.id, {
          approval_stage: 'passed',
          approval_history: [
            ...(proposal.approval_history || []),
            {
              stage: 'auto_executed',
              timestamp: new Date().toISOString(),
              reviewed_by: 'Auto-Execution Engine',
              notes: 'Automatically triggered for build execution'
            }
          ]
        }).catch(() => null);

        executedCount++;
      } catch (e) {
        console.error(`Error executing proposal ${proposal.id}:`, e);
      }
    }

    return Response.json({
      status: 'execution_triggered',
      total_approved: approvedProposals.length,
      already_in_progress: inProgress.length,
      newly_executed: executedCount,
      action_items_created: actionItemsCreated,
      execution_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auto-execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});