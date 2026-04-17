import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id, yes_votes, no_votes, abstain_votes } = body;

    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if vote is unanimous
    const isUnanimous = no_votes.length === 0 && yes_votes.length > 0 && abstain_votes.length === 0;

    if (isUnanimous) {
      // Auto-approve unanimous proposals
      await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
        is_unanimous: true,
        approval_stage: 'passed',
        status: 'approved',
        yes_votes,
        no_votes,
        abstain_votes,
        approval_history: [{
          stage: 'passed',
          timestamp: new Date().toISOString(),
          reviewed_by: 'system_unanimous',
          notes: 'Auto-approved: Unanimous vote'
        }]
      });

      return Response.json({
        success: true,
        message: 'Proposal auto-approved (unanimous vote)',
        isUnanimous: true,
        approval_stage: 'passed'
      });
    } else {
      // Initialize multi-stage approval for non-unanimous
      const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });

      await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
        is_unanimous: false,
        approval_stage: 'needs_review',
        yes_votes,
        no_votes,
        abstain_votes,
        discussion_count: 0,
        approval_history: [{
          stage: 'needs_review',
          timestamp: new Date().toISOString(),
          reviewed_by: 'system',
          notes: `Non-unanimous vote: ${yes_votes.length} yes, ${no_votes.length} no, ${abstain_votes.length} abstain`
        }]
      });

      // Send "Needs Review" notifications
      for (const member of boardMembers) {
        await base44.asServiceRole.entities.ProposalNotification.create({
          proposal_id: proposal_id,
          proposal_title: proposal.title,
          notification_type: 'needs_review',
          current_stage: 'needs_review',
          recipient: member.app_name,
          message: `Proposal "${proposal.title}" requires multi-stage review (non-unanimous vote). Please review the proposal details.`,
          action_required: true,
          timestamp: new Date().toISOString()
        });
      }

      return Response.json({
        success: true,
        message: 'Non-unanimous proposal initialized for multi-stage approval',
        isUnanimous: false,
        approval_stage: 'needs_review',
        notificationsSent: boardMembers.length
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});