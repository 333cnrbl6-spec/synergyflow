import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active board members and their products
    const [boardMembers, products, readiness] = await Promise.all([
      base44.asServiceRole.entities.BoardMember.filter({ active: true }),
      base44.asServiceRole.entities.Product.list(),
      base44.asServiceRole.entities.ProductReadiness.list()
    ]);

    // Create strategic brainstorm session
    const brainstormSession = {
      session_id: Date.now().toString(),
      initiated_by: user.email,
      initiated_at: new Date().toISOString(),
      board_members: boardMembers.length,
      phase: 'product_crosscheck',
      status: 'active'
    };

    // Prepare product cross-check for each member
    const memberChecklistItems = [];
    for (const member of boardMembers) {
      // Find products they're responsible for
      const memberProducts = products.filter(p => p.base44_app_id === member.app_name);
      const memberReadiness = readiness.filter(r => 
        memberProducts.some(p => p.id === r.product_id)
      );

      memberChecklistItems.push({
        member_app: member.app_name,
        member_name: member.member_name,
        products_managed: memberProducts.length,
        products: memberProducts.map(p => ({
          name: p.name,
          target_market: p.target_market,
          readiness: memberReadiness.find(r => r.product_id === p.id)?.overall_readiness_percentage || 0,
          features: p.features || []
        }))
      });
    }

    // Create collaborative opportunities framework
    const brainstormPrompt = {
      phase_1: {
        title: 'Product Cross-Check',
        description: 'Each board member validates their product readiness and identifies synergies',
        status: 'pending',
        participants: boardMembers.map(m => m.app_name)
      },
      phase_2: {
        title: 'Collaborative Build Ideas',
        description: 'Identify new apps and joint ventures that complement current portfolio',
        prompts: [
          'What market gaps can we fill with joint development?',
          'Which products could integrate for multiplier effect?',
          'What new verticals could we dominate together?',
          'Where is untapped revenue potential?'
        ],
        status: 'pending'
      },
      phase_3: {
        title: 'SynergyFlow Collective Value',
        description: 'Quantify and present value creation to chairman',
        framework: [
          'Market size estimates',
          'Revenue multiplier effects',
          'Competitive moats',
          'Go-to-market synergies',
          'Tech integration opportunities'
        ],
        status: 'pending'
      }
    };

    // Notify board members to convene
    const boardNotifications = [];
    for (const member of boardMembers) {
      const notif = await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: brainstormSession.session_id,
        proposal_title: 'Strategic Joint Venture Brainstorm - Board Convenes',
        notification_type: 'discussion_required',
        current_stage: 'discussion_required',
        recipient: member.app_name,
        message: `🎯 STRATEGIC CONVENING: Board is reconvening for high-value joint venture brainstorm. Please cross-check your products and prepare collaborative ideas for discussion.`,
        action_required: true,
        timestamp: new Date().toISOString()
      });
      boardNotifications.push(notif.id);
    }

    return Response.json({
      success: true,
      session_id: brainstormSession.session_id,
      brainstorm_framework: brainstormPrompt,
      member_checklist: memberChecklistItems,
      board_convened: boardMembers.length,
      notifications_sent: boardNotifications.length,
      next_step: 'Begin Phase 1: Product Cross-Check'
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});