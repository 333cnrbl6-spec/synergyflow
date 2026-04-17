import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all passed board decisions that haven't been executed yet
    const decisions = await base44.asServiceRole.entities.BoardDecision.filter({
      status: 'passed',
      implementation_status: 'pending'
    });

    if (!decisions || decisions.length === 0) {
      return Response.json({ message: 'No pending decisions to execute' });
    }

    const executedDecisions = [];

    for (const decision of decisions) {
      try {
        // Execute each decision
        const response = await base44.asServiceRole.functions.invoke('executeApprovedDecision', {
          decision_id: decision.id,
          decision_title: decision.decision_title,
          implementation_owner: decision.implementation_owner,
          products_involved: decision.products_involved || []
        });

        if (response.data.success) {
          executedDecisions.push({
            id: decision.id,
            title: decision.decision_title,
            status: 'executed'
          });
        }
      } catch (error) {
        console.error(`Failed to execute decision ${decision.id}:`, error.message);
      }
    }

    return Response.json({
      success: true,
      message: `Auto-executed ${executedDecisions.length} board decisions`,
      executedDecisions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});