import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { report_id } = body;

    if (!report_id) {
      return Response.json({ error: 'report_id required' }, { status: 400 });
    }

    // Fetch report config
    const report = await base44.entities.Report.get(report_id);
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch data for report
    const [products, subscriptions, benchmarks, actionItems] = await Promise.all([
      base44.entities.Product.list(),
      base44.entities.Subscription.list(),
      base44.entities.Benchmark.list(),
      base44.entities.ActionItem.filter({ status: 'open' })
    ]);

    // Calculate metrics
    const metrics = calculatePortfolioMetrics(subscriptions, products);
    const churnAnalysis = calculateChurnAnalysis(subscriptions);
    const benchmarkComparisons = calculateBenchmarkComparisons(metrics, benchmarks, products);

    // Generate HTML report
    let htmlContent = generateReportHTML({
      report,
      metrics,
      churnAnalysis,
      benchmarkComparisons,
      actionItems: report.include_action_items ? actionItems : [],
      products: report.include_product_breakdown ? products : [],
      subscriptions
    });

    // Send emails
    const emailPromises = report.recipients.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject: `${report.report_name} - ${new Date().toLocaleDateString()}`,
        body: htmlContent,
        from_name: 'Portfolio Reports'
      })
    );

    await Promise.all(emailPromises);

    // Update last_sent timestamp
    await base44.entities.Report.update(report_id, {
      last_sent: new Date().toISOString()
    });

    return Response.json({
      success: true,
      recipients_count: report.recipients.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculatePortfolioMetrics(subscriptions, products) {
  const active = subscriptions.filter(s => s.status === 'active').length;
  const cancelled = subscriptions.filter(s => s.status === 'cancelled').length;
  const paused = subscriptions.filter(s => s.status === 'paused').length;

  const totalMRR = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthly_price || 0), 0);

  const mrr = totalMRR / 100; // Convert from cents

  return {
    active_subscriptions: active,
    cancelled_subscriptions: cancelled,
    paused_subscriptions: paused,
    mrr,
    total_products: products.length,
    total_subscriptions: subscriptions.length
  };
}

function calculateChurnAnalysis(subscriptions) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentlyCancelled = subscriptions.filter(s => {
    if (s.status !== 'cancelled' || !s.cancellation_date) return false;
    const cancelDate = new Date(s.cancellation_date);
    return cancelDate >= thirtyDaysAgo;
  });

  const churnRate = subscriptions.length > 0
    ? (recentlyCancelled.length / subscriptions.length) * 100
    : 0;

  return {
    monthly_churn_rate: churnRate.toFixed(2),
    recently_cancelled: recentlyCancelled.length,
    retention_rate: (100 - churnRate).toFixed(2)
  };
}

function calculateBenchmarkComparisons(metrics, benchmarks, products) {
  const productMap = new Map(products.map(p => [p.id, p]));
  const comparisons = {};

  benchmarks.forEach(b => {
    const key = b.metric_type;
    if (!comparisons[key]) {
      comparisons[key] = { benchmarks: [], status: 'good' };
    }
    comparisons[key].benchmarks.push({
      name: b.benchmark_name,
      value: b.value,
      industry: b.industry,
      source: b.source
    });
  });

  return comparisons;
}

function generateReportHTML({ report, metrics, churnAnalysis, benchmarkComparisons, actionItems, products, subscriptions }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .section { margin: 30px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #667eea; }
        .section h2 { margin-top: 0; color: #667eea; font-size: 18px; }
        .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
        .metric-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
        .table td { padding: 10px; border-bottom: 1px solid #ddd; }
        .table tr:nth-child(even) { background: #fafafa; }
        .good { color: #22c55e; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #ddd; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.report_name}</h1>
        <p>Generated on ${currentDate}</p>
      </div>
  `;

  // Portfolio Metrics
  if (report.include_portfolio_metrics) {
    html += `
      <div class="section">
        <h2>Portfolio Metrics</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="metric-label">Monthly Recurring Revenue</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.active_subscriptions}</div>
            <div class="metric-label">Active Subscriptions</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.total_products}</div>
            <div class="metric-label">Total Products</div>
          </div>
        </div>
      </div>
    `;
  }

  // Churn Analysis
  if (report.include_churn_analysis) {
    const churnClass = parseFloat(churnAnalysis.monthly_churn_rate) < 5 ? 'good' : 'warning';
    html += `
      <div class="section">
        <h2>Churn Analysis</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value ${churnClass}">${churnAnalysis.monthly_churn_rate}%</div>
            <div class="metric-label">Monthly Churn Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${churnAnalysis.retention_rate}%</div>
            <div class="metric-label">Retention Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${churnAnalysis.recently_cancelled}</div>
            <div class="metric-label">Recently Cancelled (30d)</div>
          </div>
        </div>
      </div>
    `;
  }

  // Benchmark Comparison
  if (report.include_benchmark_comparison && Object.keys(benchmarkComparisons).length > 0) {
    html += `
      <div class="section">
        <h2>Benchmark Comparisons</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Our Performance</th>
              <th>Industry Benchmark</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
    `;

    Object.entries(benchmarkComparisons).forEach(([metric, data]) => {
      if (data.benchmarks.length > 0) {
        const bench = data.benchmarks[0];
        const ourValue = metrics[metric] || 'N/A';
        html += `
          <tr>
            <td><strong>${metric.replace(/_/g, ' ')}</strong></td>
            <td>${ourValue}</td>
            <td>${bench.value} (${bench.industry || 'General'})</td>
            <td>${bench.source}</td>
          </tr>
        `;
      }
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Action Items
  if (report.include_action_items && actionItems.length > 0) {
    html += `
      <div class="section">
        <h2>Open Action Items (${actionItems.length})</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    actionItems.slice(0, 10).forEach(item => {
      const dueDate = item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A';
      html += `
        <tr>
          <td>${item.title}</td>
          <td><strong>${item.priority}</strong></td>
          <td>${item.category}</td>
          <td>${dueDate}</td>
        </tr>
      `;
    });

    if (actionItems.length > 10) {
      html += `<tr><td colspan="4" style="text-align: center; color: #999;">... and ${actionItems.length - 10} more</td></tr>`;
    }

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  html += `
      <div class="footer">
        <p>This is an automated report. Do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}