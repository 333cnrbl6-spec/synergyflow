import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all approved proposals that haven't started execution
    const approvedProposals = await base44.entities.BoardProposal.filter({
      status: 'approved'
    });

    // Initialize voting arrays for proposals without votes
    let votingInitiated = 0;
    const votingResults = [];

    for (const proposal of approvedProposals) {
      const hasVotes = (proposal.yes_votes?.length || 0) > 0 || 
                      (proposal.no_votes?.length || 0) > 0 || 
                      (proposal.abstain_votes?.length || 0) > 0;

      if (!hasVotes) {
        // Initialize empty voting arrays
        await base44.entities.BoardProposal.update(proposal.id, {
          yes_votes: [],
          no_votes: [],
          abstain_votes: []
        });

        votingInitiated++;
        votingResults.push({
          proposal_id: proposal.id,
          title: proposal.title,
          status: 'voting_initiated'
        });
      }
    }

    return Response.json({
      message: 'Board voting initiated on all unexecuted proposals',
      total_approved: approvedProposals.length,
      voting_initiated: votingInitiated,
      votingResults
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});