import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all pending valuation proposals
    const proposals = await base44.entities.ValuationProposal.filter({
      status: 'proposed'
    });

    if (proposals.length === 0) {
      return Response.json({ 
        message: 'No pending valuation proposals to discuss',
        proposals_initiated: 0 
      });
    }

    // Get board members for notification
    const boardMembers = await base44.entities.BoardMember.list();

    // Post message to board strategy channel
    await base44.entities.BoardMessage.create({
      channel_id: 'strategy',
      channel_name: '#strategy',
      from_member: user.full_name,
      message_content: `🗳️ **Valuation Consensus Discussion Initiated**

Board members, we have ${proposals.length} valuation proposal(s) awaiting your vote and discussion:

${proposals.map((p, i) => `**${i + 1}. ${p.title}** (Proposed by ${p.proposed_by})
   - Total Individual Value: £${(p.products.reduce((sum, prod) => sum + (prod.annual_revenue_potential * prod.valuation_multiple / 1000000), 0)).toLocaleString()}M
   - Suite Premium: ${p.suite_premium_percentage}%
   - Status: Awaiting votes`).join('\n\n')}

**Please review and vote:**
- ✅ Approve valuations if you agree with the methodology and numbers
- ❌ Reject if you have concerns
- 💬 Use thread discussions to debate assumptions and multiples

Goal: Reach consensus on portfolio valuations for investor presentations and strategic planning.`,
      message_type: 'proposal'
    });

    // Create notifications for all board members
    const notifications = await Promise.all(
      boardMembers.map(member => 
        base44.entities.ProposalNotification.create({
          proposal_id: proposals[0]?.id,
          proposal_title: `${proposals.length} Valuation Proposal(s) Need Your Vote`,
          notification_type: 'needs_review',
          current_stage: 'voting',
          recipient: member.app_name,
          message: `Board valuations are ready for discussion and voting. Please review the ${proposals.length} proposal(s) and cast your vote in the strategy channel.`,
          action_required: true
        })
      )
    );

    return Response.json({
      message: 'Valuation consensus process initiated',
      proposals_opened_for_voting: proposals.length,
      board_members_notified: notifications.length,
      discussion_channel: '#strategy'
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});