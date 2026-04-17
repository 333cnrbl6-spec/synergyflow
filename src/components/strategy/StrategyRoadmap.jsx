import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

export default function StrategyRoadmap({ proposals }) {
  const timeline = [
    { phase: 'Q2 2026', status: 'in-progress', items: proposals.filter(p => p.proposal_type === 'pricing').length },
    { phase: 'Q3 2026', status: 'planned', items: proposals.filter(p => p.proposal_type === 'build').length },
    { phase: 'Q4 2026', status: 'planned', items: proposals.filter(p => p.proposal_type === 'go_to_market').length },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((quarter, idx) => (
            <div key={quarter.phase} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  quarter.status === 'in-progress' ? 'bg-green-600' : 'bg-slate-400'
                }`}>
                  {idx + 1}
                </div>
                {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-slate-300 mt-2" />}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{quarter.phase}</h3>
                  <Badge className={`text-xs ${quarter.status === 'in-progress' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {quarter.status === 'in-progress' ? 'In Progress' : 'Planned'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{quarter.items} initiatives in execution</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}