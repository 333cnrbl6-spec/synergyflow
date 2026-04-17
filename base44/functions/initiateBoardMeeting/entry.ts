import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending proposals and board members
    const [pendingProposals, boardMembers, channels] = await Promise.all([
      base44.entities.BoardProposal.filter({ status: 'pending_chairman' }).catch(() => []),
      base44.entities.BoardMember.filter({ active: true }).catch(() => []),
      base44.entities.BoardChannel.list().catch(() => []),
    ]);

    if (pendingProposals.length === 0) {
      return Response.json({ error: 'No pending proposals to discuss' }, { status: 400 });
    }

    // Create board meeting record
    const meeting = await base44.entities.BoardMeeting.create({
      title: `Board Meeting - ${new Date().toLocaleDateString()}`,
      called_by: user.email,
      attendees: boardMembers.map(m => m.member_name),
      status: 'in_progress',
      meeting_date: new Date().toISOString(),
      agenda_items: pendingProposals.slice(0, 5).map(p => ({
        topic: p.title,
        priority: 'high',
        description: p.summary,
      })),
      discussion_threads: [],
      decisions: [],
      notes: 'Auto-initiated board meeting for consensus voting',
    });

    // Get primary strategy channel
    const strategyChannel = channels.find(c => c.channel_type === 'strategy') || channels[0];

    // Post opening announcement
    const openingMsg = await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel?.id,
      message_content: `🔔 **Board Meeting Initiated** - ${pendingProposals.length} proposals up for discussion. Members are reviewing and will share perspectives.`,
      message_type: 'announcement',
      from_member: '📋 Board Collective',
    });

    // Trigger async board member responses
    const discussionPromises = pendingProposals.slice(0, 3).map(async (proposal, index) => {
      // Small delay between member responses for realistic flow
      await new Promise(r => setTimeout(r, index * 1000));

      const perspectives = [
        `This aligns well with our product roadmap. I recommend approval.`,
        `We need to consider the market timing carefully. Let's discuss implementation timeline.`,
        `Strong proposal. The technical architecture is solid. Ready to proceed.`,
        `Good initiative. Suggest we add resource planning before execution.`,
      ];

      const randomMember = boardMembers[Math.floor(Math.random() * boardMembers.length)];
      const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];

      try {
        await base44.functions.invoke('boardCommunications', {
          action: 'send_message',
          channel_id: strategyChannel?.id,
          message_content: `**Regarding: ${proposal.title}** - ${randomPerspective}`,
          message_type: 'perspective',
          from_member: randomMember?.member_name || 'Board Member',
        });
      } catch (e) {
        console.error('Error posting member response:', e);
      }
    });

    await Promise.all(discussionPromises);

    // Record votes for proposals
    const votingPromises = pendingProposals.slice(0, 3).map(async (proposal) => {
      try {
        // Simulate majority voting
        const votes = boardMembers.slice(0, Math.ceil(boardMembers.length * 0.7));
        await base44.entities.BoardProposal.update(proposal.id, {
          yes_votes: votes.map(m => m.member_name),
          no_votes: [],
          abstain_votes: boardMembers.slice(Math.ceil(boardMembers.length * 0.7)).map(m => m.member_name),
          is_unanimous: votes.length === boardMembers.length,
        });
      } catch (e) {
        console.error('Error recording votes:', e);
      }
    });

    await Promise.all(votingPromises);

    // Post voting results
    setTimeout(async () => {
      try {
        const approvedCount = pendingProposals.slice(0, 3).filter(p => {
          const totalMembers = boardMembers.length;
          return Math.ceil(totalMembers * 0.7) > totalMembers / 2;
        }).length;

        await base44.functions.invoke('boardCommunications', {
          action: 'send_message',
          channel_id: strategyChannel?.id,
          message_content: `✅ **Voting Complete** - ${approvedCount} proposals approved by board consensus. Initiating autonomous execution now.`,
          message_type: 'decision',
          from_member: '👑 Chairman',
        });

        // Auto-approve proposals with majority
        for (const proposal of pendingProposals.slice(0, 3)) {
          const totalMembers = boardMembers.length;
          if (Math.ceil(totalMembers * 0.7) > totalMembers / 2) {
            await base44.entities.BoardProposal.update(proposal.id, {
              status: 'approved',
            });
          }
        }
      } catch (e) {
        console.error('Error posting voting results:', e);
      }
    }, 5000);

    return Response.json({
      meeting_id: meeting.id,
      proposals_discussed: pendingProposals.slice(0, 3).length,
      board_members: boardMembers.length,
      message: 'Board meeting initiated with real-time dialogue',
    });
  } catch (error) {
    console.error('Error initiating board meeting:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});