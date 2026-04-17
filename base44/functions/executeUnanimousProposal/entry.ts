import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id, board_votes } = body;

    // Get the proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check for unanimous vote (all yes, no no votes)
    const yesCount = board_votes?.yes_votes?.length || 0;
    const noCount = board_votes?.no_votes?.length || 0;
    const totalVoters = yesCount + noCount;

    if (noCount > 0 || yesCount === 0 || totalVoters === 0) {
      return Response.json({ error: 'Not unanimous or no votes recorded' }, { status: 400 });
    }

    // Auto-approve and execute the proposal
    await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
      status: 'approved',
      chairman_notes: 'Auto-approved: Unanimous board vote'
    });

    // Create action items for implementation
    const actionItems = [];
    if (proposal.products_involved && proposal.products_involved.length > 0) {
      for (const productId of proposal.products_involved) {
        const product = await base44.asServiceRole.entities.Product.get(productId);
        const actionItem = await base44.asServiceRole.entities.ActionItem.create({
          title: `Execute: ${proposal.title}`,
          description: `Auto-execution of unanimous board proposal: ${proposal.summary}`,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal_id,
          related_product_id: productId,
          related_product_name: product?.name || 'Unknown',
          status: 'in_progress',
          auto_triggered: true
        });
        actionItems.push(actionItem);
      }
    }

    return Response.json({
      success: true,
      message: `Proposal "${proposal.title}" auto-executed (unanimous vote)`,
      actionItemsCreated: actionItems.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});