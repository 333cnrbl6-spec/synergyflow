import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    const proposal = data;
    const oldStatus = old_data?.status;
    const newStatus = proposal?.status;

    // Only notify on transitions to 'in_progress' or 'completed'
    if (newStatus !== 'in_progress' && newStatus !== 'completed') {
      return Response.json({ notified: 0 });
    }

    // Fetch board members to notify
    const boardMembers = await base44.entities.BoardMember.list();
    const activeMembers = boardMembers.filter(m => m.active);

    // Determine notification type and message
    let notificationType = newStatus === 'in_progress' ? 'needs_review' : 'passed';
    let message = '';

    if (newStatus === 'in_progress') {
      message = `Proposal "${proposal.title}" is now being implemented. Monitor progress in the Implementation Timeline.`;
    } else if (newStatus === 'completed') {
      message = `Proposal "${proposal.title}" has been successfully completed and deployed.`;
      notificationType = 'passed';
    }

    // Create notifications for all active board members
    const notifications = activeMembers.map(member => ({
      proposal_id: proposal.id,
      proposal_title: proposal.title,
      notification_type: notificationType,
      current_stage: newStatus,
      recipient: member.member_name,
      message: message,
      action_required: newStatus === 'in_progress',
      read: false,
      timestamp: new Date().toISOString(),
    }));

    // Bulk create notifications
    if (notifications.length > 0) {
      await base44.entities.ProposalNotification.bulkCreate(notifications);
    }

    return Response.json({
      notified: notifications.length,
      status: newStatus,
      proposal_title: proposal.title,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});