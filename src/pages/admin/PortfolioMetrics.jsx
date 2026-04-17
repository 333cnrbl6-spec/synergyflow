import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Package, Target, Zap } from 'lucide-react';
import ActionItemsMonitor from '@/components/ActionItemsMonitor';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

const PRODUCT_NAMES = ['Premiso', 'Species Explorer', 'Age UK Bury', 'CaseNarrative'];
const COLORS = ['#0f172a', '#64748b', '#334155', '#1e293b'];

export default function PortfolioMetrics() {
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, subsRes] = await Promise.all([
          base44.entities.Product.list(),
          base44.entities.Subscription.list()
        ]);
        setProducts(productsRes);
        setSubscriptions(subsRes);
      } catch (e) {
        console.error('Error fetching portfolio data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate portfolio metrics
  const productMetrics = PRODUCT_NAMES.map(name => {
    const product = products.find(p => p.name === name);
    const productSubs = subscriptions.filter(s => s.product_id === product?.id);
    
    const activeSubs = productSubs.filter(s => s.status === 'active').length;
    const totalMRR = productSubs
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;
    
    return {
      name,
      subscriptions: activeSubs,
      mrr: totalMRR,
      tiers: product?.pricing_tiers?.length || 0,
      features: product?.features?.length || 0,
      target_market: product?.target_market || 'N/A',
      status: activeSubs > 0 ? 'Active' : 'Pending'
    };
  });

  // Portfolio totals
  const totalMRR = productMetrics.reduce((sum, p) => sum + p.mrr, 0);
  const totalSubs = productMetrics.reduce((sum, p) => sum + p.subscriptions, 0);
  const activeProducts = productMetrics.filter(p => p.status === 'Active').length;
  const avgMRRPerProduct = activeProducts > 0 ? totalMRR / activeProducts : 0;

  // Data for charts
  const mrrData = productMetrics.map(p => ({ name: p.name, value: Math.round(p.mrr) }));
  const subData = productMetrics.map(p => ({ name: p.name, value: p.subscriptions }));
  const healthData = productMetrics.map(p => ({
    name: p.name,
    subscriptions: p.subscriptions,
    tiers: p.tiers,
    features: p.features
  }));

  const MetricCard = ({ icon: Icon, label, value, trend, color }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {trend && <p className="text-xs text-green-600 mt-1">📈 {trend}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Portfolio Dashboard</h1>
          <p className="text-slate-600 mt-2">Cross-product KPI tracking & performance overview</p>
          
          {/* Tabs */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Advanced Analytics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
        <>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={DollarSign}
            label="Total MRR"
            value={`$${totalMRR.toFixed(0)}`}
            trend={`+${(totalMRR / 12).toFixed(0)} ARR`}
            color="bg-blue-600"
          />
          <MetricCard
            icon={Users}
            label="Active Subscriptions"
            value={totalSubs}
            trend={`${activeProducts}/${PRODUCT_NAMES.length} active`}
            color="bg-green-600"
          />
          <MetricCard
            icon={TrendingUp}
            label="Avg MRR/Product"
            value={`$${avgMRRPerProduct.toFixed(0)}`}
            trend={activeProducts > 0 ? `${activeProducts} products` : 'Ramp up'}
            color="bg-purple-600"
          />
          <MetricCard
            icon={Package}
            label="Portfolio Products"
            value={PRODUCT_NAMES.length}
            trend={`${activeProducts} generating revenue`}
            color="bg-amber-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* MRR by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Recurring Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="value" fill="#0f172a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subscriptions by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#64748b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Product Health */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productMetrics.map((product, idx) => (
                <div key={product.name} className="pb-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx] }}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-600">{product.target_market}</p>
                      </div>
                    </div>
                    <Badge
                      className={product.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}
                    >
                      {product.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Subscriptions</p>
                      <p className="font-bold text-lg">{product.subscriptions}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">MRR</p>
                      <p className="font-bold text-lg">${product.mrr.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Pricing Tiers</p>
                      <p className="font-bold text-lg">{product.tiers}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Features</p>
                      <p className="font-bold text-lg">{product.features}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mrrData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color) => (
                      <Cell key={`cell-${color}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Richness vs Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="features" fill="#0f172a" />
                  <Bar dataKey="subscriptions" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </div>

          {/* Automation & Action Items */}
          <div className="mt-8">
            <ActionItemsMonitor />
          </div>
          </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AdvancedAnalytics products={products} subscriptions={subscriptions} />
          )}
          </div>
          </div>
          );
          }