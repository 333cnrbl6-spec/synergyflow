import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only execute when proposal status becomes 'approved'
    if (data.status !== 'approved' && data.approval_stage !== 'passed') {
      return Response.json({ skipped: true });
    }

    // Route based on proposal type
    const proposalType = data.proposal_type;
    
    switch (proposalType) {
      case 'readiness':
        await base44.asServiceRole.functions.invoke('autoExecuteReadinessPlan', { 
          proposal_id: data.id,
          product_name: data.products_involved?.[0]
        });
        break;
      
      case 'build':
        await base44.asServiceRole.functions.invoke('executeBuildProposal', { 
          proposal_id: data.id 
        });
        break;
      
      case 'pricing':
        // Execute pricing proposal
        await base44.asServiceRole.entities.ActionItem.create({
          title: `Implement pricing changes from proposal: ${data.title}`,
          description: data.summary,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: data.id,
          status: 'open',
          auto_triggered: true
        });
        break;
      
      case 'go_to_market':
        // Execute GTM proposal
        await base44.asServiceRole.entities.ActionItem.create({
          title: `Execute GTM initiative: ${data.title}`,
          description: data.summary,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: data.id,
          status: 'open',
          auto_triggered: true
        });
        break;
      
      case 'partnership':
        // Execute partnership proposal
        await base44.asServiceRole.entities.ActionItem.create({
          title: `Pursue partnership: ${data.title}`,
          description: data.summary,
          category: 'proposal',
          priority: 'medium',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: data.id,
          status: 'open',
          auto_triggered: true
        });
        break;
      
      case 'governance':
        // Execute governance proposal
        await base44.asServiceRole.entities.ActionItem.create({
          title: `Implement governance change: ${data.title}`,
          description: data.summary,
          category: 'proposal',
          priority: 'high',
          trigger_entity_type: 'BoardProposal',
          trigger_entity_id: data.id,
          status: 'open',
          auto_triggered: true
        });
        break;
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