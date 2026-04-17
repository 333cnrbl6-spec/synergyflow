import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Post integrative guidance to board
    await base44.asServiceRole.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: 'strategy',
      message_content: `🔗 STRATEGIC SYNTHESIS: Board members are encouraged to consider both initiatives holistically:

1️⃣ **Strategic Joint Ventures** - Identify new collaborative apps, market opportunities, and big-money targets outside our usual scope through cross-product innovation.

2️⃣ **Cross-Product Consolidation** - Unify existing capabilities (CaseNarrative legal data + Species Explorer logic) into Premiso command centers for institutional landlords.

These are complementary: consolidation strengthens our foundation for commanding the institutional market, while joint ventures explore new strategic frontiers. Consider synergies between them as you evaluate both proposals.`,
      message_type: 'decision',
      from_member: '📋 Board Stewardship'
    });

    // Create cross-linking action item
    const jvProposal = await base44.entities.BoardProposal.filter({
      title: { $regex: 'Strategic Joint Ventures' }
    });
    const consolidationProposal = await base44.entities.BoardProposal.filter({
      title: { $regex: 'Cross-Product Consolidation' }
    });

    if (jvProposal.length > 0 && consolidationProposal.length > 0) {
      await base44.asServiceRole.entities.ActionItem.create({
        title: 'Strategic Synthesis: Joint Ventures + Consolidation Alignment',
        description: 'Evaluate synergies between Strategic Joint Ventures discovery and Cross-Product Consolidation execution. Identify opportunities where new market targets can leverage unified institutional landlord infrastructure.',
        category: 'proposal',
        priority: 'high',
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: consolidationProposal[0].id,
        status: 'open',
        auto_triggered: false
      });
    }

    return Response.json({
      success: true,
      message_posted: true,
      guidance_type: 'integrated_strategy',
      initiatives_linked: 2
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});