import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Detect vote passage: approval_stage changed to 'passed' or status changed to 'approved'
    const statusChanged = old_data?.approval_stage !== data.approval_stage || old_data?.status !== data.status;
    const isPassed = data.approval_stage === 'passed' || data.status === 'approved';

    if (!statusChanged || !isPassed) {
      return Response.json({ skipped: true });
    }

    // Calculate vote summary
    const yesVotes = data.yes_votes?.length || 0;
    const noVotes = data.no_votes?.length || 0;
    const abstainVotes = data.abstain_votes?.length || 0;
    const totalVotes = yesVotes + noVotes + abstainVotes;

    // Get all board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });

    // Notify all board members of vote passage
    const notifications = [];
    for (const member of boardMembers) {
      const notification = await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: event.entity_id,
        proposal_title: data.title,
        notification_type: 'passed',
        current_stage: 'passed',
        recipient: member.app_name,
        message: `✅ Proposal passed: "${data.title}". Vote: ${yesVotes} yes, ${noVotes} no, ${abstainVotes} abstain. Ready for execution.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
      notifications.push(notification.id);
    }

    return Response.json({
      success: true,
      proposal_id: event.entity_id,
      vote_summary: { yesVotes, noVotes, abstainVotes, totalVotes },
      notifications_sent: notifications.length
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});