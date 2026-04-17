import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StrategyExecution({ proposals, products, users }) {
  const executionItems = proposals.map(p => ({
    ...p,
    owner: users.find(u => u.role?.toLowerCase().includes('officer')) || users[0],
    progress: Math.random() > 0.5 ? 'in-progress' : 'pending'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Execution Status & Owner Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {executionItems.length === 0 ? (
          <p className="text-slate-600 text-sm">No initiatives in execution yet.</p>
        ) : (
          executionItems.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{item.summary}</p>
                </div>
                <Badge className={`text-xs ${item.progress === 'in-progress' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.progress === 'in-progress' ? 'Executing' : 'Pending'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Execution Lead:</span>
                  <span className="font-medium text-slate-900">{item.owner?.full_name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Type:</span>
                  <Badge variant="outline" className="text-xs capitalize">{item.proposal_type.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}