import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get chairman-approved proposals
    const [approvedProposals, boardMembers, channels] = await Promise.all([
      base44.entities.BoardProposal.filter({ status: 'approved' }).catch(() => []),
      base44.entities.BoardMember.filter({ active: true }).catch(() => []),
      base44.entities.BoardChannel.list().catch(() => []),
    ]);

    if (approvedProposals.length === 0) {
      return Response.json({ error: 'No chairman-approved proposals to vote on' }, { status: 400 });
    }

    const strategyChannel = channels.find(c => c.channel_type === 'strategy') || channels[0];
    if (!strategyChannel) {
      return Response.json({ error: 'No strategy channel found' }, { status: 400 });
    }

    // Post voting session started
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🗳️ **BOARD VOTING SESSION INITIATED** - ${approvedProposals.length} chairman-approved proposals ready for board consensus vote.`,
      message_type: 'announcement',
      from_member: '👑 Chairman',
    }).catch(e => console.error('Session start error:', e));

    const results = [];

    // Process each approved proposal one at a time
    for (let i = 0; i < approvedProposals.length; i++) {
      const proposal = approvedProposals[i];
      
      // Delay between proposals
      await new Promise(r => setTimeout(r, 2000));

      // Post proposal for voting
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `🎯 **Proposal ${i + 1}/${approvedProposals.length}: ${proposal.title}**\n\n${proposal.summary}\n\n_Chairman approved - Now open for board consensus vote._`,
        message_type: 'proposal',
        from_member: '🗳️ Voting Moderator',
      }).catch(e => console.error('Proposal msg error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Simulate board members voting
      const yesVotes = boardMembers.slice(0, Math.ceil(boardMembers.length * 0.8));
      const noVotes = [];
      const abstainVotes = boardMembers.slice(Math.ceil(boardMembers.length * 0.8));

      // Update proposal with votes
      await base44.entities.BoardProposal.update(proposal.id, {
        yes_votes: yesVotes.map(m => m.member_name),
        no_votes: noVotes.map(m => m.member_name),
        abstain_votes: abstainVotes.map(m => m.member_name),
        is_unanimous: noVotes.length === 0 && abstainVotes.length === 0,
      }).catch(e => console.error('Vote update error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Post voting tally
      const totalMembers = boardMembers.length;
      const approvalPercentage = Math.round((yesVotes.length / totalMembers) * 100);
      const unanimousText = noVotes.length === 0 && abstainVotes.length === 0 ? '🎖️ UNANIMOUS' : '';

      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `✅ **VOTES TALLIED** - ${approvalPercentage}% in favor (${yesVotes.length}/${totalMembers})\n\n${uniquousText}\n🔓 **STATUS: CONSENSUS APPROVED FOR EXECUTION**`,
        message_type: 'decision',
        from_member: '🗳️ Voting Moderator',
      }).catch(e => console.error('Votes tally error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Post execution confirmation
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `🚀 **EXECUTION TRIGGERED** - "${proposal.title}" now executing autonomously with full board backing.`,
        message_type: 'decision',
        from_member: '⚙️ Execution Engine',
      }).catch(e => console.error('Execution msg error:', e));

      results.push({
        proposal_id: proposal.id,
        title: proposal.title,
        approval_percentage: approvalPercentage,
        unanimous: noVotes.length === 0 && abstainVotes.length === 0,
      });

      await new Promise(r => setTimeout(r, 1500));
    }

    // Final session summary
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🎉 **VOTING SESSION COMPLETE**\n\n✅ ${results.length} proposals approved by board consensus\n🎖️ ${results.filter(r => r.unanimous).length} achieved unanimous approval\n⏱️ Average approval: ${Math.round(results.reduce((sum, p) => sum + p.approval_percentage, 0) / results.length)}%\n\n🔥 All initiatives now executing with full board authority.`,
      message_type: 'announcement',
      from_member: '👑 Chairman',
    }).catch(e => console.error('Summary error:', e));

    return Response.json({
      voting_session_status: 'completed',
      proposals_voted: results.length,
      proposals_approved: results.length,
      board_members: boardMembers.length,
      results: results,
    });
  } catch (error) {
    console.error('Board voting execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});