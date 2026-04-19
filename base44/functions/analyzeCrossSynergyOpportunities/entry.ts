import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || !['admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all required data
    const [products, subscriptions, boardProposals] = await Promise.all([
      base44.entities.Product.list().catch(() => []),
      base44.entities.AppSubscription.list().catch(() => []),
      base44.entities.BoardProposal.list().catch(() => [])
    ]);

    // Build product feature matrix
    const productAnalysis = products.map(product => {
      const subs = subscriptions.filter(sub => 
        sub.apps_included?.includes(product.slug || product.name.toLowerCase().replace(/\s+/g, '_'))
      );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        features: product.features || [],
        subscribers: subs.length,
        target_market: product.target_market,
        pricing_tiers: product.pricing_tiers?.length || 0
      };
    });

    // Build subscriber overlap analysis
    const overlapAnalysis = {};
    for (let i = 0; i < productAnalysis.length; i++) {
      for (let j = i + 1; j < productAnalysis.length; j++) {
        const prod1 = productAnalysis[i];
        const prod2 = productAnalysis[j];
        
        const subs1 = new Set(
          subscriptions
            .filter(s => s.apps_included?.includes(prod1.slug || prod1.name.toLowerCase().replace(/\s+/g, '_')))
            .map(s => s.user_email)
        );
        
        const subs2 = new Set(
          subscriptions
            .filter(s => s.apps_included?.includes(prod2.slug || prod2.name.toLowerCase().replace(/\s+/g, '_')))
            .map(s => s.user_email)
        );

        const overlap = new Set([...subs1].filter(x => subs2.has(x)));
        const overlapPercent = subs1.size > 0 ? Math.round((overlap.size / subs1.size) * 100) : 0;

        overlapAnalysis[`${prod1.name}-${prod2.name}`] = {
          product1: prod1.name,
          product2: prod2.name,
          overlap_count: overlap.size,
          overlap_percent: overlapPercent,
          potential: overlap.size >= 2 || overlapPercent >= 30
        };
      }
    }

    // Prepare data for LLM analysis
    const analysisPrompt = `You are a product strategist analyzing cross-synergy opportunities for a SaaS portfolio.

PRODUCT PORTFOLIO:
${productAnalysis.map(p => `
- ${p.name}
  Features: ${p.features.join(', ') || 'Not specified'}
  Subscribers: ${p.subscribers}
  Target Market: ${p.target_market}
  Description: ${p.description}
`).join('\n')}

SUBSCRIBER OVERLAP ANALYSIS:
${Object.entries(overlapAnalysis)
  .filter(([_, data]) => data.potential)
  .map(([key, data]) => `
- ${data.product1} ↔ ${data.product2}: ${data.overlap_count} shared subscribers (${data.overlap_percent}% overlap)
`)
  .join('\n')}

Based on this analysis, identify:
1. Feature gaps where products could integrate or share capabilities
2. Cross-synergy opportunities that would benefit overlapping subscribers
3. Build proposals that could unlock additional revenue or reduce churn

Return a JSON array of 3-5 suggested build proposals with:
{
  "title": "Clear proposal title",
  "summary": "2-3 sentence summary of the opportunity",
  "products_involved": ["Product1", "Product2"],
  "estimated_impact": "Revenue/retention benefit description",
  "effort": "Low/Medium/High",
  "priority": "P1/P2/P3",
  "implementation_hint": "How to build this"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                summary: { type: 'string' },
                products_involved: { type: 'array', items: { type: 'string' } },
                estimated_impact: { type: 'string' },
                effort: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                priority: { type: 'string', enum: ['P1', 'P2', 'P3'] },
                implementation_hint: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const opportunities = response.opportunities || [];

    // Check for existing proposals to avoid duplicates
    const existingTitles = new Set(boardProposals.map(p => p.title.toLowerCase()));
    const newOpportunities = opportunities.filter(opp => 
      !existingTitles.has(opp.title.toLowerCase())
    );

    return Response.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      total_opportunities: opportunities.length,
      new_opportunities: newOpportunities.length,
      opportunities: newOpportunities.map((opp, idx) => ({
        ...opp,
        opportunity_id: `cross_synergy_${Date.now()}_${idx}`,
        proposal_type: 'build',
        products_involved: opp.products_involved,
        suggested_for_board: true
      })),
      subscriber_overlap_summary: {
        high_overlap_pairs: Object.entries(overlapAnalysis)
          .filter(([_, data]) => data.overlap_percent >= 30)
          .map(([_, data]) => ({
            products: `${data.product1} + ${data.product2}`,
            shared_subscribers: data.overlap_count,
            overlap_percent: data.overlap_percent
          }))
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});