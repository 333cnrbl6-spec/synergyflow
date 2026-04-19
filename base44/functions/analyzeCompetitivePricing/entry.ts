import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || !['admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch product portfolio
    const products = await base44.entities.Product.list().catch(() => []);
    
    if (products.length === 0) {
      return Response.json({
        status: 'no_products',
        message: 'No products found in portfolio'
      });
    }

    // Build competitive analysis request
    const productCategories = products.map(p => ({
      name: p.name,
      description: p.description,
      target_market: p.target_market,
      current_tiers: p.pricing_tiers?.length || 0
    }));

    const analysisPrompt = `You are a SaaS market analyst. Analyze current competitive pricing for these software categories and provide benchmark data and recommendations.

PRODUCT PORTFOLIO TO ANALYZE:
${productCategories.map((p, i) => `
${i + 1}. ${p.name}
   - Description: ${p.description}
   - Target Market: ${p.target_market}
   - Current Pricing Tiers: ${p.current_tiers}
`).join('\n')}

For EACH product, research and provide:
1. Top 3-5 direct competitors (actual products/companies in this category)
2. Their current pricing (monthly tier ranges)
3. Market positioning and feature differentiation
4. Recommended pricing strategy for our product
5. Estimated market share if pricing is optimized

Return detailed JSON with competitive benchmarks and specific pricing recommendations.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis_timestamp: { type: 'string' },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                target_market: { type: 'string' },
                competitors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      competitor_name: { type: 'string' },
                      pricing_tiers: { 
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            tier_name: { type: 'string' },
                            monthly_price: { type: 'number' },
                            annual_price: { type: 'number' }
                          }
                        }
                      },
                      market_positioning: { type: 'string' }
                    }
                  }
                },
                market_insights: { type: 'string' },
                pricing_recommendation: {
                  type: 'object',
                  properties: {
                    recommended_entry_price: { type: 'number' },
                    recommended_mid_price: { type: 'number' },
                    recommended_premium_price: { type: 'number' },
                    competitive_advantage: { type: 'string' },
                    pricing_rationale: { type: 'string' },
                    urgency: { type: 'string', enum: ['low', 'medium', 'high'] }
                  }
                },
                estimated_market_share: { type: 'string' }
              }
            }
          },
          portfolio_optimization: {
            type: 'object',
            properties: {
              bundle_opportunity: { type: 'string' },
              synergy_pricing_potential: { type: 'string' },
              overall_recommendation: { type: 'string' }
            }
          }
        }
      }
    });

    // Match recommendations with current pricing
    const recommendations = response.products?.map((rec, idx) => {
      const product = products[idx];
      const currentPricing = product.pricing_tiers || [];
      
      return {
        product_id: product.id,
        product_name: product.name,
        current_pricing: currentPricing,
        competitors: rec.competitors || [],
        market_insights: rec.market_insights,
        pricing_recommendation: rec.pricing_recommendation,
        estimated_market_share: rec.estimated_market_share,
        adjustment_needed: currentPricing.length === 0 || 
          (rec.pricing_recommendation?.recommended_entry_price && 
           currentPricing[0]?.price !== rec.pricing_recommendation.recommended_entry_price)
      };
    }) || [];

    return Response.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      analysis: {
        total_products_analyzed: recommendations.length,
        products_needing_adjustment: recommendations.filter(r => r.adjustment_needed).length,
        recommendations,
        portfolio_optimization: response.portfolio_optimization
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=86400'
      }
    });
  } catch (error) {
    return Response.json(
      { 
        error: error.message, 
        status: 'analysis_failed',
        timestamp: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
});