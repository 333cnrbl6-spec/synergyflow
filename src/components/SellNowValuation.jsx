import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Trophy } from 'lucide-react';

export default function SellNowValuation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValuation = async () => {
      try {
        const res = await base44.functions.invoke('getSellNowValuation', {});
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchValuation();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (num) => `£${(num / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      {/* Board Ecosystem Valuation */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-slate-900">Complete SynergyFlow Board</h3>
          </div>
          <Badge className="bg-green-600 text-white">Sell Now Value</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-sm text-slate-600 mb-1">Total Annual ARR</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.board_ecosystem.total_annual_arr)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-sm text-slate-600 mb-1">Board Parity Score</div>
            <div className="text-2xl font-bold text-green-600">{data.board_ecosystem.board_parity_score}%</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-sm text-slate-600 mb-1">Valuation Multiple</div>
            <div className="text-2xl font-bold text-slate-900">{data.board_ecosystem.ecosystem_multiple}x</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-green-300">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-700 font-semibold">Sell Now Value (Complete Ecosystem)</span>
            <div className="text-right">
              <div className="text-4xl font-black text-green-600">
                {formatCurrency(data.board_ecosystem.sell_now_value)}
              </div>
              <div className="text-xs text-green-700 mt-1">
                +{formatCurrency(data.board_ecosystem.value_uplift_vs_sum)} premium vs. individual sum
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-green-100 rounded-lg text-sm text-green-800">
          <p className="font-semibold mb-1">🎯 Ecosystem Advantage</p>
          <p>The SynergyFlow coordinated model commands a {((data.board_ecosystem.value_uplift_vs_sum / data.board_ecosystem.sell_now_value) * 100).toFixed(0)}% premium over selling products separately.</p>
        </div>
      </Card>

      {/* Individual Product Valuations */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Individual Product Valuations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.individual_products.map((product) => (
            <Card key={product.product_name} className="p-4 border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-semibold text-slate-900">{product.product_name}</h5>
                <Badge variant="outline" className="text-xs">
                  {product.readiness_score}% ready
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly MRR:</span>
                  <span className="font-semibold text-slate-900">£{product.monthly_mrr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Annual ARR:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(product.annual_arr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Multiple:</span>
                  <span className="font-semibold text-slate-900">{product.valuation_multiple}x</span>
                </div>
              </div>

              <div className="border-t pt-3 flex items-baseline justify-between">
                <span className="text-slate-600 text-sm">Sell Now Value:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(product.sell_now_value)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <div className="text-xs text-slate-600 mb-1">Approved Proposals</div>
          <div className="text-2xl font-bold text-slate-900">{data.approved_proposals_count}</div>
          <div className="text-xs text-slate-500">driving value</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-600 mb-1">Last Updated</div>
          <div className="text-sm font-mono text-slate-900">
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}