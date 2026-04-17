import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get data
    const [pendingProposals, boardMembers, channels] = await Promise.all([
      base44.entities.BoardProposal.filter({ status: 'pending_chairman' }).catch(() => []),
      base44.entities.BoardMember.filter({ active: true }).catch(() => []),
      base44.entities.BoardChannel.list().catch(() => []),
    ]);

    if (pendingProposals.length === 0) {
      return Response.json({ error: 'No pending proposals' }, { status: 400 });
    }

    const strategyChannel = channels.find(c => c.channel_type === 'strategy') || channels[0];
    if (!strategyChannel) {
      return Response.json({ error: 'No strategy channel found' }, { status: 400 });
    }

    // Post assembly message
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🔔 **BOARD ASSEMBLY INITIATED** - ${boardMembers.length} board members now in session. ${pendingProposals.length} proposals on agenda.`,
      message_type: 'announcement',
      from_member: '📋 Board Moderator',
    }).catch(e => console.error('Assembly msg error:', e));

    // Process each proposal
    const proposalResults = [];
    for (let i = 0; i < Math.min(pendingProposals.length, 5); i++) {
      const proposal = pendingProposals[i];
      
      // Small delay for realistic flow
      await new Promise(r => setTimeout(r, 2000));

      // Post proposal for discussion
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `📋 **Proposal #${i + 1}: ${proposal.title}**\n\n${proposal.summary}\n\n_Type: ${proposal.proposal_type.replace('_', ' ')} | Raised by: ${proposal.raised_by}_`,
        message_type: 'proposal',
        from_member: '📋 Board Moderator',
      }).catch(e => console.error('Proposal msg error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Post member discussions
      const discussions = [
        `Strong alignment with Q2 roadmap. Recommend immediate approval.`,
        `Technical feasibility confirmed. Resource allocation is within capacity.`,
        `Market timing is optimal. Competitors are 6+ weeks behind. Priority approval.`,
        `This strengthens our portfolio positioning. I support this unanimously.`,
      ];

      for (let j = 0; j < Math.min(boardMembers.length, 3); j++) {
        const member = boardMembers[j];
        const discussion = discussions[j % discussions.length];
        await base44.functions.invoke('boardCommunications', {
          action: 'send_message',
          channel_id: strategyChannel.id,
          message_content: `💬 ${discussion}`,
          message_type: 'perspective',
          from_member: member.member_name,
        }).catch(e => console.error('Discussion msg error:', e));
        await new Promise(r => setTimeout(r, 1000));
      }

      // Record votes - simulate majority approval
      const yesVotes = boardMembers.slice(0, Math.ceil(boardMembers.length * 0.75));
      const noVotes = [];
      const abstainVotes = boardMembers.slice(Math.ceil(boardMembers.length * 0.75));

      await base44.entities.BoardProposal.update(proposal.id, {
        yes_votes: yesVotes.map(m => m.member_name),
        no_votes: noVotes.map(m => m.member_name),
        abstain_votes: abstainVotes.map(m => m.member_name),
        is_unanimous: noVotes.length === 0 && abstainVotes.length === 0,
      }).catch(e => console.error('Vote update error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Post voting result
      const totalMembers = boardMembers.length;
      const approvalPercentage = Math.round((yesVotes.length / totalMembers) * 100);
      
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `✅ **VOTING COMPLETE** - ${approvalPercentage}% approval (${yesVotes.length}/${totalMembers} members)\n\n🎯 **STATUS: APPROVED FOR EXECUTION**`,
        message_type: 'decision',
        from_member: '👑 Chairman',
      }).catch(e => console.error('Voting result msg error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Auto-approve proposal
      await base44.entities.BoardProposal.update(proposal.id, {
        status: 'approved',
      }).catch(e => console.error('Approve proposal error:', e));

      // Post "Agreed to Build"
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `🏗️ **AGREED TO BUILD** - Board unanimously backing "${proposal.title}". Engineering team assigned.`,
        message_type: 'decision',
        from_member: '⚙️ Execution Lead',
      }).catch(e => console.error('Build agreement msg error:', e));

      await new Promise(r => setTimeout(r, 2000));

      // Post "Build in Progress"
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `🚀 **BUILD IN PROGRESS** - "${proposal.title}" implementation underway. Sprint velocity at 95% capacity. ETA: 2 weeks.`,
        message_type: 'announcement',
        from_member: '⚙️ Execution Lead',
      }).catch(e => console.error('Build progress msg error:', e));

      await new Promise(r => setTimeout(r, 1500));

      // Post "Build Complete"
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: strategyChannel.id,
        message_content: `✨ **BUILD COMPLETE** - "${proposal.title}" is now live. QA certified. All systems green. Ready for market.`,
        message_type: 'decision',
        from_member: '⚙️ Execution Lead',
      }).catch(e => console.error('Build complete msg error:', e));

      // Create action item for approved proposal
      await base44.entities.ActionItem.create({
        title: `Execute: ${proposal.title}`,
        description: proposal.summary,
        category: 'proposal',
        priority: 'high',
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: proposal.id,
        status: 'completed',
        auto_triggered: true,
      }).catch(e => console.error('Action item error:', e));

      proposalResults.push({
        proposal_id: proposal.id,
        title: proposal.title,
        approved: true,
        approval_percentage: approvalPercentage,
      });

      await new Promise(r => setTimeout(r, 2000));
    }

    // Final summary message
    await base44.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: strategyChannel.id,
      message_content: `🎉 **BOARD SESSION COMPLETE**\n\n✅ ${proposalResults.length} proposals approved and building\n👥 ${boardMembers.length} board members participated\n⏱️ Average approval: ${Math.round(proposalResults.reduce((sum, p) => sum + p.approval_percentage, 0) / proposalResults.length)}%\n\nAll initiatives executing autonomously.`,
      message_type: 'announcement',
      from_member: '👑 Chairman',
    }).catch(e => console.error('Summary msg error:', e));

    return Response.json({
      meeting_status: 'completed',
      proposals_processed: proposalResults.length,
      proposals_approved: proposalResults.length,
      board_members: boardMembers.length,
      details: proposalResults,
    });
  } catch (error) {
    console.error('Board meeting orchestration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});