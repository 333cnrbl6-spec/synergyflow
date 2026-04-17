import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function BenchmarkComparison({ productAnalytics, benchmarks = [] }) {
  const comparisonData = useMemo(() => {
    if (!productAnalytics || benchmarks.length === 0) return null;

    // Churn Rate Comparison
    const churnComparison = [];
    const churnBenchmarks = benchmarks.filter(b => b.metric_type === 'churn_rate');
    
    productAnalytics.forEach(product => {
      const data = { name: product.name, actual: product.churn_rate };
      const benchmark = churnBenchmarks.find(b => !b.product_id || b.product_id === product.id);
      if (benchmark) {
        data.benchmark = benchmark.value;
        data.source = benchmark.source;
      }
      churnComparison.push(data);
    });

    // MRR Comparison (portfolio-wide)
    const mrrBenchmarks = benchmarks.filter(b => b.metric_type === 'mrr');
    const totalMRR = productAnalytics.reduce((sum, p) => sum + (p.mrr || 0), 0);
    const mrrComparison = [{
      name: 'Portfolio MRR',
      actual: totalMRR,
      benchmark: mrrBenchmarks.find(b => !b.product_id)?.value || null,
      source: mrrBenchmarks.find(b => !b.product_id)?.source || ''
    }];

    // ARPU Comparison
    const arpuBenchmarks = benchmarks.filter(b => b.metric_type === 'arpu');
    const arpuComparison = productAnalytics
      .filter(p => p.arpu > 0)
      .map(product => {
        const benchmark = arpuBenchmarks.find(b => !b.product_id || b.product_id === product.id);
        return {
          name: product.name,
          actual: product.arpu,
          benchmark: benchmark?.value || null,
          source: benchmark?.source || ''
        };
      });

    return {
      churn: churnComparison.filter(c => c.benchmark),
      mrr: mrrComparison.filter(m => m.benchmark),
      arpu: arpuComparison.filter(a => a.benchmark)
    };
  }, [productAnalytics, benchmarks]);

  if (!comparisonData || (comparisonData.churn.length === 0 && comparisonData.mrr.length === 0 && comparisonData.arpu.length === 0)) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No benchmarks configured yet. Add benchmarks to compare performance.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Performance vs. Benchmarks
      </h3>

      {/* Churn Rate Comparison */}
      {comparisonData.churn.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Churn Rate vs. Industry Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.churn} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => value.toFixed(2) + '%'} />
                <Legend />
                <Bar dataKey="actual" fill="#ef4444" radius={[8, 8, 0, 0]} name="Actual Churn" />
                <Bar dataKey="benchmark" fill="#10b981" radius={[8, 8, 0, 0]} name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
            <ChurnInsights data={comparisonData.churn} />
          </CardContent>
        </Card>
      )}

      {/* MRR Comparison */}
      {comparisonData.mrr.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Recurring Revenue vs. Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData.mrr}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'MRR ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => '$' + value.toFixed(0)} />
                <Legend />
                <Bar dataKey="actual" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Actual MRR" />
                <Bar dataKey="benchmark" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ARPU Comparison */}
      {comparisonData.arpu.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ARPU vs. Industry Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.arpu} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'ARPU ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => '$' + value.toFixed(2)} />
                <Legend />
                <Bar dataKey="actual" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Actual ARPU" />
                <Bar dataKey="benchmark" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChurnInsights({ data }) {
  const insights = data.map(item => {
    const diff = item.actual - item.benchmark;
    const percentDiff = ((diff / item.benchmark) * 100).toFixed(1);
    const isAboveTarget = diff > 0;
    
    return {
      name: item.name,
      diff,
      percentDiff,
      isAboveTarget,
      status: isAboveTarget ? 'below_target' : 'meeting_target'
    };
  });

  return (
    <div className="mt-4 space-y-2">
      {insights.map(insight => (
        <div key={insight.name} className={`flex items-center justify-between p-3 rounded-lg ${
          insight.isAboveTarget ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <span className="font-semibold text-sm">{insight.name}</span>
          <div className="flex items-center gap-2">
            {insight.isAboveTarget ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            <span className={`text-sm font-semibold ${
              insight.isAboveTarget ? 'text-red-700' : 'text-green-700'
            }`}>
              {insight.isAboveTarget ? '+' : ''}{insight.percentDiff}% {insight.isAboveTarget ? 'above' : 'below'} benchmark
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}