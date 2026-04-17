import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users } from 'lucide-react';

export default function BoardValuationSuggestions() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const props = await base44.entities.ValuationProposal.list('-created_date');
        setProposals(props);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calculateStats = () => {
    if (proposals.length === 0) return null;

    const allValues = [];
    const byProduct = {};

    proposals.forEach(p => {
      p.products?.forEach(prod => {
        const value = prod.annual_revenue_potential * prod.valuation_multiple;
        allValues.push(value);
        
        if (!byProduct[prod.product_name]) {
          byProduct[prod.product_name] = [];
        }
        byProduct[prod.product_name].push(value);
      });
    });

    const avgTotal = allValues.reduce((a, b) => a + b, 0) / proposals.length;
    const minTotal = Math.min(...allValues);
    const maxTotal = Math.max(...allValues);

    return { avgTotal, minTotal, maxTotal, byProduct };
  };

  const stats = calculateStats();

  if (loading) return <div className="text-center py-8">Loading board suggestions...</div>;

  if (proposals.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-600">
        No valuation suggestions yet — board members can submit proposals in the Portfolio Valuation tab
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-blue-900 font-semibold mb-1">BOARD CONSENSUS VALUE</p>
              <p className="text-3xl font-black text-blue-900">£{Math.round(stats.avgTotal).toLocaleString()}M</p>
              <p className="text-xs text-blue-800 mt-1">Average of {proposals.length} board suggestions</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-green-900 font-semibold mb-1">LOWEST BOARD ESTIMATE</p>
              <p className="text-3xl font-black text-green-900">£{Math.round(stats.minTotal).toLocaleString()}M</p>
              <p className="text-xs text-green-800 mt-1">Most conservative valuation</p>
            </div>
            <div className="text-3xl">📉</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-purple-900 font-semibold mb-1">HIGHEST BOARD ESTIMATE</p>
              <p className="text-3xl font-black text-purple-900">£{Math.round(stats.maxTotal).toLocaleString()}M</p>
              <p className="text-xs text-purple-800 mt-1">Most optimistic valuation</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </Card>
      </div>

      {/* All Proposals */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-bold text-slate-900">Board Member Valuations</h3>
          <Badge className="ml-auto">{proposals.length} suggestions</Badge>
        </div>

        <div className="space-y-3">
          {proposals.map((proposal, idx) => {
            const totalValue = proposal.products.reduce((sum, p) => sum + (p.annual_revenue_potential * p.valuation_multiple), 0);
            const suiteBonus = (totalValue * proposal.suite_premium_percentage) / 100;
            const suiteValue = totalValue + suiteBonus;

            return (
              <div key={proposal.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{proposal.title}</h4>
                    <p className="text-sm text-slate-600">By {proposal.proposed_by}</p>
                  </div>
                  <Badge className={proposal.status === 'approved' ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-900'}>
                    {proposal.status}
                  </Badge>
                </div>

                {/* Product Breakdown */}
                <div className="bg-slate-50 rounded p-3 mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Product Assumptions:</p>
                  <div className="space-y-1 text-xs">
                    {proposal.products.map((prod, i) => {
                      const value = prod.annual_revenue_potential * prod.valuation_multiple;
                      return (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-700">
                            {prod.product_name}: £{prod.annual_revenue_potential.toLocaleString()} ARR × {prod.valuation_multiple}x
                          </span>
                          <span className="font-semibold text-slate-900">£{value.toLocaleString()}M</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suite Valuation */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-purple-900 font-semibold">Suite Value (+{proposal.suite_premium_percentage}% integration)</p>
                      <p className="text-xs text-purple-800 mt-1">
                        £{totalValue.toLocaleString()}M (individual) + £{suiteBonus.toLocaleString()}M (premium)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-800 font-semibold">Total</p>
                      <p className="text-2xl font-black text-purple-700">£{Math.round(suiteValue).toLocaleString()}M</p>
                    </div>
                  </div>
                </div>

                {/* Votes */}
                {(proposal.yes_votes?.length > 0 || proposal.no_votes?.length > 0) && (
                  <div className="mt-2 flex gap-4 text-xs">
                    {proposal.yes_votes?.length > 0 && (
                      <span className="text-green-700">✓ {proposal.yes_votes.length} approval votes</span>
                    )}
                    {proposal.no_votes?.length > 0 && (
                      <span className="text-red-700">✗ {proposal.no_votes.length} rejection votes</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}