import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Play, RotateCcw, Download, TrendingUp, Users, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PortfolioSimulationTool() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulation controls
  const [pricingAdjustment, setPricingAdjustment] = useState(0); // -30% to +30%
  const [featureExpansion, setFeatureExpansion] = useState(0); // 0 (base) to 3 (aggressive)
  const [roadmapAcceleration, setRoadmapAcceleration] = useState(1); // 0.5x to 2x
  
  // Simulation results
  const [projections, setProjections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('valuation');

  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await base44.entities.Product.list().catch(() => []);
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate simulation based on current parameters
  const simulatePortfolio = useMemo(() => {
    if (products.length === 0) return null;

    const baselineMonthlyMRR = 5000; // £5k baseline
    const baselineUsers = 250;
    const baselineSynergyMultiplier = 1.15;

    const projectionData = [];
    
    for (let month = 0; month <= 12; month++) {
      // Pricing impact: affects MRR directly
      const pricingMultiplier = 1 + (pricingAdjustment / 100);
      
      // Feature expansion impact: improves retention and increases ARPU over time
      const featureRetentionBoost = 1 + (featureExpansion * 0.05); // 5% boost per feature tier
      const featureAPRUBoost = 1 + (featureExpansion * 0.08); // ARPU grows with features
      
      // Roadmap acceleration: impacts time-to-value and adoption speed
      const adoptionAcceleration = 1 + ((roadmapAcceleration - 1) * 0.15); // Up to 15% faster adoption
      
      // Calculate month-over-month growth
      const baseGrowthRate = 0.10; // 10% baseline monthly growth
      const adjustedGrowthRate = baseGrowthRate * adoptionAcceleration * featureRetentionBoost;
      
      // Projections with compounding
      const mrr = Math.round(baselineMonthlyMRR * pricingMultiplier * Math.pow(1 + adjustedGrowthRate, month) * featureAPRUBoost);
      const users = Math.round(baselineUsers * Math.pow(1 + adjustedGrowthRate, month) * adoptionAcceleration);
      
      // Synergy metrics: improve with feature expansion and user growth
      const baseOverlapPercent = 30; // 30% baseline product overlap
      const synergyEnhancement = 1 + (featureExpansion * 0.08); // Synergy improves with features
      const overlapPercent = Math.min(baseOverlapPercent * synergyEnhancement, 65); // Cap at 65%
      
      // Cross-sell potential: revenue opportunity from bundling
      const crossSellPotential = Math.round((users * (overlapPercent / 100)) * (50 + featureExpansion * 15)); // £50-95 per cross-sell
      
      // Portfolio valuation: based on MRR × SaaS multiple (adjusted for growth)
      const saasMultiple = 12 + (adjustedGrowthRate * 12 * 10); // Growth affects multiple
      const monthlyValuation = Math.round(mrr * saasMultiple);
      
      // Synergy multiplier: improves over time with overlapping users
      const synergyValue = Math.round(crossSellPotential * (baselineSynergyMultiplier + featureExpansion * 0.05));
      
      // Total portfolio value
      const totalPortfolioValue = monthlyValuation + synergyValue;

      projectionData.push({
        month,
        date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        mrr,
        users,
        overlapPercent: Math.round(overlapPercent),
        crossSellPotential,
        monthlyValuation,
        synergyValue,
        totalPortfolioValue
      });
    }

    // Calculate summary metrics
    const month12 = projectionData[12];
    const month0 = projectionData[0];

    const summary = {
      mrrGrowth: Math.round(((month12.mrr - month0.mrr) / month0.mrr) * 100),
      userGrowth: Math.round(((month12.users - month0.users) / month0.users) * 100),
      valuationGrowth: Math.round(((month12.totalPortfolioValue - month0.totalPortfolioValue) / month0.totalPortfolioValue) * 100),
      finalAnnualValue: Math.round((month12.mrr * 12) * (12 + (0.10 * 12 * 10))),
      totalSynergyValue: month12.synergyValue,
      crossSellOpportunitiesCount: Math.round((month12.users * (month12.overlapPercent / 100)) / 5),
      peakOverlap: Math.max(...projectionData.map(d => d.overlapPercent))
    };

    setProjections(projectionData);
    setSummary(summary);
    return projectionData;
  }, [products, pricingAdjustment, featureExpansion, roadmapAcceleration]);

  const resetSimulation = () => {
    setPricingAdjustment(0);
    setFeatureExpansion(0);
    setRoadmapAcceleration(1);
    toast.success('Simulation reset to baseline');
  };

  const exportSimulation = () => {
    const csv = [
      ['Month', 'MRR', 'Users', 'Overlap %', 'Cross-Sell Potential', 'Monthly Valuation', 'Synergy Value', 'Total Value'].join(','),
      ...projections.map(p =>
        [p.month, p.mrr, p.users, p.overlapPercent, p.crossSellPotential, p.monthlyValuation, p.synergyValue, p.totalPortfolioValue].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-simulation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Simulation exported as CSV');
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-blue-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Portfolio Simulation Engine
            </h2>
            <p className="text-sm text-blue-800 mt-1">
              Adjust pricing, features, and roadmap timing to see real-time portfolio impact over 12 months
            </p>
          </div>
          <Badge className="bg-blue-600 text-white">INTERACTIVE MODEL</Badge>
        </div>
      </Card>

      {/* Control Panel */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-300">
        <h3 className="font-bold text-slate-900 mb-6">Simulation Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pricing Adjustment */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Pricing Adjustment: {pricingAdjustment > 0 ? '+' : ''}{pricingAdjustment}%
            </label>
            <Slider
              value={[pricingAdjustment]}
              onValueChange={(val) => setPricingAdjustment(val[0])}
              min={-30}
              max={30}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>-30%</span>
              <span>0%</span>
              <span>+30%</span>
            </div>
            <p className="text-xs text-slate-600 mt-3 p-2 bg-white rounded border border-slate-200">
              {pricingAdjustment > 0 ? '📈' : pricingAdjustment < 0 ? '📉' : '➡️'} Directly affects MRR and ARPU
            </p>
          </div>

          {/* Feature Expansion */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Feature Expansion Level: {featureExpansion.toFixed(1)}x
            </label>
            <Slider
              value={[featureExpansion]}
              onValueChange={(val) => setFeatureExpansion(val[0])}
              min={0}
              max={3}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>Base</span>
              <span>1.5x</span>
              <span>3x</span>
            </div>
            <p className="text-xs text-slate-600 mt-3 p-2 bg-white rounded border border-slate-200">
              ✨ Improves retention, ARPU, and synergy metrics
            </p>
          </div>

          {/* Roadmap Acceleration */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Roadmap Acceleration: {roadmapAcceleration.toFixed(1)}x
            </label>
            <Slider
              value={[roadmapAcceleration]}
              onValueChange={(val) => setRoadmapAcceleration(val[0])}
              min={0.5}
              max={2}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>0.5x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
            <p className="text-xs text-slate-600 mt-3 p-2 bg-white rounded border border-slate-200">
              ⚡ Accelerates time-to-value and user adoption
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={resetSimulation} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Baseline
          </Button>
          <Button onClick={exportSimulation} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-purple-500">
            <div className="text-xs text-slate-600 font-semibold mb-2">Portfolio Valuation Growth</div>
            <div className="text-3xl font-black text-purple-600">{summary.valuationGrowth}%</div>
            <p className="text-xs text-slate-600 mt-2">Over 12 months vs. baseline</p>
          </Card>

          <Card className="p-5 border-l-4 border-green-500">
            <div className="text-xs text-slate-600 font-semibold mb-2">MRR Growth</div>
            <div className="text-3xl font-black text-green-600">{summary.mrrGrowth}%</div>
            <p className="text-xs text-slate-600 mt-2">Monthly recurring revenue increase</p>
          </Card>

          <Card className="p-5 border-l-4 border-blue-500">
            <div className="text-xs text-slate-600 font-semibold mb-2">User Growth</div>
            <div className="text-3xl font-black text-blue-600">{summary.userGrowth}%</div>
            <p className="text-xs text-slate-600 mt-2">Active users at month 12</p>
          </Card>

          <Card className="p-5 border-l-4 border-amber-500">
            <div className="text-xs text-slate-600 font-semibold mb-2">Max Synergy Overlap</div>
            <div className="text-3xl font-black text-amber-600">{summary.peakOverlap}%</div>
            <p className="text-xs text-slate-600 mt-2">Cross-product overlap potential</p>
          </Card>
        </div>
      )}

      {/* Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="valuation">Portfolio Valuation</TabsTrigger>
          <TabsTrigger value="metrics">Growth Metrics</TabsTrigger>
          <TabsTrigger value="synergy">Synergy Potential</TabsTrigger>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
        </TabsList>

        {/* Portfolio Valuation Chart */}
        <TabsContent value="valuation">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">12-Month Portfolio Valuation Projection</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: '£ Total Value', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => `£${Math.round(value).toLocaleString()}`}
                  labelFormatter={(label) => typeof label === 'string' ? label : `Month ${label}`}
                />
                <Legend />
                <Area type="monotone" dataKey="totalPortfolioValue" stroke="#8b5cf6" fill="url(#colorValue)" name="Total Value" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Growth Metrics */}
        <TabsContent value="metrics">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">MRR & User Growth Over 12 Months</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#10b981" label={{ value: '£ MRR', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Active Users', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => Math.round(value).toLocaleString()}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="mrr" fill="#10b981" name="MRR (£)" />
                <Line yAxisId="right" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Synergy Potential */}
        <TabsContent value="synergy">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Synergy Metrics: Overlap & Cross-Sell Potential</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#f59e0b" label={{ value: 'Overlap %', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" label={{ value: '£ Cross-Sell Value', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value, name) => {
                    if (name === 'overlapPercent') return `${Math.round(value)}%`;
                    return `£${Math.round(value).toLocaleString()}`;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="overlapPercent" fill="#f59e0b" name="Product Overlap %" />
                <Line yAxisId="right" type="monotone" dataKey="crossSellPotential" stroke="#06b6d4" strokeWidth={2} name="Cross-Sell Value" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Scenario Comparison */}
        <TabsContent value="comparison">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Current Simulation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Revenue & Growth</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-slate-600">Month 0 MRR:</span>
                      <span className="font-semibold">£{projections[0]?.mrr.toLocaleString() || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-600">Month 12 MRR:</span>
                      <span className="font-semibold text-green-600">£{projections[12]?.mrr.toLocaleString() || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-600">Annualized Value:</span>
                      <span className="font-semibold text-blue-600">£{summary?.finalAnnualValue.toLocaleString() || 0}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Synergy & Operations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-slate-600">Peak Synergy Value:</span>
                      <span className="font-semibold">£{projections[12]?.synergyValue.toLocaleString() || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-600">Cross-Sell Opportunities:</span>
                      <span className="font-semibold">{summary?.crossSellOpportunitiesCount || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-600">Max Overlap:</span>
                      <span className="font-semibold text-amber-600">{summary?.peakOverlap || 0}%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Board Recommendations</h4>
              <ul className="space-y-2 text-sm text-green-900">
                {pricingAdjustment > 20 && (
                  <li>• <strong>Pricing Strategy:</strong> Current {pricingAdjustment}% increase is aggressive. Monitor churn closely in early months.</li>
                )}
                {featureExpansion > 2 && (
                  <li>• <strong>Feature Development:</strong> Expanding {featureExpansion.toFixed(1)}x features unlocks significant synergy value. Prioritize integration points.</li>
                )}
                {roadmapAcceleration > 1.5 && (
                  <li>• <strong>Execution Risk:</strong> {roadmapAcceleration.toFixed(1)}x acceleration requires additional resourcing. Plan hiring accordingly.</li>
                )}
                {pricingAdjustment <= 0 && featureExpansion < 1.5 && roadmapAcceleration <= 1 && (
                  <li>• <strong>Conservative Approach:</strong> Current settings align with baseline strategy. Consider testing feature expansion for upside.</li>
                )}
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>Note:</strong> Simulations use compounding growth models based on pricing multipliers, feature expansion benefits, and roadmap acceleration impacts. Results are projections and should be validated with actual market testing.
        </p>
      </Card>
    </div>
  );
}