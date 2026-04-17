import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { proposal_id } = await req.json();

    if (!proposal_id) {
      return Response.json({ error: 'Missing proposal_id' }, { status: 400 });
    }

    // Get proposal details
    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Get all admin users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const adminUsers = users.filter(u => u.role === 'admin');

    // Send notification email to each admin
    const emailPromises = adminUsers.map(admin =>
      base44.integrations.Core.SendEmail({
        to: admin.email,
        from_name: 'Board Chairman Zone',
        subject: `🔔 New Board Proposal: ${proposal.title}`,
        body: `A new proposal awaits your review in the Chairman's Zone.

PROPOSAL: ${proposal.title}
TYPE: ${proposal.proposal_type}
RAISED BY: ${proposal.raised_by}
SUMMARY: ${proposal.summary}

Log in to ChairmanZone to review and decide.

Action Required: Approve, Defer, or Reject`
      })
    );

    await Promise.all(emailPromises);

    // Store notification records
    const notifications = adminUsers.map(admin => ({
      from_member: proposal.raised_by,
      to_member: admin.full_name,
      channel_id: proposal.channel_id,
      channel_name: proposal.channel_name,
      message_id: proposal_id,
      message_preview: proposal.summary,
      read: false
    }));

    await base44.asServiceRole.entities.BoardNotification.bulkCreate(notifications);

    return Response.json({
      success: true,
      notified_count: adminUsers.length,
      proposal_id
    });
  } catch (error) {
    console.error('Error notifying chairman:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});