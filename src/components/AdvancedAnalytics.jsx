import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import AnalyticsInsightsPanel from './AnalyticsInsightsPanel';

export default function AdvancedAnalytics({ products, subscriptions }) {
  // Calculate metrics for each product
  const productAnalytics = useMemo(() => {
    return products.map(product => {
      const productSubs = subscriptions.filter(s => s.product_id === product.id);
      const activeSubs = productSubs.filter(s => s.status === 'active').length;
      const cancelledSubs = productSubs.filter(s => s.status === 'cancelled').length;
      const pausedSubs = productSubs.filter(s => s.status === 'paused').length;

      const monthlyPrice = productSubs.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;
      const totalSubs = productSubs.length;

      // Churn rate calculation
      const churnRate = totalSubs > 0 ? (cancelledSubs / totalSubs) * 100 : 0;

      // Customer Lifetime Value (CLTV) calculation
      // CLTV = (Monthly Revenue / Active Subscribers) * (1 / Monthly Churn Rate) * (1 - Discount Rate)
      const monthlyARPU = activeSubs > 0 ? monthlyPrice / activeSubs : 0;
      const monthlyChurnRate = churnRate / 100;
      const discountRate = 0.1; // 10% discount rate for present value
      const monthlyRetention = Math.max(1 - monthlyChurnRate, 0);
      const cltv = monthlyARPU > 0 ? (monthlyARPU / Math.max(monthlyChurnRate, 0.01)) * (1 - discountRate) : 0;

      // MRR forecast (simple linear projection over 6 months)
      const currentMRR = monthlyPrice;
      const projectedGrowth = monthlyRetention > 0.85 ? 0.05 : monthlyRetention > 0.70 ? 0.02 : -0.03; // Growth based on retention
      const mrrForecast = Array.from({ length: 6 }, (_, i) => ({
        month: i + 1,
        current: currentMRR,
        projected: currentMRR * Math.pow(1 + projectedGrowth, i + 1)
      }));

      return {
        id: product.id,
        name: product.name,
        activeSubs,
        cancelledSubs,
        pausedSubs,
        totalSubs,
        mrr: monthlyPrice,
        churnRate: Math.round(churnRate * 10) / 10, // One decimal place
        cltv: Math.round(cltv),
        monthlyARPU: Math.round(monthlyARPU),
        retention: Math.round(monthlyRetention * 100),
        mrrForecast,
        health: monthlyRetention > 0.85 ? 'excellent' : monthlyRetention > 0.70 ? 'good' : monthlyRetention > 0.50 ? 'concerning' : 'critical'
      };
    });
  }, [products, subscriptions]);

  // Portfolio-level metrics
  const portfolioMetrics = useMemo(() => {
    const totalActiveSubs = productAnalytics.reduce((sum, p) => sum + p.activeSubs, 0);
    const totalCancelledSubs = productAnalytics.reduce((sum, p) => sum + p.cancelledSubs, 0);
    const totalMRR = productAnalytics.reduce((sum, p) => sum + p.mrr, 0);
    const avgChurnRate = productAnalytics.length > 0 ? productAnalytics.reduce((sum, p) => sum + p.churnRate, 0) / productAnalytics.length : 0;
    const avgCLTV = productAnalytics.length > 0 ? productAnalytics.reduce((sum, p) => sum + p.cltv, 0) / productAnalytics.length : 0;
    
    return {
      totalActiveSubs,
      totalCancelledSubs,
      totalMRR,
      avgChurnRate: Math.round(avgChurnRate * 10) / 10,
      avgCLTV: Math.round(avgCLTV),
      portfolioHealth: avgChurnRate < 15 ? 'Strong' : avgChurnRate < 25 ? 'Healthy' : 'At Risk'
    };
  }, [productAnalytics]);

  // Combined MRR forecast for portfolio
  const portfolioForecast = useMemo(() => {
    const forecast = Array.from({ length: 6 }, (_, i) => ({
      month: i + 1,
      current: 0,
      projected: 0
    }));

    productAnalytics.forEach(product => {
      product.mrrForecast.forEach((data, idx) => {
        forecast[idx].current += data.current;
        forecast[idx].projected += data.projected;
      });
    });

    return forecast;
  }, [productAnalytics]);

  const HealthBadge = ({ health }) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      concerning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[health] || colors.good}>{health.charAt(0).toUpperCase() + health.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Portfolio Churn Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{portfolioMetrics.avgChurnRate.toFixed(1)}%</p>
            <p className="text-xs text-slate-500 mt-2">{portfolioMetrics.portfolioHealth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Avg Customer LTV</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">${portfolioMetrics.avgCLTV}</p>
            <p className="text-xs text-slate-500 mt-2">Lifetime value projection</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Portfolio MRR</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">${portfolioMetrics.totalMRR.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">Current run rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Active Customers</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{portfolioMetrics.totalActiveSubs}</p>
            <p className="text-xs text-slate-500 mt-2">{portfolioMetrics.totalCancelledSubs} churned</p>
          </CardContent>
        </Card>
      </div>

      {/* MRR Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            MRR Trend Forecast (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioForecast}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'MRR ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
              <Legend />
              <Area type="monotone" dataKey="current" stroke="#0f172a" fillOpacity={1} fill="url(#colorCurrent)" name="Current" />
              <Area type="monotone" dataKey="projected" stroke="#64748b" fillOpacity={1} fill="url(#colorProjected)" name="Projected" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product-Level Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productAnalytics.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{product.name}</h4>
                  <HealthBadge health={product.health} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-600 text-xs">Churn Rate</p>
                    <p className="font-bold text-lg text-slate-900">{product.churnRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Retention</p>
                    <p className="font-bold text-lg text-slate-900">{product.retention}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Customer LTV</p>
                    <p className="font-bold text-lg text-slate-900">${product.cltv}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Monthly ARPU</p>
                    <p className="font-bold text-lg text-slate-900">${product.monthlyARPU}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Active Subs</p>
                    <p className="font-bold text-lg text-slate-900">{product.activeSubs}</p>
                  </div>
                </div>

                {/* Mini MRR Forecast Chart */}
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={product.mrrForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
                    <Line type="monotone" dataKey="current" stroke="#0f172a" strokeWidth={2} name="Current" />
                    <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
                  </LineChart>
                </ResponsiveContainer>

                {/* Actionable Insights */}
                {product.churnRate > 20 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>High churn detected. Review product-market fit and customer satisfaction.</span>
                  </div>
                )}

                {product.retention > 90 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Excellent retention. Consider upsell or expansion opportunities.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Analysis by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productAnalytics.map(p => ({ name: p.name, churn: p.churnRate }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="churn" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CLTV Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifetime Value (CLTV) by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productAnalytics.map(p => ({ name: p.name, cltv: p.cltv }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'CLTV ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `$${value.toFixed(0)}`} />
              <Bar dataKey="cltv" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <AnalyticsInsightsPanel />
    </div>
  );
}