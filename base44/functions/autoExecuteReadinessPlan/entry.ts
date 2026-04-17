import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id, product_name } = body;

    if (!proposal_id || !product_name) {
      return Response.json({ error: 'Missing proposal_id or product_name' }, { status: 400 });
    }

    // Get proposal
    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal || proposal.is_unanimous !== true) {
      return Response.json({ error: 'Proposal must have unanimous support' }, { status: 400 });
    }

    // Define readiness closure action items
    const readinessTasks = [
      {
        title: 'Documentation & API Specifications',
        description: 'Complete API documentation, SDK guides, and integration examples for Premiso enterprise APIs.',
        priority: 'critical',
        daysToComplete: 7
      },
      {
        title: 'Security & Compliance Audit',
        description: 'Execute full security audit (OWASP, data privacy, encryption), complete SOC 2 Type II certification.',
        priority: 'critical',
        daysToComplete: 10
      },
      {
        title: 'Performance Testing & Optimization',
        description: 'Load testing (10K+ concurrent users), latency optimization, database query performance tuning.',
        priority: 'high',
        daysToComplete: 7
      },
      {
        title: 'Enterprise Integration Features',
        description: 'SSO (SAML/OAuth), role-based access control (RBAC), audit logging, multi-tenancy support.',
        priority: 'high',
        daysToComplete: 10
      },
      {
        title: 'Go-to-Market & Sales Enablement',
        description: 'Sales deck, ROI calculator, case studies, competitive positioning, pricing documentation.',
        priority: 'high',
        daysToComplete: 7
      }
    ];

    const actionItems = [];
    const now = new Date();

    for (const task of readinessTasks) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + task.daysToComplete);

      const actionItem = await base44.asServiceRole.entities.ActionItem.create({
        title: `[${product_name} Readiness] ${task.title}`,
        description: task.description,
        category: 'readiness',
        priority: task.priority,
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: proposal_id,
        related_product_id: product_name,
        related_product_name: product_name,
        status: 'in_progress',
        due_date: dueDate.toISOString().split('T')[0],
        auto_triggered: true
      });

      actionItems.push(actionItem);
    }

    // Mark proposal as executed
    await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
      status: 'approved',
      approval_stage: 'passed',
      approval_history: [
        ...(proposal.approval_history || []),
        {
          stage: 'auto_executed',
          timestamp: new Date().toISOString(),
          reviewed_by: 'system_unanimous_vote',
          notes: `Unanimous vote triggered autonomous execution. ${actionItems.length} readiness tasks created with staggered deadlines.`
        }
      ]
    });

    // Notify board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: proposal_id,
        proposal_title: proposal.title,
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `✓ ${product_name} readiness plan AUTO-EXECUTED (unanimous vote). ${actionItems.length} tasks created across 5 readiness areas with deadlines ranging 7-10 days.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      message: `${product_name} readiness plan auto-executed`,
      proposal_id,
      action_items_created: actionItems.length,
      readiness_areas: readinessTasks.length,
      execution_started: new Date().toISOString(),
      completion_window_days: 10
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});