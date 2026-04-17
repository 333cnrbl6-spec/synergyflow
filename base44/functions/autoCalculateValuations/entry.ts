import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process when proposal is passed/approved
    if (data.approval_stage !== 'passed' && data.status !== 'approved') {
      return Response.json({ skipped: true });
    }

    // Get all products
    const products = await base44.asServiceRole.entities.Product.list();
    
    // Get latest subscriptions for each product to calculate MRR
    const subscriptions = await base44.asServiceRole.entities.Subscription.list();
    
    const valuationSnapshots = [];
    const today = new Date().toISOString().split('T')[0];

    for (const product of products) {
      // Calculate MRR from active subscriptions
      const productSubs = subscriptions.filter(s => s.product_id === product.id && s.status === 'active');
      const monthlyMRR = productSubs.reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100; // Convert from cents

      // Get valuation multiple from benchmarks or use default
      const benchmark = await base44.asServiceRole.entities.Benchmark.filter({
        product_id: product.id,
        metric_type: 'cltv'
      });
      
      const valuationMultiple = benchmark.length > 0 
        ? (benchmark[0].value || 12.0) 
        : 12.0; // Default SaaS multiple

      // Calculate ARR (annual recurring revenue)
      const annualARR = monthlyMRR * 12;

      // Calculate sell-now value: (MRR × 12 × multiple) / 1,000,000
      const sellNowValue = (monthlyMRR * 12 * valuationMultiple) / 1000000;

      // Create valuation snapshot
      const snapshot = await base44.asServiceRole.entities.ValuationSnapshot.create({
        product_id: product.id,
        product_name: product.name,
        monthly_mrr: Math.round(monthlyMRR * 100) / 100,
        annual_arr: Math.round(annualARR * 100) / 100,
        valuation_multiple: valuationMultiple,
        sell_now_value: Math.round(sellNowValue * 1000) / 1000, // Round to 3 decimals
        snapshot_date: today,
        trigger_proposal_id: data.id,
        calculation_method: 'mrr_based'
      });

      valuationSnapshots.push({
        product_name: product.name,
        monthly_mrr: snapshot.monthly_mrr,
        annual_arr: snapshot.annual_arr,
        valuation_multiple: valuationMultiple,
        sell_now_value: snapshot.sell_now_value
      });
    }

    // Calculate portfolio totals
    const portfolioMRR = valuationSnapshots.reduce((sum, s) => sum + s.monthly_mrr, 0);
    const portfolioValue = valuationSnapshots.reduce((sum, s) => sum + s.sell_now_value, 0);

    // Notify board of valuations
    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({ active: true });
    for (const member of boardMembers) {
      await base44.asServiceRole.entities.ProposalNotification.create({
        proposal_id: data.id,
        proposal_title: data.title,
        notification_type: 'passed',
        current_stage: 'execution',
        recipient: member.app_name,
        message: `✓ Valuations auto-calculated. Portfolio value: £${portfolioValue.toFixed(1)}M (MRR: £${Math.round(portfolioMRR)}). Snapshot taken for trend analysis.`,
        action_required: false,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      proposal_id: data.id,
      valuations_created: valuationSnapshots.length,
      portfolio_mrr: Math.round(portfolioMRR),
      portfolio_value: Math.round(portfolioValue * 10) / 10,
      valuations: valuationSnapshots
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});