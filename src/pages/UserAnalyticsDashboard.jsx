import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RefreshCw, TrendingUp, Database, Zap, FileText } from 'lucide-react';
import { toast } from 'sonner';
import UsageChart from '@/components/Analytics/UsageChart';
import QuotaUsageCard from '@/components/Analytics/QuotaUsageCard';
import UpsellRecommendation from '@/components/Analytics/UpsellRecommendation';

export default function UserAnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [quota, setQuota] = useState(null);
  const [upsellRecommendations, setUpsellRecommendations] = useState([]);
  const [visibleRecommendations, setVisibleRecommendations] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedProduct, timeRange]);

  // Show recommendations on first load
  useEffect(() => {
    if (upsellRecommendations.length > 0 && visibleRecommendations.size === 0) {
      const visible = new Set(upsellRecommendations.map(r => r.id));
      setVisibleRecommendations(visible);
    }
  }, [upsellRecommendations]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) throw new Error('Not authenticated');

      setUser(currentUser);

      // Load products
      const productList = await base44.entities.Product.list();
      setProducts(productList);

      // Set first product as default
      if (!selectedProduct && productList.length > 0) {
        setSelectedProduct(productList[0]);
      }

      if (selectedProduct) {
        // Load metrics for selected product
        const metricsData = await base44.entities.UsageMetrics.filter({
          user_email: currentUser.email,
          product_id: selectedProduct.id
        }, '-metric_date', 30);
        setMetrics(metricsData);

        // Load quota for selected product
        const quotaData = await base44.entities.SubscriptionQuota.filter({
          user_email: currentUser.email,
          product_id: selectedProduct.id
        });
        if (quotaData.length > 0) {
          setQuota(quotaData[0]);
        }

        // Load upsell recommendations
        const recsData = await base44.entities.UpsellRecommendation.filter({
          user_email: currentUser.email,
          status: 'active'
        });
        setUpsellRecommendations(recsData);
        
        // Track that user viewed recommendations
        recsData.forEach(rec => {
          base44.entities.UpsellRecommendation.update(rec.id, {
            click_count: (rec.click_count || 0) + 1
          }).catch(console.error);
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMetrics = async () => {
    if (metrics.length === 0) {
      toast.error('No metrics to export');
      return;
    }

    try {
      const csv = [
        ['Date', 'API Calls', 'Data Processed (GB)', 'Storage Used (GB)', 'Documents Created', 'Reports Generated'],
        ...metrics.map(m => [
          m.metric_date,
          m.api_calls || 0,
          m.data_processed_gb || 0,
          m.storage_used_gb || 0,
          m.documents_created || 0,
          m.reports_generated || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProduct.name}-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Metrics exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export metrics');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-600 mt-3">Loading your analytics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">Unable to load analytics. Please sign in and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = metrics.map(m => ({
    date: new Date(m.metric_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    api_calls: m.api_calls || 0,
    data_processed: m.data_processed_gb || 0,
    documents: m.documents_created || 0,
    reports: m.reports_generated || 0,
    storage: m.storage_used_gb || 0
  }));

  const criticalAlerts = quota ? [
    quota.current_api_calls_month >= quota.api_calls_limit * 0.95 && 'API calls approaching limit',
    quota.current_storage_used_gb >= quota.storage_limit_gb * 0.95 && 'Storage approaching limit',
    quota.current_team_members >= quota.team_members_limit && 'Team member limit reached'
  ].filter(Boolean) : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Usage</h1>
          <p className="text-slate-600 mt-1">Monitor your product usage and subscription quotas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportMetrics}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Upsell Recommendations */}
      {upsellRecommendations.length > 0 && (
        <div className="space-y-3">
          {upsellRecommendations.map((rec) => (
            visibleRecommendations.has(rec.id) && (
              <UpsellRecommendation
                key={rec.id}
                recommendation={rec}
                onDismiss={() => {
                  setVisibleRecommendations(prev => {
                    const next = new Set(prev);
                    next.delete(rec.id);
                    return next;
                  });
                  setUpsellRecommendations(prev => 
                    prev.filter(r => r.id !== rec.id)
                  );
                }}
                onUpgrade={() => {
                  toast.success('Redirecting to upgrade...');
                  // In real app, navigate to upgrade flow
                  window.location.href = `/upgrade?product=${rec.product_id}&tier=${rec.recommended_tier}`;
                }}
              />
            )
          ))}
        </div>
      )}

      {/* Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{alert}</p>
            </div>
          ))}
        </div>
      )}

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {products.map((product) => (
              <Button
                key={product.id}
                variant={selectedProduct?.id === product.id ? 'default' : 'outline'}
                onClick={() => setSelectedProduct(product)}
                className={selectedProduct?.id === product.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {product.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Range */}
      <div className="flex gap-2">
        {[
          { label: '7 Days', value: '7d' },
          { label: '30 Days', value: '30d' },
          { label: '90 Days', value: '90d' }
        ].map((range) => (
          <Button
            key={range.value}
            variant={timeRange === range.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range.value)}
            className={timeRange === range.value ? 'bg-slate-900' : ''}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {selectedProduct && quota ? (
        <>
          {/* Quota Overview */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Subscription Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuotaUsageCard
                label="API Calls"
                used={quota.current_api_calls_month}
                limit={quota.api_calls_limit}
                unit="calls/month"
              />
              <QuotaUsageCard
                label="Data Processing"
                used={quota.current_data_processed_gb}
                limit={quota.data_processing_limit_gb}
                unit="GB/month"
              />
              <QuotaUsageCard
                label="Storage"
                used={quota.current_storage_used_gb}
                limit={quota.storage_limit_gb}
                unit="GB"
              />
              <QuotaUsageCard
                label="Team Members"
                used={quota.current_team_members}
                limit={quota.team_members_limit}
              />
              <QuotaUsageCard
                label="Automation Runs"
                used={quota.current_automation_runs}
                limit={quota.automation_runs_limit}
                unit="runs/month"
              />
              <QuotaUsageCard
                label="Reports Generated"
                used={quota.current_reports}
                limit={quota.reports_limit}
                unit="reports/month"
              />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Quotas reset on {new Date(quota.reset_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Usage Charts */}
          {chartData.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Usage Over Time</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsageChart
                  data={chartData}
                  title="API Calls"
                  metric="api_calls"
                  type="line"
                  color="#0a0a0a"
                />
                <UsageChart
                  data={chartData}
                  title="Data Processed"
                  metric="data_processed"
                  type="line"
                  color="#2563eb"
                />
                <UsageChart
                  data={chartData}
                  title="Documents Created"
                  metric="documents"
                  type="bar"
                  color="#16a34a"
                />
                <UsageChart
                  data={chartData}
                  title="Reports Generated"
                  metric="reports"
                  type="bar"
                  color="#ea580c"
                />
              </div>
            </div>
          ) : (
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <p className="text-slate-600 text-center">No usage data available for this period</p>
              </CardContent>
            </Card>
          )}

          {/* Plan Details */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">
                  {quota.subscription_tier.toUpperCase()} PLAN
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <p>
                You're on the <strong>{quota.subscription_tier.charAt(0).toUpperCase() + quota.subscription_tier.slice(1)}</strong> plan for <strong>{quota.product_name}</strong>.
              </p>
              <p>
                Need more capacity? Upgrade your plan to increase your limits.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                View Upgrade Options
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <p className="text-slate-600 text-center">Select a product to view analytics and quota information</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}