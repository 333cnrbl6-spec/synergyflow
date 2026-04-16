import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, channel_id, message_content, message_type, from_member } = await req.json();

    if (action === 'send_message') {
      const message = await base44.asServiceRole.entities.BoardMessage.create({
        channel_id,
        channel_name: `#${channel_id}`,
        from_member,
        message_content,
        message_type,
        timestamp: new Date().toISOString()
      });
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

    if (action === 'propose_decision') {
      const { decision_title, description, proposed_by, channel_id } = await req.json();
      const decision = await base44.asServiceRole.entities.BoardDecision.create({
        decision_title,
        description,
        proposed_by,
        channel_id,
        status: 'proposed'
      });
      return Response.json({ success: true, decision });
    }

    if (action === 'vote_decision') {
      const { decision_id, member, vote } = await req.json();
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

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});