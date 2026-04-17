import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BoardMetricsSummary from '@/components/BoardMetricsSummary';
import SellNowValuation from '@/components/SellNowValuation';

export default function BoardImpactAnalytics() {
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [proposals, prods] = await Promise.all([
          base44.entities.BoardProposal.filter({ status: 'approved' }),
          base44.entities.Product.list(),
        ]);
        setApprovedProposals(proposals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const calculateMetrics = () => {
    const totalMRR = products.reduce((sum, p) => {
      const avgPrice = p.pricing_tiers?.reduce((acc, t) => acc + t.price, 0) / (p.pricing_tiers?.length || 1) || 0;
      return sum + avgPrice * 10; // Assume 10 customers per tier average
    }, 0);

    const totalTiers = products.reduce((sum, p) => sum + (p.pricing_tiers?.length || 0), 0);
    const avgTiersPerProduct = totalTiers / (products.length || 1);

    const pricingProposals = approvedProposals.filter(p => p.proposal_type === 'pricing').length;
    const buildProposals = approvedProposals.filter(p => p.proposal_type === 'build').length;
    const gtmProposals = approvedProposals.filter(p => p.proposal_type === 'go_to_market').length;

    return { totalMRR, totalTiers, avgTiersPerProduct, pricingProposals, buildProposals, gtmProposals };
  };

  const metrics = calculateMetrics();

  const PROPOSAL_COLORS = {
    pricing: '#3b82f6',
    build: '#22c55e',
    go_to_market: '#f59e0b',
    partnership: '#a855f7',
    governance: '#64748b',
    readiness: '#ef4444',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900">Board Impact Analytics</h1>
          <p className="text-slate-600 mt-2">How autonomous board decisions create competitive value</p>
        </div>

        {/* High-Level Summary */}
        <BoardMetricsSummary 
          approvedProposals={approvedProposals} 
          products={products}
          decisions={[]}
        />

        {/* Proposal Breakdown */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Approved Board Initiatives by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900">💰 Pricing Initiatives</div>
              <div className="text-3xl font-black text-blue-600 mt-2">{metrics.pricingProposals}</div>
              <p className="text-xs text-blue-700 mt-1">New tiers, positioning, monetization strategy</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-green-900">🛠️ Build Initiatives</div>
              <div className="text-3xl font-black text-green-600 mt-2">{metrics.buildProposals}</div>
              <p className="text-xs text-green-700 mt-1">Features, roadmap, technical decisions</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-amber-900">🚀 Go-to-Market</div>
              <div className="text-3xl font-black text-amber-600 mt-2">{metrics.gtmProposals}</div>
              <p className="text-xs text-amber-700 mt-1">Market entry, campaigns, positioning</p>
            </div>
          </div>
        </Card>

        {/* Products & Valuations */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Product Valuations & Market Tiers</h2>
          <div className="space-y-4">
            {products.map((product) => {
              const maxTierPrice = Math.max(...(product.pricing_tiers?.map(t => t.price) || [0]));
              const tierCount = product.pricing_tiers?.length || 0;
              return (
                <div key={product.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">£{maxTierPrice}/mo</div>
                      <div className="text-xs text-slate-600">Top tier</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.pricing_tiers?.map((tier, i) => (
                      <Badge key={i} variant="outline" className="bg-slate-50 border-slate-300">
                        {tier.name}: £{tier.price}/mo
                      </Badge>
                    ))}
                    {tierCount === 0 && <span className="text-xs text-slate-500 italic">No tiers configured</span>}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <strong>{tierCount}</strong> pricing tier{tierCount !== 1 ? 's' : ''} — Market sophistication level: {tierCount >= 3 ? '🟢 High' : tierCount === 2 ? '🟡 Medium' : '🔴 Basic'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Approved Proposals Timeline */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Approved Initiatives (Execution Ready)</h2>
          <div className="space-y-3">
            {approvedProposals.length === 0 ? (
              <p className="text-slate-600 text-sm">No approved proposals yet — board is still in discussion phase.</p>
            ) : (
              approvedProposals.map((proposal) => (
                <div key={proposal.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{proposal.summary}</p>
                    </div>
                    <Badge style={{ backgroundColor: PROPOSAL_COLORS[proposal.proposal_type] + '20', color: PROPOSAL_COLORS[proposal.proposal_type], borderColor: PROPOSAL_COLORS[proposal.proposal_type] }} variant="outline" className="ml-2">
                      {proposal.proposal_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600 mt-2">
                    <span>📌 Raised by: <strong>{proposal.raised_by}</strong></span>
                    <span>📅 {new Date(proposal.timestamp).toLocaleDateString()}</span>
                    <span>🎯 Products: {proposal.products_involved?.join(', ') || 'All'}</span>
                  </div>
                  {proposal.chairman_notes && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="text-xs font-semibold text-blue-900">Chairman Notes:</div>
                      <div className="text-xs text-blue-800 mt-1">{proposal.chairman_notes}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Sell Now Valuation */}
        <div>
          <SellNowValuation />
        </div>

        {/* Competitive Differentiation */}
        <Card className="p-6 bg-white border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🏆 Competitive Differentiation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">1. Parity-Driven Growth</h3>
              <p className="text-slate-600">
                Unlike competitors who optimize single products, your board forces collective advancement. Weakest products rise together, creating balanced portfolio strength.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">2. Autonomous Collaboration</h3>
              <p className="text-slate-600">
                Board decisions execute automatically without manual approval cycles. Time-to-market decisions compressed from weeks to hours. Competitors operate at human speed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">3. Cross-Product Synergy</h3>
              <p className="text-slate-600">
                Every proposal considers all products simultaneously. Prevents siloing, creates unified value. Integrated offerings your competitors can't match.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}