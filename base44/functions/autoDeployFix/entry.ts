import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { verification_id, issue_id, issue_description, fix_type, issue_severity, rollback_plan, implementation_notes } = body;

    // Get verification to find product and board member
    const verification = await base44.entities.ProductVerification.get(verification_id);
    if (!verification) {
      return Response.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Only board member of this product can deploy
    if (verification.board_member_app !== user.email && !user.email.includes(verification.board_member_app)) {
      return Response.json({ error: 'Only product board member can deploy fixes' }, { status: 403 });
    }

    // Create implementation task
    const implementationTask = await base44.entities.ImplementationTask.create({
      product_id: verification.product_id,
      product_name: verification.product_name,
      board_member_app: verification.board_member_app,
      verification_id: verification_id,
      issue_description: issue_description,
      issue_severity: issue_severity,
      fix_type: fix_type,
      implementation_status: 'in_progress',
      auto_deploy: true,
      deployment_timestamp: new Date().toISOString(),
      implementation_notes: implementation_notes,
      rollback_plan: rollback_plan
    });

    // Log deployment event
    await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Log this deployment event: Product ${verification.product_name} - Issue: ${issue_description} - Severity: ${issue_severity} - Fix Type: ${fix_type} - Deployed by: ${verification.board_member_app}`
    });

    // Update verification to mark issue as resolved
    const updatedIssues = (verification.issues_found || []).map(issue => 
      issue.issue_id === issue_id ? { ...issue, status: 'resolved' } : issue
    );

    await base44.entities.ProductVerification.update(verification_id, {
      issues_found: updatedIssues,
      verification_phase: updatedIssues.every(i => i.status === 'resolved') ? 'resolved' : 'issues_found'
    });

    return Response.json({
      success: true,
      implementationTaskId: implementationTask.id,
      message: `Fix deployed automatically for ${verification.product_name}`,
      status: 'in_progress'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});