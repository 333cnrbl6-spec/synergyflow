import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ValueImpactTracker({ proposals, products }) {
  const [valueImpact, setValueImpact] = useState(0);

  useEffect(() => {
    const calculateImpact = async () => {
      const approvedCount = proposals.filter(p => p.status === 'approved').length;
      
      // Fetch valuation snapshots for approved proposals
      try {
        const snapshots = await base44.entities.ValuationSnapshot.list().catch(() => []);
        const totalValue = snapshots.reduce((sum, s) => sum + (s.sell_now_value || 0), 0);
        
        // Use actual valuation data or fallback to calculation
        if (totalValue > 0) {
          setValueImpact(totalValue);
        } else {
          const baseValue = products.reduce((sum, p) => {
            const avgPrice = p.pricing_tiers?.reduce((acc, t) => acc + t.price, 0) / (p.pricing_tiers?.length || 1) || 0;
            return sum + avgPrice * 10;
          }, 0);
          const impactPercentage = approvedCount * 4;
          setValueImpact((baseValue * impactPercentage) / 100);
        }
      } catch (e) {
        console.error('Error calculating value impact:', e);
      }
    };
    
    calculateImpact();
  }, [proposals, products]);

  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending_chairman').length;

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-bold text-green-900">Portfolio Value Impact</h3>
          </div>
          <div className="text-3xl font-black text-green-600 mb-2">
            +£{Math.round(valueImpact).toLocaleString()}
          </div>
          <p className="text-xs text-green-800 mb-3">
            <strong>{approvedProposals}</strong> approved decisions automatically driving portfolio growth
            {pendingProposals > 0 && ` · ${pendingProposals} pending decisions`}
          </p>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white text-xs">Auto-Implemented</Badge>
            <Link to="/admin/board-impact">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-green-700 hover:bg-green-100 gap-2 h-8"
              >
                View Analytics
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl">📈</div>
          <p className="text-xs text-green-700 mt-1 font-semibold">Real-time</p>
        </div>
      </div>
    </Card>
  );
}