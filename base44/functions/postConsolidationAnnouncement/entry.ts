import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create formal consolidation proposal with chairman approval
    const proposal = await base44.asServiceRole.entities.BoardProposal.create({
      title: 'Cross-Product Consolidation & Unified Infrastructure Initiative',
      summary: 'Board commits to consolidating cross-product capabilities into unified infrastructure bridging asset management with legal oversight. Integration: CaseNarrative data and Species Explorer logic into Premiso environment for automated command centers serving large-scale institutional landlords.',
      raised_by: 'SynergyFlow Board Collective',
      channel_id: 'strategy',
      channel_name: '#strategy',
      proposal_type: 'build',
      products_involved: ['Premiso', 'CaseNarrative', 'Species Explorer'],
      status: 'approved',
      approval_stage: 'passed',
      is_unanimous: true,
      chairman_notes: 'Chairman endorses autonomous implementation. Board is empowered to proceed with cross-product integration immediately.',
      yes_votes: ['Chairman', 'Premiso', 'CaseNarrative', 'Species Explorer'],
      timestamp: new Date().toISOString()
    });

    // Post announcement to strategy channel
    await base44.asServiceRole.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: 'strategy',
      message_content: `👑 CHAIRMAN ANNOUNCEMENT: "The Board is committed to consolidating our cross-product capabilities into a unified infrastructure that bridges asset management with legal oversight for institutional landlords. We will now move to integrate CaseNarrative data and Species Explorer logic directly into the Premiso environment to deliver bespoke, automated command centers for large-scale property investors." Autonomous implementation is authorized.`,
      message_type: 'decision',
      from_member: '👑 Chairman'
    });

    // Create implementation action items for each product
    const products = ['Premiso', 'CaseNarrative', 'Species Explorer'];
    const actionItems = [];

    for (const product of products) {
      const action = await base44.asServiceRole.entities.ActionItem.create({
        title: `Consolidation Integration: ${product} → Unified Infrastructure`,
        description: `Integrate ${product} capabilities into unified command center infrastructure for institutional landlord platform.`,
        category: 'proposal',
        priority: 'critical',
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: proposal.id,
        related_product_id: product,
        related_product_name: product,
        status: 'in_progress',
        auto_triggered: false
      });
      actionItems.push(action.id);
    }

    // Notify all board members of approved implementation
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    const notifications = [];

    for (const member of boardMembers) {
      const notif = await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: proposal.id,
        proposal_title: proposal.title,
        notification_type: 'passed',
        current_stage: 'passed',
        recipient: member.app_name,
        message: `✅ APPROVED & EXECUTING: Cross-product consolidation initiative approved by Chairman. Autonomous implementation authorized. Unified infrastructure development underway.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
      notifications.push(notif.id);
    }

    return Response.json({
      success: true,
      proposal_id: proposal.id,
      status: 'approved',
      chairman_authorized: true,
      announcement_posted: true,
      action_items_created: actionItems.length,
      board_notifications: notifications.length,
      implementation_status: 'autonomous_execution',
      products_involved: products,
      target: 'Unified command centers for large-scale institutional landlords'
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});