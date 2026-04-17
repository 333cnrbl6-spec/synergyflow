import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only execute when proposal status becomes 'approved'
    if (data.status !== 'approved' && data.approval_stage !== 'passed') {
      return Response.json({ skipped: true });
    }

    // Check if this proposal has consensus (auto-approved, no veto)
    const totalVotes = (data.yes_votes?.length || 0) + (data.no_votes?.length || 0) + (data.abstain_votes?.length || 0);
    const yesVotes = data.yes_votes?.length || 0;
    const isAutoApproved = totalVotes === 0 || yesVotes === totalVotes || (yesVotes / totalVotes) >= 0.75;

    // Only create action items for auto-approved proposals (consensus)
    if (!isAutoApproved) {
      return Response.json({ skipped: true, reason: 'proposal_requires_veto' });
    }

    // Route based on proposal type
    const proposalType = data.proposal_type;
    const categoryMap = {
      'build': 'proposal',
      'pricing': 'proposal',
      'go_to_market': 'proposal',
      'partnership': 'proposal',
      'governance': 'proposal',
      'readiness': 'readiness'
    };

    const priorityMap = {
      'build': 'high',
      'pricing': 'high',
      'go_to_market': 'high',
      'partnership': 'medium',
      'governance': 'high',
      'readiness': 'critical'
    };

    // Create action item for consensus-approved proposals
    await base44.asServiceRole.entities.ActionItem.create({
      title: `[${proposalType.toUpperCase()}] ${data.title}`,
      description: data.summary,
      category: categoryMap[proposalType] || 'proposal',
      priority: priorityMap[proposalType] || 'medium',
      trigger_entity_type: 'BoardProposal',
      trigger_entity_id: data.id,
      status: 'open',
      auto_triggered: true,
      related_product_id: data.products_involved?.[0] || null,
      related_product_name: data.products_involved?.[0] || null
    });

    // Route to specific executors if needed
    if (proposalType === 'readiness' && data.products_involved?.[0]) {
      await base44.asServiceRole.functions.invoke('autoExecuteReadinessPlan', { 
        proposal_id: data.id,
        product_name: data.products_involved[0]
      });
    } else if (proposalType === 'build') {
      await base44.asServiceRole.functions.invoke('executeBuildProposal', { 
        proposal_id: data.id 
      });
    }

    // Notify board members
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: data.id,
        proposal_title: data.title,
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `✓ Proposal approved and auto-execution initiated: ${data.title}. Action items created.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      proposal_id: data.id,
      proposal_type: proposalType,
      status: 'auto-executed',
      message: `${proposalType} proposal auto-executed and action items created`
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});