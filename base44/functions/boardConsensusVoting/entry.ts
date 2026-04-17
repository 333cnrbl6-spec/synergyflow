import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, proposal_ids, vote } = await req.json();

    if (action === 'vote') {
      // Record board member vote on proposal(s)
      const boardMember = await base44.entities.BoardMember.filter({
        app_name: user.full_name
      });

      if (!boardMember || boardMember.length === 0) {
        return Response.json({ error: 'Board member not found' }, { status: 404 });
      }

      const votingResults = [];
      for (const proposal_id of proposal_ids) {
        const proposal = await base44.entities.BoardProposal.filter({
          id: proposal_id
        });

        if (proposal && proposal.length > 0) {
          const p = proposal[0];
          const updatedVotes = {
            yes_votes: vote === 'yes' ? [...(p.yes_votes || []), user.full_name] : p.yes_votes || [],
            no_votes: vote === 'no' ? [...(p.no_votes || []), user.full_name] : p.no_votes || [],
            abstain_votes: vote === 'abstain' ? [...(p.abstain_votes || []), user.full_name] : p.abstain_votes || []
          };

          await base44.entities.BoardProposal.update(proposal_id, updatedVotes);
          votingResults.push({ proposal_id, status: 'voted' });
        }
      }

      return Response.json({ 
        message: 'Votes recorded',
        votes_recorded: votingResults.length,
        votingResults 
      });
    }

    if (action === 'check_consensus') {
      // Check which proposals have reached majority consensus
      const approvedProposals = await base44.entities.BoardProposal.filter({
        status: 'approved'
      });

      const boardMembers = await base44.entities.BoardMember.filter({ active: true });
      const totalBoardMembers = boardMembers.length;
      const majorityThreshold = Math.ceil(totalBoardMembers / 2);

      const consensusProposals = [];
      const readyForExecution = [];

      for (const proposal of approvedProposals) {
        const yesCount = (proposal.yes_votes || []).length;
        const totalVotes = (proposal.yes_votes || []).length + (proposal.no_votes || []).length + (proposal.abstain_votes || []).length;

        if (yesCount >= majorityThreshold) {
          consensusProposals.push({
            id: proposal.id,
            title: proposal.title,
            yes_votes: yesCount,
            total_votes: totalVotes,
            board_members: totalBoardMembers,
            has_consensus: true
          });
          readyForExecution.push(proposal.id);
        }
      }

      return Response.json({
        total_approved_proposals: approvedProposals.length,
        consensus_reached: consensusProposals.length,
        ready_for_autonomous_execution: readyForExecution.length,
        majority_threshold: majorityThreshold,
        consensusProposals,
        readyForExecution
      });
    }

    if (action === 'execute_on_consensus') {
      // Execute all proposals that have consensus
      const approvedProposals = await base44.entities.BoardProposal.filter({
        status: 'approved'
      });

      const boardMembers = await base44.entities.BoardMember.filter({ active: true });
      const majorityThreshold = Math.ceil(boardMembers.length / 2);

      let executedCount = 0;
      const executionResults = [];

      for (const proposal of approvedProposals) {
        const yesCount = (proposal.yes_votes || []).length;
        
        if (yesCount >= majorityThreshold) {
          // Create action item for execution
          const actionItem = await base44.entities.ActionItem.create({
            title: `Execute: ${proposal.title}`,
            description: `Board-voted proposal with ${yesCount}/${boardMembers.length} consensus`,
            category: 'proposal',
            priority: 'high',
            trigger_entity_type: 'BoardProposal',
            trigger_entity_id: proposal.id,
            status: 'in_progress',
            auto_triggered: true
          });

          // Mark proposal as being executed
          await base44.entities.BoardProposal.update(proposal.id, {
            status: 'in_progress'
          });

          executedCount++;
          executionResults.push({
            proposal_id: proposal.id,
            title: proposal.title,
            action_item_id: actionItem.id,
            status: 'executing'
          });
        }
      }

      return Response.json({
        message: 'Autonomous execution initiated',
        proposals_executed: executedCount,
        total_approved: approvedProposals.length,
        executionResults
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});