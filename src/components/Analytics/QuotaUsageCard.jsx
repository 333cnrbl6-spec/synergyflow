import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function QuotaUsageCard({ label, used, limit, unit = '' }) {
  if (limit === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-slate-500 mb-2">{label}</p>
          <p className="text-xs text-slate-400">Unlimited</p>
        </CardContent>
      </Card>
    );
  }

  const percentage = Math.round((used / limit) * 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  let progressColor = 'bg-green-600';
  let statusIcon = CheckCircle2;
  let statusColor = 'text-green-600';

  if (isWarning) {
    progressColor = 'bg-yellow-600';
    statusIcon = AlertCircle;
    statusColor = 'text-yellow-600';
  }
  if (isCritical) {
    progressColor = 'bg-red-600';
    statusIcon = AlertCircle;
    statusColor = 'text-red-600';
  }

  const StatusIcon = statusIcon;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-600 mt-1">
                {used.toLocaleString()} / {limit.toLocaleString()} {unit}
              </p>
            </div>
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{percentage}% used</span>
            {percentage >= 80 && (
              <span className={`text-xs font-semibold ${statusColor}`}>
                {isCritical ? 'Critical' : 'Warning'}
              </span>
            )}
          </div>

          {/* Remaining */}
          <p className="text-xs text-slate-500">
            {limit - used} {unit} remaining
          </p>
        </div>
      </CardContent>
    </Card>
  );
}