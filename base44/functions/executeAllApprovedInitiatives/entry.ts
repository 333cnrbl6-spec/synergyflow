import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all approved proposals
    const approvedProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    const executionResults = {
      buildInitiatives: 0,
      pricingInitiatives: 0,
      goToMarketInitiatives: 0,
      governanceInitiatives: 0,
      partnershipsInitiatives: 0,
      totalValue: 0,
      executionStarted: []
    };

    // Execute each initiative in batches
    for (let i = 0; i < approvedProposals.length; i++) {
      const proposal = approvedProposals[i];
      
      // Count by type
      if (proposal.proposal_type === 'build') executionResults.buildInitiatives++;
      else if (proposal.proposal_type === 'pricing') executionResults.pricingInitiatives++;
      else if (proposal.proposal_type === 'go_to_market') executionResults.goToMarketInitiatives++;
      else if (proposal.proposal_type === 'governance') executionResults.governanceInitiatives++;
      else if (proposal.proposal_type === 'partnership') executionResults.partnershipsInitiatives++;

      try {
        // Create implementation action item
        const actionItem = await base44.asServiceRole.entities.ActionItem.create({
          title: proposal.title,
          description: proposal.summary,
          category: proposal.proposal_type === 'build' ? 'revenue' : proposal.proposal_type,
          priority: 'critical',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal.id,
          related_product_id: proposal.products_involved?.[0] || null,
          status: 'in_progress',
          auto_triggered: true
        });

        executionResults.executionStarted.push({
          proposalId: proposal.id,
          actionItemId: actionItem.id,
          title: proposal.title,
          type: proposal.proposal_type
        });

        executionResults.totalValue++;

        // Stagger requests
        if (i % 10 === 9) await sleep(500);
      } catch (itemError) {
        console.error(`Failed to execute proposal ${proposal.id}:`, itemError);
      }
    }

    // Post board announcement (non-blocking)
    try {
      await base44.asServiceRole.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: 'strategy',
        message_content: `🚀 EXECUTION: ${executionResults.totalValue} initiatives now executing`,
        message_type: 'decision',
        from_member: 'Execution Engine'
      });
    } catch (commError) {
      console.error('Communication error:', commError);
    }

    // Create batch tracking record
    try {
      await base44.asServiceRole.entities.ActionItem.create({
        title: `Execution Batch - ${executionResults.totalValue} Initiatives`,
        description: `Autonomous execution of ${executionResults.totalValue} board-approved initiatives initiated`,
        category: 'compliance',
        priority: 'critical',
        trigger_entity_type: 'BoardProposal',
        status: 'in_progress',
        auto_triggered: true
      });
    } catch (batchError) {
      console.error('Batch record error:', batchError);
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionResults,
      message: `${executionResults.totalValue} initiatives executing`
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});