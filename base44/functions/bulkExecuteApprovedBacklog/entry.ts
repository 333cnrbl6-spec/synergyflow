import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all approved proposals
    const approvedProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    console.log(`Found ${approvedProposals.length} approved proposals to execute`);

    let executedCount = 0;
    let actionItemsCreated = 0;

    // Process in batches
    for (let i = 0; i < approvedProposals.length; i++) {
      const proposal = approvedProposals[i];

      try {
        // Check if action item already exists for this proposal
        const existingActions = await base44.asServiceRole.entities.ActionItem.filter({
          trigger_entity_id: proposal.id
        });

        if (existingActions.length === 0) {
          // Create action item for execution
          await base44.asServiceRole.entities.ActionItem.create({
            title: `Execute: ${proposal.title}`,
            description: proposal.summary,
            category: proposal.proposal_type === 'build' ? 'revenue' : proposal.proposal_type,
            priority: 'high',
            trigger_entity_type: 'BoardProposal',
            trigger_entity_id: proposal.id,
            related_product_id: proposal.products_involved?.[0] || null,
            status: 'in_progress',
            implementation_status: 'in_progress',
            auto_triggered: true
          });
          actionItemsCreated++;
        } else if (existingActions[0].status !== 'in_progress' && existingActions[0].status !== 'completed') {
          // Update existing to in_progress
          await base44.asServiceRole.entities.ActionItem.update(existingActions[0].id, {
            status: 'in_progress',
            implementation_status: 'in_progress'
          });
          actionItemsCreated++;
        }

        executedCount++;

        // Batch delay every 20 items
        if (i % 20 === 19) await sleep(400);
      } catch (itemError) {
        console.error(`Failed to execute proposal ${proposal.id}:`, itemError);
      }
    }

    // Announce bulk execution
    try {
      await base44.asServiceRole.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: 'strategy',
        message_content: `🚀 BULK EXECUTION TRIGGERED: ${executedCount} approved proposals now executing. ${actionItemsCreated} new build actions queued across teams.`,
        message_type: 'announcement',
        from_member: 'Execution Engine'
      });
    } catch (commError) {
      console.error('Communication error:', commError);
    }

    return Response.json({
      success: true,
      executed_proposals: executedCount,
      action_items_created: actionItemsCreated,
      message: `${executedCount} approved proposals triggered for execution`
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});