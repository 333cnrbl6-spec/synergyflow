import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { decision_id, decision_title, implementation_owner, products_involved } = body;

    // Get the decision
    const decision = await base44.asServiceRole.entities.BoardDecision.get(decision_id);
    if (!decision || decision.status !== 'passed') {
      return Response.json({ error: 'Decision not passed or not found' }, { status: 400 });
    }

    // Auto-create implementation action items for each product involved
    const actionItems = [];
    if (products_involved && products_involved.length > 0) {
      for (const productId of products_involved) {
        const product = await base44.asServiceRole.entities.Product.get(productId);
        const actionItem = await base44.asServiceRole.entities.ActionItem.create({
          title: `Execute: ${decision_title}`,
          description: `Auto-execution of approved board decision: ${decision.description}`,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardDecision',
          trigger_entity_id: decision_id,
          related_product_id: productId,
          related_product_name: product?.name || 'Unknown',
          status: 'in_progress',
          assigned_to: implementation_owner,
          auto_triggered: true
        });
        actionItems.push(actionItem);
      }
    }

    // Update decision status to in_progress
    await base44.asServiceRole.entities.BoardDecision.update(decision_id, {
      implementation_status: 'in_progress'
    });

    return Response.json({
      success: true,
      message: `Board decision "${decision_title}" auto-executed`,
      actionItemsCreated: actionItems.length,
      actionItems: actionItems.map(ai => ({ id: ai.id, product: ai.related_product_name }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});