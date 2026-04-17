import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id, votes } = body;

    // Fetch proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Parse votes: { member_app_name: 'yes'|'no'|'abstain' }
    const yesVotes = Object.entries(votes)
      .filter(([_, vote]) => vote === 'yes')
      .map(([member]) => member);

    const noVotes = Object.entries(votes)
      .filter(([_, vote]) => vote === 'no')
      .map(([member]) => member);

    const abstainVotes = Object.entries(votes)
      .filter(([_, vote]) => vote === 'abstain')
      .map(([member]) => member);

    // Initialize multi-stage approval
    const initRes = await base44.functions.invoke('initializeNonUnanimousApproval', {
      proposal_id,
      yes_votes: yesVotes,
      no_votes: noVotes,
      abstain_votes: abstainVotes
    });

    if (!initRes.data.success) {
      return Response.json({ error: initRes.data.error }, { status: 400 });
    }

    // If unanimous, auto-execute launch preparation
    if (initRes.data.isUnanimous) {
      await base44.functions.invoke('autoExecuteLaunchPreparation', {
        proposal_id
      });

      return Response.json({
        success: true,
        message: 'Unanimous vote - Launch preparation auto-executed',
        is_unanimous: true,
        votes_recorded: {
          yes: yesVotes.length,
          no: noVotes.length,
          abstain: abstainVotes.length
        }
      });
    }

    return Response.json({
      success: true,
      message: 'Votes recorded - Proposal entered multi-stage approval',
      is_unanimous: false,
      approval_stage: initRes.data.approval_stage,
      votes_recorded: {
        yes: yesVotes.length,
        no: noVotes.length,
        abstain: abstainVotes.length
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});