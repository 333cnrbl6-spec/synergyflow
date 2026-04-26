import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsOverview({ stats }) {
  const StatCard = ({ icon: Icon, label, value, unit = '', trend = 0 }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {unit && <span className="text-xs text-slate-500">{unit}</span>}
            </div>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {trend !== 0 && (
          <div className="flex items-center gap-1 mt-3">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={trend > 0 ? 'text-green-600 text-xs font-semibold' : 'text-red-600 text-xs font-semibold'}>
              {Math.abs(trend)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return {
    StatCard
  };
}