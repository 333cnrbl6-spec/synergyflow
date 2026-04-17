import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function ProposalValueImpact({ proposalId, products = [] }) {
  const [valueData, setValueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValueImpact = async () => {
      try {
        const proposal = await base44.entities.BoardProposal.list().then(props => 
          props.find(p => p.id === proposalId)
        );
        
        if (!proposal) return;

        // Calculate value impact based on products involved
        let totalValue = 0;
        let valuationMetrics = [];

        if (proposal.products_involved && proposal.products_involved.length > 0) {
          const snapshots = await base44.entities.ValuationSnapshot.filter({});
          
          proposal.products_involved.forEach(productId => {
            const product = products.find(p => p.id === productId);
            const snapshot = snapshots.find(s => s.product_id === productId);
            
            if (snapshot) {
              totalValue += snapshot.sell_now_value || 0;
              valuationMetrics.push({
                product: product?.name || productId,
                value: snapshot.sell_now_value,
                arr: snapshot.annual_arr,
                multiple: snapshot.valuation_multiple,
              });
            }
          });
        }

        setValueData({
          totalValue,
          metrics: valuationMetrics,
          proposalType: proposal.proposal_type,
          unanimous: proposal.is_unanimous,
        });
      } catch (e) {
        console.error('Error loading value impact:', e);
      } finally {
        setLoading(false);
      }
    };

    loadValueImpact();
  }, [proposalId, products]);

  if (loading) return null;
  if (!valueData || valueData.metrics.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-bold text-emerald-900">Value Impact</span>
        {valueData.unanimous && (
          <Badge className="bg-emerald-600 text-white text-xs py-0">Unanimous</Badge>
        )}
      </div>

      <div className="space-y-1">
        {valueData.metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">{metric.product}</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700">£{metric.value?.toFixed(1) || 0}M</span>
              {metric.arr && (
                <span className="text-emerald-600 text-xs bg-emerald-100 px-2 py-0.5 rounded">
                  {(metric.arr / 1000000).toFixed(1)}M ARR @ {metric.multiple}x
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-emerald-300">
        <span className="font-bold text-emerald-900">Portfolio Impact</span>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-emerald-700">£{valueData.totalValue.toFixed(1)}M</span>
        </div>
      </div>
    </div>
  );
}