import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, channel_id, message_content, message_type, from_member } = body;

    if (action === 'send_message') {
      const message = await base44.asServiceRole.entities.BoardMessage.create({
        channel_id,
        channel_name: `#${channel_id}`,
        from_member,
        message_content,
        message_type,
        timestamp: new Date().toISOString()
      });

      // Get channel to find members to notify
      const channel = await base44.asServiceRole.entities.BoardChannel.get(channel_id);
      
      // Create notifications for all other members
      if (channel && channel.members) {
        const notificationPromises = channel.members
          .filter(member => member !== from_member)
          .map(member =>
            base44.asServiceRole.entities.BoardNotification.create({
              channel_id,
              channel_name: channel.display_name,
              message_id: message.id,
              from_member,
              to_member: member,
              message_preview: message_content.substring(0, 100),
              timestamp: new Date().toISOString()
            })
          );
        
        await Promise.all(notificationPromises);
      }

      return Response.json({ success: true, message });
    }

    if (action === 'get_channel_messages') {
      const messages = await base44.asServiceRole.entities.BoardMessage.filter(
        { channel_id },
        '-timestamp',
        100
      );
      return Response.json({ success: true, messages });
    }

    if (action === 'get_notifications') {
      const member = user.full_name;
      const notifications = await base44.asServiceRole.entities.BoardNotification.filter(
        { to_member: member, read: false },
        '-timestamp',
        50
      );
      return Response.json({ success: true, notifications });
    }

    if (action === 'mark_notification_read') {
      const { notification_id } = body;
      await base44.asServiceRole.entities.BoardNotification.update(notification_id, {
        read: true
      });
      return Response.json({ success: true });
    }

    if (action === 'propose_decision') {
      const { decision_title, description, proposed_by, channel_id: decisionChannelId } = body;
      const decision = await base44.asServiceRole.entities.BoardDecision.create({
        decision_title,
        description,
        proposed_by,
        channel_id: decisionChannelId,
        status: 'proposed'
      });
      return Response.json({ success: true, decision });
    }

    if (action === 'vote_decision') {
      const { decision_id, member, vote } = body;
      const decision = await base44.asServiceRole.entities.BoardDecision.get(decision_id);
      
      if (!decision.voting_results) {
        decision.voting_results = { yes_votes: [], no_votes: [], abstain_votes: [] };
      }

      const voteKey = vote === 'yes' ? 'yes_votes' : vote === 'no' ? 'no_votes' : 'abstain_votes';
      if (!decision.voting_results[voteKey].includes(member)) {
        decision.voting_results[voteKey].push(member);
      }

      await base44.asServiceRole.entities.BoardDecision.update(decision_id, {
        voting_results: decision.voting_results
      });

      return Response.json({ success: true, voting_results: decision.voting_results });
    }

    if (action === 'get_proposals') {
      const proposals = await base44.asServiceRole.entities.BoardProposal.list('-timestamp', 50);
      return Response.json({ success: true, proposals });
    }

    if (action === 'chairman_review') {
      const { proposal_id, status, chairman_notes } = body;
      await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
        status,
        chairman_notes: chairman_notes || ''
      });
      // Post a message to the channel about the decision
      const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
      const statusLabel = status === 'approved' ? '✅ APPROVED' : status === 'rejected' ? '❌ REJECTED' : '⏸ DEFERRED';
      await base44.asServiceRole.entities.BoardMessage.create({
        channel_id: proposal.channel_id,
        channel_name: proposal.channel_name,
        from_member: '👑 Chairman',
        message_content: `${statusLabel}: "${proposal.title}"${chairman_notes ? ` — ${chairman_notes}` : ''}`,
        message_type: 'decision',
        timestamp: new Date().toISOString()
      });
      return Response.json({ success: true });
    }

    if (action === 'submit_proposal') {
      const { title, summary, raised_by, proposal_type, products_involved } = body;
      const proposal = await base44.asServiceRole.entities.BoardProposal.create({
        title,
        summary,
        raised_by,
        channel_id,
        channel_name: '',
        proposal_type: proposal_type || 'build',
        products_involved: products_involved || [],
        status: 'pending_chairman',
        timestamp: new Date().toISOString()
      });
      return Response.json({ success: true, proposal });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});