import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { CalendarDays, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const chartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const dataPoints = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Calculate metrics for this date (simulate based on historical pattern)
      const subs = subscriptions.filter(s => new Date(s.start_date) <= date);
      const cancelled = subs.filter(s => s.cancellation_date && new Date(s.cancellation_date) <= date);
      const active = subs.filter(s => s.status === 'active' || new Date(s.start_date) <= date);

      const mrr = active
        .filter(s => !s.cancellation_date || new Date(s.cancellation_date) > date)
        .reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;

      const churnCount = cancelled.length;

      dataPoints.push({
        date: dateStr,
        mrr: parseFloat(mrr.toFixed(2)),
        subscriptions: active.length,
        churn: churnCount
      });
    }

    return dataPoints;
  }, [subscriptions, startDate, endDate]);

  const mrrData = useMemo(() => chartData.map(d => ({ date: d.date, mrr: d.mrr })), [chartData]);
  const subscriptionData = useMemo(() => chartData.map(d => ({ date: d.date, count: d.subscriptions })), [chartData]);
  const churnDistribution = useMemo(() => {
    const totalChurn = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalActive = subscriptions.filter(s => s.status === 'active').length;
    return [
      { name: 'Active', value: totalActive, fill: '#10b981' },
      { name: 'Cancelled', value: totalChurn, fill: '#ef4444' },
      { name: 'Paused', value: subscriptions.filter(s => s.status === 'paused').length, fill: '#f59e0b' }
    ];
  }, [subscriptions]);

  const churnByProduct = useMemo(() => {
    const productMap = new Map(products.map(p => [p.id, p.name]));
    const churnMap = new Map();

    subscriptions.forEach(s => {
      const productName = productMap.get(s.product_id) || 'Unknown';
      const churnCount = s.status === 'cancelled' ? 1 : 0;
      churnMap.set(productName, (churnMap.get(productName) || 0) + churnCount);
    });

    return Array.from(churnMap, ([product, churn]) => ({
      product,
      churn
    }));
  }, [subscriptions, products]);

  const metrics = useMemo(() => {
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalMrr = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;

    const churnRate = subscriptions.length > 0
      ? ((cancelledCount / subscriptions.length) * 100).toFixed(2)
      : 0;

    return {
      activeCount,
      cancelledCount,
      totalMrr: totalMrr.toFixed(2),
      churnRate
    };
  }, [subscriptions]);

  if (loadingSubs) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-2">Portfolio trends, growth, and churn analysis</p>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 7);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 30);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 90);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
              >
                Last 90 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrics.activeCount}</div>
              <p className="text-xs text-slate-500 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">${metrics.totalMrr}</div>
              <p className="text-xs text-slate-500 mt-1">Monthly revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${parseFloat(metrics.churnRate) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.churnRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Overall rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{metrics.cancelledCount}</div>
              <p className="text-xs text-slate-500 mt-1">Total cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRR Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                MRR Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mrr"
                    stroke="#667eea"
                    dot={false}
                    isAnimationActive={false}
                    name="MRR ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subscription Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={subscriptionData}>
                  <defs>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSubs)"
                    isAnimationActive={false}
                    name="Active Subscriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subscription Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={churnDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {churnDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Churn by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Churn by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={churnByProduct}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="churn" fill="#ef4444" name="Cancelled Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}