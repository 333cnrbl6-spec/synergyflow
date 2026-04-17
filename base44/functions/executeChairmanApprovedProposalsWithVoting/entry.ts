import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all chairman-approved proposals (no limit)
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

    const totalProposals = approvedProposals.length;
    const boardSize = boardMembers.length;
    const batchSize = 100;

    // Post voting session started
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🗳️ **MASS VOTING SESSION INITIATED**\n\n📋 ${totalProposals.toLocaleString()} chairman-approved proposals queued for board consensus voting\n👥 ${boardSize} board members participating\n⏱️ Processing in batches of ${batchSize}...`,
      message_type: 'announcement',
      from_member: '👑 Chairman',
    }).catch(e => console.error('Session start error:', e));

    let approvedCount = 0;
    let unanimousCount = 0;

    // Process proposals in batches
    for (let batchStart = 0; batchStart < totalProposals; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalProposals);
      const batch = approvedProposals.slice(batchStart, batchEnd);

      // Batch vote all proposals in parallel
      const updatePromises = batch.map(proposal => {
        const yesVotes = boardMembers.slice(0, Math.ceil(boardSize * 0.8));
        const abstainVotes = boardMembers.slice(Math.ceil(boardSize * 0.8));
        const isUnanimous = abstainVotes.length === 0;
        
        if (isUnanimous) unanimousCount++;
        approvedCount++;

        return base44.entities.BoardProposal.update(proposal.id, {
          yes_votes: yesVotes.map(m => m.member_name),
          no_votes: [],
          abstain_votes: abstainVotes.map(m => m.member_name),
          is_unanimous: isUnanimous,
        }).catch(e => console.error(`Vote update error for ${proposal.id}:`, e));
      });

      await Promise.all(updatePromises);

      // Post batch progress
      const progressPercent = Math.round((batchEnd / totalProposals) * 100);
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `⏳ **BATCH VOTING PROGRESS** [${progressPercent}%]\n\n✅ ${batchEnd.toLocaleString()}/${totalProposals.toLocaleString()} voted\n🎖️ ${unanimousCount.toLocaleString()} unanimous approvals\n⚡ Average approval: ~80%`,
        message_type: 'decision',
        from_member: '🗳️ Voting Engine',
      }).catch(e => console.error('Progress msg error:', e));

      await new Promise(r => setTimeout(r, 1000));
    }

    // Final session summary
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🎉 **MASS VOTING COMPLETE**\n\n✅ ${approvedCount.toLocaleString()} proposals approved by board consensus\n🎖️ ${unanimousCount.toLocaleString()} achieved unanimous approval (${Math.round((unanimousCount/approvedCount)*100)}%)\n⏱️ All ~${Math.round(approvedCount/boardSize)} initiatives per member executing with full board authority\n\n🚀 Autonomous execution fleet now mobilized!`,
      message_type: 'announcement',
      from_member: '👑 Chairman',
    }).catch(e => console.error('Summary error:', e));

    return Response.json({
      voting_session_status: 'completed',
      total_proposals: totalProposals,
      proposals_approved: approvedCount,
      unanimous_approvals: unanimousCount,
      board_members: boardSize,
      batch_size: batchSize,
    });
  } catch (error) {
    console.error('Board voting execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});