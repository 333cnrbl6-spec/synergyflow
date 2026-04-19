import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { portfolio_name } = await req.json().catch(() => ({}));

    // Pricing and feature data
    const pricingData = {
      portfolio_name: portfolio_name || 'SynergyFlow Suite',
      tiers: [
        {
          name: 'Starter',
          price: 149,
          description: 'Perfect for small teams getting started',
          features: [
            'Single product access',
            'Up to 5 team members',
            'Email support',
            'Basic reporting',
            'Community forum access'
          ],
          notIncluded: ['API access', 'Advanced analytics', 'Custom workflows', 'Dedicated support']
        },
        {
          name: 'Professional',
          price: 449,
          description: 'Ideal for growing teams',
          features: [
            '2-3 product bundle',
            'Up to 25 team members',
            'Priority email support',
            'Advanced reporting & analytics',
            'API access (50K req/month)',
            'Custom workflows',
            'Real-time collaboration'
          ],
          notIncluded: ['24/7 support', 'Dedicated account manager', 'SLA guarantee', 'White-label options']
        },
        {
          name: 'Enterprise',
          price: 1299,
          description: 'Complete suite for large organizations',
          features: [
            'All 4 products included',
            'Unlimited team members',
            '24/7 phone & email support',
            'Custom analytics & dashboards',
            'Unlimited API requests',
            'Advanced security & compliance',
            'Dedicated account manager',
            'SLA guarantee (99.9% uptime)'
          ],
          notIncluded: []
        }
      ],
      competitiveAdvantages: [
        'Unified platform: All tools work seamlessly together',
        'Real-time synergy: Data flows between products automatically',
        'Integrated analytics: Single dashboard for all metrics',
        'Lower total cost: Bundle savings vs. buying separately',
        'Enterprise security: SOC 2 Type II certified',
        'Expert onboarding: Dedicated setup support'
      ],
      products: [
        { name: 'Property Management', icon: '🏢' },
        { name: 'Research Tools', icon: '🔬' },
        { name: 'Charity Hub', icon: '❤️' },
        { name: 'Legal Case Builder', icon: '⚖️' }
      ]
    };

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; background: white; color: #1f2937; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 32px; font-weight: bold; margin: 0 0 10px 0; color: #111827; }
    h2 { font-size: 24px; font-weight: bold; margin: 30px 0 20px 0; color: #111827; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 40px; }
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
    .pricing-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .pricing-card.featured { border: 2px solid #2563eb; background: #eff6ff; }
    .tier-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
    .tier-price { font-size: 32px; font-weight: bold; color: #2563eb; margin: 10px 0; }
    .tier-desc { font-size: 12px; color: #6b7280; margin-bottom: 15px; }
    .features { list-style: none; padding: 0; margin: 0; }
    .features li { font-size: 13px; padding: 5px 0; color: #374151; }
    .features li:before { content: '✓ '; color: #10b981; font-weight: bold; margin-right: 5px; }
    .not-included li:before { content: '✗ '; color: #ef4444; }
    .not-included { color: #6b7280; }
    .advantage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .advantage { padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 13px; }
    .products { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
    .product { padding: 15px; text-align: center; background: #f9fafb; border-radius: 4px; }
    .product-icon { font-size: 32px; margin-bottom: 5px; }
    .product-name { font-size: 13px; font-weight: 500; }
    .footer { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .comparison-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .comparison-table th { background: #2563eb; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
    .comparison-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .comparison-table tr:nth-child(even) { background: #f9fafb; }
    .check { color: #10b981; font-weight: bold; }
    .cross { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${pricingData.portfolio_name}</h1>
    <p class="subtitle">Complete software suite for property management, research, charity operations, and legal case management</p>

    <h2>Our Products</h2>
    <div class="products">
      ${pricingData.products.map(p => `
        <div class="product">
          <div class="product-icon">${p.icon}</div>
          <div class="product-name">${p.name}</div>
        </div>
      `).join('')}
    </div>

    <h2>Pricing Plans</h2>
    <div class="pricing-grid">
      ${pricingData.tiers.map((tier, idx) => `
        <div class="pricing-card ${idx === 1 ? 'featured' : ''}">
          <div class="tier-name">${tier.name}</div>
          <div class="tier-price">£${tier.price}</div>
          <div class="tier-desc">${tier.description}</div>
          <ul class="features">
            ${tier.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <h2>Why SynergyFlow Stands Out</h2>
    <div class="advantage-grid">
      ${pricingData.competitiveAdvantages.map(adv => `<div class="advantage">✦ ${adv}</div>`).join('')}
    </div>

    <h2>Feature Comparison</h2>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>Starter</th>
          <th>Professional</th>
          <th>Enterprise</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Products Included</td>
          <td><span class="check">1</span></td>
          <td><span class="check">2-3</span></td>
          <td><span class="check">All 4</span></td>
        </tr>
        <tr>
          <td>Team Members</td>
          <td><span class="check">5</span></td>
          <td><span class="check">25</span></td>
          <td><span class="check">Unlimited</span></td>
        </tr>
        <tr>
          <td>Real-time Collaboration</td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">✓</span></td>
          <td><span class="check">✓</span></td>
        </tr>
        <tr>
          <td>Advanced Analytics</td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">✓</span></td>
          <td><span class="check">✓</span></td>
        </tr>
        <tr>
          <td>API Access</td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">✓</span></td>
          <td><span class="check">✓</span></td>
        </tr>
        <tr>
          <td>Custom Workflows</td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">✓</span></td>
          <td><span class="check">✓</span></td>
        </tr>
        <tr>
          <td>24/7 Support</td>
          <td><span class="cross">✗</span></td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">✓</span></td>
        </tr>
        <tr>
          <td>SLA Guarantee</td>
          <td><span class="cross">✗</span></td>
          <td><span class="cross">✗</span></td>
          <td><span class="check">99.9%</span></td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>For more information visit www.synergyflow.io | Email: sales@synergyflow.io | Phone: +44 (0)20 1234 5678</p>
      <p>© 2026 SynergyFlow. All rights reserved. | Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Return HTML (client will convert to PDF)
    return Response.json({
      status: 'success',
      html,
      filename: `${pricingData.portfolio_name.replace(/\s+/g, '_')}_Pricing.html`
    });
  } catch (error) {
    return Response.json(
      { error: error.message, status: 'failed' },
      { status: 500 }
    );
  }
});