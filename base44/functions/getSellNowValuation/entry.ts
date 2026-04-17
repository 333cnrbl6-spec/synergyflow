import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all products and board data
    const [products, boardMembers, proposals] = await Promise.all([
      base44.entities.Product.list(),
      base44.entities.BoardMember.list(),
      base44.entities.BoardProposal.filter({ status: 'approved' }),
    ]);

    // Calculate individual product valuations
    const productValuations = products.map(product => {
      const tiers = product.pricing_tiers || [];
      const monthlyMRR = tiers.reduce((sum, tier) => sum + (tier.price || 0), 0);
      const annualARR = monthlyMRR * 12;

      // Calculate readiness score
      const hasMultipleTiers = tiers.length >= 3;
      const hasEnterprise = tiers.some(t => t.price >= 400);
      const hasMid = tiers.some(t => t.price >= 100 && t.price < 400);
      let readinessScore = 40;
      if (hasMultipleTiers) readinessScore += 20;
      if (hasEnterprise) readinessScore += 20;
      if (hasMid) readinessScore += 20;

      // Valuation multiple based on readiness (8x base, up to 12x for launch-ready)
      const baseMultiple = 8;
      const readinessBonus = (readinessScore / 100) * 4;
      const multiple = baseMultiple + readinessBonus;

      return {
        product_name: product.name,
        monthly_mrr: monthlyMRR,
        annual_arr: annualARR,
        readiness_score: readinessScore,
        valuation_multiple: multiple.toFixed(1),
        sell_now_value: Math.round(annualARR * multiple),
      };
    });

    // Calculate complete board ecosystem valuation
    const totalAnnualARR = productValuations.reduce((sum, pv) => sum + pv.annual_arr, 0);
    const minReadiness = Math.min(...productValuations.map(pv => pv.readiness_score));
    const boardParityScore = minReadiness;

    // Board premium: coordinated ecosystem gets 1.5x multiplier above individual products
    const boardBaseMultiple = 9.5; // Higher than individual products
    const boardEcosystemBonus = (boardParityScore / 100) * 5; // Up to 5x for perfect parity
    const boardMultiple = (boardBaseMultiple + boardEcosystemBonus) * 1.5; // 1.5x ecosystem bonus

    const boardValuation = Math.round(totalAnnualARR * boardMultiple);

    return Response.json({
      individual_products: productValuations,
      board_ecosystem: {
        total_annual_arr: totalAnnualARR,
        board_parity_score: boardParityScore,
        ecosystem_multiple: boardMultiple.toFixed(2),
        sell_now_value: boardValuation,
        value_uplift_vs_sum: Math.round(boardValuation - productValuations.reduce((sum, pv) => sum + pv.sell_now_value, 0)),
      },
      approved_proposals_count: proposals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});