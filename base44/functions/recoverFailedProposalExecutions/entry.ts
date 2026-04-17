import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { limit = 50, offset = 0 } = await req.json().catch(() => ({}));

    // Find approved/passed proposals (paginated)
    const approvedProposals = await base44.asServiceRole.entities.BoardProposal.filter(
      { status: 'approved' },
      '-created_date',
      limit,
      offset
    );

    const recoveredCount = { success: 0, failed: 0, skipped: 0 };
    const recoveryLog = [];

    for (const proposal of approvedProposals) {
      try {
        // Check if action item already exists
        const existingActions = await base44.asServiceRole.entities.ActionItem.filter({
          trigger_entity_id: proposal.id
        });

        if (existingActions.length > 0) {
          recoveredCount.skipped++;
          continue;
        }

        // Create action item and trigger execution
        const actionItem = await base44.asServiceRole.entities.ActionItem.create({
          title: `[RECOVERY] Implement: ${proposal.title}`,
          description: `${proposal.proposal_type.toUpperCase()} proposal approved but not executed. ${proposal.summary}`,
          category: proposal.proposal_type === 'readiness' ? 'readiness' : 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: proposal.id,
          status: 'in_progress',
          auto_triggered: true
        });

        // Trigger execution based on type
        if (proposal.proposal_type === 'build') {
          await base44.asServiceRole.functions.invoke('executeBuildProposal', {
            proposal_id: proposal.id
          }).catch(() => null);
        } else if (proposal.proposal_type === 'readiness' && proposal.products_involved?.[0]) {
          await base44.asServiceRole.functions.invoke('autoExecuteReadinessPlan', {
            proposal_id: proposal.id,
            product_name: proposal.products_involved[0]
          }).catch(() => null);
        }

        recoveryLog.push({ proposal_id: proposal.id, title: proposal.title, status: 'recovered' });
        recoveredCount.success++;
      } catch (error) {
        recoveryLog.push({ proposal_id: proposal.id, title: proposal.title, status: 'failed', error: error.message });
        recoveredCount.failed++;
      }
    }

    return Response.json({
      success: true,
      recovered: recoveredCount,
      processed: approvedProposals.length,
      batch_info: { limit, offset },
      details: recoveryLog
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});