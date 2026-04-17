import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only trigger on new proposal creation
    if (event.type !== 'create') {
      return Response.json({ skipped: true });
    }

    // Get board members from the proposal's channel
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    const channel = await base44.asServiceRole.entities.BoardChannel.filter({
      channel_name: data.channel_id
    });

    const channelMembers = channel[0]?.members || [];
    const notifyTo = boardMembers.filter(m => channelMembers.includes(m.app_name));

    // Create notifications for relevant board members
    const notifications = [];
    for (const member of notifyTo) {
      const notification = await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: event.entity_id,
        proposal_title: data.title,
        notification_type: 'needs_review',
        current_stage: 'needs_review',
        recipient: member.app_name,
        message: `📋 New proposal from ${data.raised_by}: "${data.title}" requires your review.`,
        action_required: true,
        timestamp: new Date().toISOString()
      });
      notifications.push(notification.id);
    }

    return Response.json({
      success: true,
      proposal_id: event.entity_id,
      notifications_sent: notifications.length,
      notification_ids: notifications
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});