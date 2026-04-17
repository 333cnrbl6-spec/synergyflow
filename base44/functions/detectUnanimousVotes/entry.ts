import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all pending proposals
    const pendingProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'pending_chairman'
    });

    if (!pendingProposals || pendingProposals.length === 0) {
      return Response.json({ message: 'No pending proposals' });
    }

    // Get all board members to count voting population
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    const totalBoardMembers = boardMembers?.length || 0;

    const executedProposals = [];

    for (const proposal of pendingProposals) {
      try {
        // Get related board messages/votes (checking if we can infer unanimous vote)
        const messages = await base44.asServiceRole.entities.BoardMessage.filter({
          channel_id: proposal.channel_id
        });

        // Count unique voting members from messages (simplistic approach)
        const votingMembers = new Set(messages?.map(m => m.from_member) || []);
        const hasAllVotes = votingMembers.size === totalBoardMembers;

        // Check if all visible members support (no objections in messages)
        const hasObjections = messages?.some(m => 
          m.message_content?.toLowerCase().includes('object') ||
          m.message_content?.toLowerCase().includes('disagree') ||
          m.message_content?.toLowerCase().includes('against')
        );

        if (hasAllVotes && !hasObjections && totalBoardMembers > 0) {
          // Auto-execute unanimous proposal
          const response = await base44.asServiceRole.functions.invoke('executeUnanimousProposal', {
            proposal_id: proposal.id,
            board_votes: {
              yes_votes: Array.from(votingMembers),
              no_votes: []
            }
          });

          if (response.data.success) {
            executedProposals.push({
              id: proposal.id,
              title: proposal.title,
              status: 'auto_executed',
              votingMembers: Array.from(votingMembers)
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process proposal ${proposal.id}:`, error.message);
      }
    }

    return Response.json({
      success: true,
      message: `Detected and executed ${executedProposals.length} unanimous proposals`,
      executedProposals,
      totalBoardMembers
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});