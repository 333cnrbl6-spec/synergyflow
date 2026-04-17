import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all initiatives at different stages
    const approvedProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
      trigger_entity_type: 'BoardProposal'
    });

    const inProgress = actionItems.filter(a => a.status === 'in_progress');
    const completed = actionItems.filter(a => a.status === 'completed');
    const deployed = actionItems.filter(a => a.implementation_status === 'deployed');

    const totalInitiatives = approvedProposals.length;
    const processedCount = inProgress.length + completed.length + deployed.length;
    const builtCount = deployed.length;
    const conversionRate = totalInitiatives > 0 ? ((builtCount / totalInitiatives) * 100).toFixed(1) : 0;

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalApprovedInitiatives: totalInitiatives,
        initiativesProcessed: processedCount,
        initiativesBuilt: builtCount,
        initiativesInProgress: inProgress.length,
        initiativesCompleted: completed.length,
        conversionRate: parseFloat(conversionRate),
        percentProcessed: totalInitiatives > 0 ? Math.round((processedCount / totalInitiatives) * 100) : 0,
        percentBuilt: totalInitiatives > 0 ? Math.round((builtCount / totalInitiatives) * 100) : 0
      }
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});