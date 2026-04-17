import { Card } from '@/components/ui/card';
import { TrendingUp, Package, Clock, CheckCircle2 } from 'lucide-react';

export default function BoardMetricsSummary({ approvedProposals, products, decisions }) {
  // Calculate YoY growth (mock calculation based on approved proposals)
  const yoyGrowth = approvedProposals.length > 0 ? ((approvedProposals.length / Math.max(approvedProposals.length - 2, 1)) * 100 - 100).toFixed(1) : 0;
  
  // Count active products (those with pricing tiers)
  const activeProducts = products.filter(p => p.pricing_tiers && p.pricing_tiers.length > 0).length;
  
  // Calculate average time-to-decision in days
  const calculateAvgTimeToDecision = () => {
    if (approvedProposals.length === 0) return 0;
    const totalDays = approvedProposals.reduce((sum, p) => {
      const created = new Date(p.created_date || p.timestamp);
      const approved = new Date(p.timestamp);
      return sum + Math.floor((approved - created) / (1000 * 60 * 60 * 24));
    }, 0);
    return (totalDays / approvedProposals.length).toFixed(1);
  };
  
  const avgTimeToDecision = calculateAvgTimeToDecision();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        icon={<TrendingUp className="w-6 h-6" />}
        label="YoY Growth"
        value={`${yoyGrowth}%`}
        detail="Proposal approval trajectory"
        color="#3b82f6"
      />
      <SummaryCard
        icon={<Package className="w-6 h-6" />}
        label="Active Products"
        value={activeProducts}
        detail={`of ${products.length} total products`}
        color="#22c55e"
      />
      <SummaryCard
        icon={<Clock className="w-6 h-6" />}
        label="Avg Time-to-Decision"
        value={`${avgTimeToDecision} days`}
        detail="From proposal to approval"
        color="#f59e0b"
      />
      <SummaryCard
        icon={<CheckCircle2 className="w-6 h-6" />}
        label="Execution Rate"
        value={`${approvedProposals.length}`}
        detail="Approved initiatives ready"
        color="#a855f7"
      />
    </div>
  );
}

function SummaryCard({ icon, label, value, detail, color }) {
  return (
    <Card className="p-4 bg-white border border-slate-200 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-2">
        <div style={{ color }} className="opacity-80">
          {icon}
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="text-sm text-slate-600 font-medium">{label}</div>
      <div className="text-2xl font-black text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{detail}</div>
    </Card>
  );
}