import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { proposal_id, urgency_reason, priority } = await req.json();

    // Fetch proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.filter({ id: proposal_id });
    if (!proposal || proposal.length === 0) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const proposalData = proposal[0];

    // Get board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });

    // Send urgent alerts
    const notifications = [];
    for (const member of boardMembers) {
      const notification = await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: proposal_id,
        proposal_title: proposalData.title,
        notification_type: 'discussion_required',
        current_stage: 'discussion_required',
        recipient: member.app_name,
        message: `🚨 URGENT: "${proposalData.title}" requires immediate attention. Reason: ${urgency_reason}`,
        action_required: true,
        timestamp: new Date().toISOString()
      });
      notifications.push(notification.id);
    }

    return Response.json({
      success: true,
      proposal_id: proposal_id,
      urgency_reason: urgency_reason,
      notifications_sent: notifications.length
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});