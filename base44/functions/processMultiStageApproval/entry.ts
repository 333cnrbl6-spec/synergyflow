import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { proposal_id, action, notes } = body;

    const proposal = await base44.asServiceRole.entities.BoardProposal.get(proposal_id);
    if (!proposal) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    let nextStage = proposal.approval_stage;
    let newStatus = proposal.status;

    // Determine next stage based on current stage
    if (proposal.approval_stage === 'needs_review') {
      nextStage = 'discussion_required';
    } else if (proposal.approval_stage === 'discussion_required') {
      nextStage = 'final_approval';
    } else if (proposal.approval_stage === 'final_approval') {
      if (action === 'approve') {
        nextStage = 'passed';
        newStatus = 'approved';
      } else if (action === 'reject') {
        nextStage = 'rejected';
        newStatus = 'rejected';
      }
    }

    // Update approval history
    const updatedHistory = [...(proposal.approval_history || [])];
    updatedHistory.push({
      stage: nextStage,
      timestamp: new Date().toISOString(),
      reviewed_by: body.reviewed_by || 'system',
      notes: notes || ''
    });

    // Update proposal
    await base44.asServiceRole.entities.BoardProposal.update(proposal_id, {
      approval_stage: nextStage,
      status: newStatus,
      approval_history: updatedHistory,
      chairman_notes: notes || proposal.chairman_notes
    });

    // Get all board members for notification
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });

    // Create notifications for board members
    for (const member of boardMembers) {
      let notificationMessage = '';
      let actionRequired = false;

      if (nextStage === 'discussion_required') {
        notificationMessage = `Proposal "${proposal.title}" moved to Discussion Required stage. Please review and comment.`;
        actionRequired = true;
      } else if (nextStage === 'final_approval') {
        notificationMessage = `Proposal "${proposal.title}" moved to Final Approval stage. Chairman decision required.`;
        actionRequired = false;
      } else if (nextStage === 'passed') {
        notificationMessage = `Proposal "${proposal.title}" has been approved and will be executed.`;
      } else if (nextStage === 'rejected') {
        notificationMessage = `Proposal "${proposal.title}" has been rejected.`;
      }

      if (notificationMessage) {
        await base44.asServiceRole.entities.ProposalNotification.create({
          proposal_id: proposal_id,
          proposal_title: proposal.title,
          notification_type: nextStage,
          current_stage: nextStage,
          recipient: member.app_name,
          message: notificationMessage,
          action_required: actionRequired,
          timestamp: new Date().toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      message: `Proposal moved to ${nextStage} stage`,
      proposal_id,
      new_stage: nextStage,
      new_status: newStatus
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});