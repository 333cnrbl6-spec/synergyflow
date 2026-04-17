import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { initiatives } = body;

    if (!Array.isArray(initiatives) || initiatives.length === 0) {
      return Response.json({ error: 'No initiatives provided' }, { status: 400 });
    }

    const createdProposals = [];
    const errors = [];

    for (const initiative of initiatives) {
      try {
        const proposal = await base44.asServiceRole.entities.BoardProposal.create({
          title: initiative.title,
          summary: initiative.description,
          raised_by: initiative.raised_by || 'Board Collective',
          channel_id: 'cross-product-initiatives',
          channel_name: 'Cross-Product Initiatives',
          proposal_type: 'build',
          products_involved: initiative.products_involved || [],
          status: 'pending_chairman',
          is_unanimous: false,
          approval_stage: 'needs_review',
          discussion_count: 0,
          yes_votes: [],
          no_votes: [],
          abstain_votes: [],
          approval_history: [{
            stage: 'created',
            timestamp: new Date().toISOString(),
            reviewed_by: 'system',
            notes: 'Bulk imported from initiatives list'
          }],
          timestamp: new Date().toISOString()
        });

        createdProposals.push(proposal.id);
      } catch (error) {
        errors.push({
          title: initiative.title,
          error: error.message
        });
      }
    }

    // Create a master coordination proposal
    const coordinationProposal = await base44.asServiceRole.entities.BoardProposal.create({
      title: 'Approve All Cross-Product Build Initiatives (Unified Execution)',
      summary: `Collective board approval for ${createdProposals.length} cross-product integration initiatives for immediate execution. Single vote coordinates all related BUILD proposals.`,
      raised_by: 'The Board (Collective)',
      channel_id: 'cross-product-initiatives',
      channel_name: 'Cross-Product Initiatives',
      proposal_type: 'build',
      products_involved: ['Premiso', 'Species Explorer', 'Age UK Bury', 'CaseNarrative'],
      status: 'pending_chairman',
      is_unanimous: false,
      approval_stage: 'needs_review',
      discussion_count: 0,
      yes_votes: [],
      no_votes: [],
      abstain_votes: [],
      approval_history: [{
        stage: 'created',
        timestamp: new Date().toISOString(),
        reviewed_by: 'system',
        notes: `Master coordination proposal for ${createdProposals.length} initiatives`
      }],
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: `Created ${createdProposals.length} initiatives + 1 master coordination proposal`,
      coordination_proposal_id: coordinationProposal.id,
      initiatives_created: createdProposals.length,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});