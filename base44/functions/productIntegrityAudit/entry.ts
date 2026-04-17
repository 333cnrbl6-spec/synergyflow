import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all approved proposals waiting for implementation
    const approvedProposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    const auditLog = {
      timestamp: new Date().toISOString(),
      total_proposals: approvedProposals.length,
      by_type: {},
      integrity_checks: [],
      ready_for_execution: [],
      requires_attention: []
    };

    for (const proposal of approvedProposals) {
      if (!auditLog.by_type[proposal.proposal_type]) {
        auditLog.by_type[proposal.proposal_type] = 0;
      }
      auditLog.by_type[proposal.proposal_type]++;

      // Build integrity checks
      const checks = {
        proposal_id: proposal.id,
        title: proposal.title,
        type: proposal.proposal_type,
        checks_passed: 0,
        checks_total: 0,
        issues: []
      };

      // Check 1: Proposal has required fields
      checks.checks_total++;
      if (proposal.summary && proposal.raised_by && proposal.channel_id) {
        checks.checks_passed++;
      } else {
        checks.issues.push('Missing proposal metadata (summary, raised_by, or channel_id)');
      }

      // Check 2: Products involved exist and are valid
      if (proposal.products_involved && proposal.products_involved.length > 0) {
        checks.checks_total++;
        try {
          const products = await base44.asServiceRole.entities.Product.filter({});
          const validProducts = products.filter(p => proposal.products_involved.includes(p.id));
          if (validProducts.length === proposal.products_involved.length) {
            checks.checks_passed++;
          } else {
            checks.issues.push(`${proposal.products_involved.length - validProducts.length} product(s) not found in system`);
          }
        } catch (e) {
          checks.issues.push('Could not verify products');
        }
      }

      // Check 3: Majority vote confirmed (if voting was required)
      checks.checks_total++;
      const yesVotes = proposal.yes_votes?.length || 0;
      const totalVotes = (proposal.yes_votes?.length || 0) + (proposal.no_votes?.length || 0) + (proposal.abstain_votes?.length || 0);
      if (totalVotes === 0 || (yesVotes / totalVotes) >= 0.5) {
        checks.checks_passed++;
      } else {
        checks.issues.push(`Vote count insufficient: ${yesVotes}/${totalVotes} yes votes`);
      }

      // Check 4: Proposal type has valid execution handler
      checks.checks_total++;
      const validTypes = ['build', 'readiness', 'pricing', 'go_to_market'];
      if (validTypes.includes(proposal.proposal_type)) {
        checks.checks_passed++;
      } else {
        checks.issues.push(`Unknown proposal type: ${proposal.proposal_type}`);
      }

      // Check 5: No duplicate action items exist
      checks.checks_total++;
      try {
        const existingActions = await base44.asServiceRole.entities.ActionItem.filter({
          trigger_entity_id: proposal.id
        });
        if (existingActions.length === 0 || !existingActions.some(a => a.status === 'in_progress' && a.auto_triggered)) {
          checks.checks_passed++;
        } else {
          checks.issues.push('Implementation already in progress for this proposal');
        }
      } catch (e) {
        checks.issues.push('Could not verify action items');
      }

      auditLog.integrity_checks.push(checks);

      // Determine readiness
      if (checks.checks_passed === checks.checks_total && checks.issues.length === 0) {
        auditLog.ready_for_execution.push({
          proposal_id: proposal.id,
          title: proposal.title,
          type: proposal.proposal_type
        });
      } else {
        auditLog.requires_attention.push({
          proposal_id: proposal.id,
          title: proposal.title,
          type: proposal.proposal_type,
          issues: checks.issues,
          checks_passed: `${checks.checks_passed}/${checks.checks_total}`
        });
      }
    }

    // Notify board of audit results
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: 'integrity_audit',
        proposal_title: 'Product Integrity Audit Complete',
        notification_type: 'needs_review',
        current_stage: 'audit',
        recipient: member.app_name,
        message: `🔍 Integrity audit complete: ${auditLog.ready_for_execution.length} proposals ready for execution, ${auditLog.requires_attention.length} requiring review.`,
        action_required: auditLog.requires_attention.length > 0,
        timestamp: new Date().toISOString()
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      audit: auditLog,
      status: 'audit_complete'
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});