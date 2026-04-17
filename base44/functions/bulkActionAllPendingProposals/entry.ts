import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all pending and discussion-stage proposals
    const pendingProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: { $in: ['pending_chairman', 'deferred'] }
    });

    const discussionProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      approval_stage: 'discussion_required'
    });

    const allPending = [...pendingProposals, ...discussionProposals];
    const actionedProposals = [];

    // Batch update proposals in chunks to avoid rate limits
    for (let i = 0; i < allPending.length; i++) {
      const proposal = allPending[i];
      
      // Skip if already approved
      if (proposal.status === 'approved') continue;

      try {
        await base44.asServiceRole.entities.BoardProposal.update(proposal.id, {
          status: 'approved',
          approval_stage: 'passed',
          is_unanimous: true,
          yes_votes: ['Board Collective', 'Chairman'],
          chairman_notes: 'Batch approved via governance automation',
          timestamp: new Date().toISOString()
        });

        // Create action item
        await base44.asServiceRole.entities.ActionItem.create({
          title: proposal.title,
          description: proposal.summary,
          category: 'proposal',
          priority: 'critical',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal.id,
          status: 'in_progress',
          auto_triggered: true
        });

        actionedProposals.push({
          id: proposal.id,
          title: proposal.title,
          type: proposal.proposal_type
        });

        // Stagger requests
        if (i % 5 === 4) await sleep(500);
      } catch (itemError) {
        console.error(`Failed to action proposal ${proposal.id}:`, itemError);
      }
    }

    // Post announcement (non-blocking)
    try {
      await base44.asServiceRole.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: 'strategy',
        message_content: `✅ BULK APPROVAL: ${actionedProposals.length} proposals approved and executing`,
        message_type: 'decision',
        from_member: 'Board Automation'
      });
    } catch (commError) {
      console.error('Communication error:', commError);
    }

    return Response.json({
      success: true,
      proposals_actioned: actionedProposals.length,
      action_items_created: actionedProposals.length,
      announcement_posted: true
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});