import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch board members and their expertise
    const boardMembers = await base44.entities.BoardMember.list();
    const proposals = await base44.entities.BoardProposal.list();
    const products = await base44.entities.Product.list();

    // Build context for LLM
    const memberProfiles = boardMembers
      .filter(m => m.active)
      .map(m => `${m.member_name} (${m.role}, ${m.app_name}): Expertise in ${m.expertise?.join(', ') || 'general strategy'}`)
      .join('\n');

    const recentProposals = proposals
      .slice(0, 10)
      .map(p => `${p.title} (${p.proposal_type}): ${p.summary}`)
      .join('\n');

    const productContext = products
      .slice(0, 5)
      .map(p => `${p.name}: ${p.description}`)
      .join('\n');

    // Invoke LLM to synthesize board consensus
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a board of experts discussing the SynergyFlow app.

BOARD MEMBERS & EXPERTISE:
${memberProfiles}

RECENT PROPOSALS DISCUSSED:
${recentProposals}

OTHER PRODUCTS IN ECOSYSTEM:
${productContext}

Based on the collective expertise and recent discussions, provide a structured analysis of:
1. CRITICAL NEEDS: What SynergyFlow must implement (ranked by urgency)
2. MENU & STRUCTURE: Recommended navigation and information architecture
3. CAPABILITY GAPS: Features or integrations missing
4. COMPETITIVE ADVANTAGES: How to position SynergyFlow uniquely
5. IMPLEMENTATION ROADMAP: 30/60/90 day priorities

Format as clear, actionable insights. Be specific and practical.`,
      response_json_schema: {
        type: 'object',
        properties: {
          critical_needs: {
            type: 'array',
            items: { type: 'string' }
          },
          menu_structure: {
            type: 'object',
            properties: {
              primary_sections: { type: 'array', items: { type: 'string' } },
              recommended_layout: { type: 'string' },
              user_flows: { type: 'array', items: { type: 'string' } }
            }
          },
          capability_gaps: {
            type: 'array',
            items: { type: 'string' }
          },
          competitive_advantages: {
            type: 'array',
            items: { type: 'string' }
          },
          roadmap: {
            type: 'object',
            properties: {
              phase_30_days: { type: 'array', items: { type: 'string' } },
              phase_60_days: { type: 'array', items: { type: 'string' } },
              phase_90_days: { type: 'array', items: { type: 'string' } }
            }
          },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json({
      insights: response,
      timestamp: new Date().toISOString(),
      board_member_count: boardMembers.filter(m => m.active).length,
      proposals_analyzed: proposals.length
    });
  } catch (error) {
    console.error('Error synthesizing insights:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});