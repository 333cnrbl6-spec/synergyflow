import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductReadinessMonitor() {
  const [readiness, setReadiness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchReadinessData();
  }, []);

  const fetchReadinessData = async () => {
    try {
      const data = await base44.entities.ProductReadiness.list('-last_assessed');
      setReadiness(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load readiness data');
    } finally {
      setLoading(false);
    }
  };

  const triggerMonitoring = async () => {
    setChecking(true);
    try {
      const response = await base44.functions.invoke('monitorProductReadiness', {});
      toast.success(`Monitoring complete. ${response.data.alerts_triggered} alert(s) triggered.`);
      await fetchReadinessData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to run readiness monitoring');
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 border-green-300';
    if (percentage >= 75) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 90) return <Badge className="bg-green-600">Ready</Badge>;
    if (percentage >= 75) return <Badge className="bg-yellow-600">At Risk</Badge>;
    return <Badge className="bg-red-600">Low Readiness</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const lowReadinessProducts = readiness.filter(r => r.overall_readiness_percentage < 90);

  return (
    <div className="space-y-4">
      {/* Header with monitoring trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Readiness Monitor</h2>
          <p className="text-sm text-slate-600">Track readiness across portfolio and auto-trigger alerts</p>
        </div>
        <Button
          onClick={triggerMonitoring}
          disabled={checking}
          className="gap-2"
        >
          <Activity className="w-4 h-4" />
          {checking ? 'Monitoring...' : 'Run Check'}
        </Button>
      </div>

      {/* Alert Summary */}
      {lowReadinessProducts.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Active Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              <strong>{lowReadinessProducts.length}</strong> product(s) below 90% readiness threshold. Proposals have been auto-triggered.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Readiness Grid */}
      <div className="grid gap-3">
        {readiness.map((product) => (
          <Card key={product.id} className={`border-2 ${getStatusColor(product.overall_readiness_percentage)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(product.overall_readiness_percentage)}
                    <h3 className="font-semibold text-slate-900">{product.product_name}</h3>
                    {getStatusBadge(product.overall_readiness_percentage)}
                  </div>

                  {/* Readiness Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                    {[
                      { label: 'Documentation', value: product.documentation_readiness },
                      { label: 'Security', value: product.security_readiness },
                      { label: 'Performance', value: product.performance_readiness },
                      { label: 'Features', value: product.feature_completeness },
                      { label: 'Market', value: product.market_readiness }
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white rounded p-2 border">
                        <p className="text-xs text-slate-600">{metric.label}</p>
                        <p className="text-lg font-bold text-slate-900">{metric.value || 0}%</p>
                      </div>
                    ))}
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">Overall</span>
                      <span className="text-sm font-bold text-slate-900">{product.overall_readiness_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          product.overall_readiness_percentage >= 90 ? 'bg-green-600' :
                          product.overall_readiness_percentage >= 75 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${product.overall_readiness_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Identified Gaps */}
                  {product.identified_gaps && product.identified_gaps.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Identified Gaps:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.identified_gaps.map((gap, idx) => (
                          <Badge
                            key={idx}
                            variant={gap.priority === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {gap.category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert Status */}
                {product.alert_triggered && (
                  <div className="text-right">
                    <Badge className="bg-orange-600 mb-2">Alert Triggered</Badge>
                    <p className="text-xs text-slate-600">
                      Proposal ID:<br />
                      <span className="font-mono text-xs">{product.related_proposal_id?.slice(0, 8)}...</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Automated Monitoring:</span> Products below 90% readiness trigger a Low Readiness Alert proposal automatically. Board can then initiate a Product Readiness Proposal to address gaps systematically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}