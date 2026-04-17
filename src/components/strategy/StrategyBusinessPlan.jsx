import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StrategyBusinessPlan({ proposals }) {
  const strategicTypes = [
    { type: 'pricing', label: '💰 Pricing Strategy', color: 'bg-blue-50 border-blue-200' },
    { type: 'build', label: '🛠️ Product Development', color: 'bg-green-50 border-green-200' },
    { type: 'go_to_market', label: '🚀 Go-to-Market', color: 'bg-purple-50 border-purple-200' },
    { type: 'partnership', label: '🤝 Partnerships', color: 'bg-orange-50 border-orange-200' },
    { type: 'governance', label: '📋 Governance', color: 'bg-slate-50 border-slate-200' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Plan Initiatives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategicTypes.map(({ type, label, color }) => {
            const count = proposals.filter(p => p.proposal_type === type).length;
            return (
              <div key={type} className={`border-2 rounded-lg p-4 ${color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
                    <p className="text-2xl font-black text-slate-900 mt-2">{count}</p>
                    <p className="text-xs text-slate-600 mt-1">Active initiatives</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}