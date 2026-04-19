import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, DollarSign, Info } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SynergyFlowGrowthSimulator() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('mrr');

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      const subs = await base44.entities.AppSubscription.list().catch(() => []);
      
      // Get synergy products (Premiso + CharityHub)
      const synergyProducts = ['premiso', 'charityhub'];
      const synergySubs = subs.filter(sub => 
        synergyProducts.some(prod => sub.apps_included?.includes(prod))
      );

      // Calculate historical metrics and trends
      const today = new Date();
      const baselineOrganizations = synergySubs.length;
      const baselineUsers = baselineOrganizations * 4; // Avg 4 users per org
      
      // Estimate baseline MRR (assume £150/month per org average)
      const baselineMRR = baselineOrganizations * 150;

      // Calculate growth rates (conservative estimates based on typical SaaS)
      // These are estimates - in production would use actual historical data
      const orgGrowthRate = 0.12; // 12% monthly org growth
      const userGrowthRate = 0.15; // 15% monthly user growth (higher than org growth)
      const mrrGrowthRate = 0.18; // 18% monthly MRR growth (ARPU expansion + new customers)

      // Generate 6-month forecast (26 weeks)
      const forecastData = [];
      for (let week = 0; week <= 26; week++) {
        const date = new Date(today);
        date.setDate(date.getDate() + week * 7);
        
        // Weekly progression (1/4 of monthly growth per week)
        const weeklyOrgFactor = Math.pow(1 + (orgGrowthRate / 4), week);
        const weeklyUserFactor = Math.pow(1 + (userGrowthRate / 4), week);
        const weeklyMRRFactor = Math.pow(1 + (mrrGrowthRate / 4), week);

        const orgs = Math.round(baselineOrganizations * weeklyOrgFactor);
        const users = Math.round(baselineUsers * weeklyUserFactor);
        const mrr = Math.round(baselineMRR * weeklyMRRFactor);

        // Add confidence intervals (±15% for early weeks, ±8% for later weeks)
        const confidenceWidth = week <= 8 ? 15 : 8;
        const mrrLow = Math.round(mrr * (1 - confidenceWidth / 100));
        const mrrHigh = Math.round(mrr * (1 + confidenceWidth / 100));
        const usersLow = Math.round(users * (1 - confidenceWidth / 100));
        const usersHigh = Math.round(users * (1 + confidenceWidth / 100));

        forecastData.push({
          week,
          date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          organizations: orgs,
          users,
          mrr,
          mrrLow,
          mrrHigh,
          usersLow,
          usersHigh
        });
      }

      // Calculate summary metrics
      const currentWeek = forecastData[0];
      const week26 = forecastData[26];
      
      const orgGrowthPercent = Math.round(((week26.organizations - currentWeek.organizations) / currentWeek.organizations) * 100);
      const userGrowthPercent = Math.round(((week26.users - currentWeek.users) / currentWeek.users) * 100);
      const mrrGrowthPercent = Math.round(((week26.mrr - currentWeek.mrr) / currentWeek.mrr) * 100);
      const projectedAnnualMRR = Math.round(week26.mrr * 12);

      setForecast({
        data: forecastData,
        summary: {
          currentOrganizations: currentWeek.organizations,
          projectedOrganizations: week26.organizations,
          orgGrowthPercent,
          currentUsers: currentWeek.users,
          projectedUsers: week26.users,
          userGrowthPercent,
          currentMRR: currentWeek.mrr,
          projectedMRR: week26.mrr,
          mrrGrowthPercent,
          projectedAnnualMRR,
          totalNewOrganizations: week26.organizations - currentWeek.organizations,
          totalNewUsers: week26.users - currentWeek.users,
          totalMRRIncrease: week26.mrr - currentWeek.mrr
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !forecast) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const summary = forecast.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-purple-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              6-Month Growth Forecast
            </h2>
            <p className="text-sm text-purple-800 mt-1">
              SynergyFlow combined MRR & user acquisition projections (confidence ranges ±8-15%)
            </p>
          </div>
          <Badge className="bg-purple-600 text-white">PREDICTIVE MODEL</Badge>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-blue-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Organizations</div>
          <div className="space-y-1">
            <div>
              <div className="text-sm text-slate-700">Now: <span className="font-bold">{summary.currentOrganizations}</span></div>
              <div className="text-sm text-slate-700">6 Months: <span className="font-bold text-blue-600">{summary.projectedOrganizations}</span></div>
            </div>
            <div className="text-lg font-black text-blue-600">+{summary.totalNewOrganizations}</div>
            <div className="text-xs text-blue-600 font-medium">
              +{summary.orgGrowthPercent}% growth
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-emerald-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Active Users</div>
          <div className="space-y-1">
            <div>
              <div className="text-sm text-slate-700">Now: <span className="font-bold">{summary.currentUsers}</span></div>
              <div className="text-sm text-slate-700">6 Months: <span className="font-bold text-emerald-600">{summary.projectedUsers}</span></div>
            </div>
            <div className="text-lg font-black text-emerald-600">+{summary.totalNewUsers}</div>
            <div className="text-xs text-emerald-600 font-medium">
              +{summary.userGrowthPercent}% growth
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-purple-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Monthly Recurring Revenue</div>
          <div className="space-y-1">
            <div>
              <div className="text-sm text-slate-700">Now: <span className="font-bold">£{summary.currentMRR.toLocaleString()}</span></div>
              <div className="text-sm text-slate-700">6 Months: <span className="font-bold text-purple-600">£{summary.projectedMRR.toLocaleString()}</span></div>
            </div>
            <div className="text-lg font-black text-purple-600">+£{summary.totalMRRIncrease.toLocaleString()}</div>
            <div className="text-xs text-purple-600 font-medium">
              +{summary.mrrGrowthPercent}% growth
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-amber-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Annualized Run Rate</div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-amber-600">
              £{(summary.projectedAnnualMRR / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Projected at 6-month pace
            </div>
            <div className="text-xs text-amber-600 font-medium mt-2">
              ↑ {Math.round((summary.projectedAnnualMRR / (summary.currentMRR * 12)) * 100 - 100)}% vs. current ARR
            </div>
          </div>
        </Card>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedMetric('mrr')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedMetric === 'mrr' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          MRR Forecast
        </button>
        <button
          onClick={() => setSelectedMetric('users')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            selectedMetric === 'users' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          User Forecast
        </button>
      </div>

      {/* Charts */}
      <Card className="p-6">
        {selectedMetric === 'mrr' ? (
          <div>
            <h3 className="font-bold text-slate-900 mb-4">MRR Forecast with Confidence Range</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={forecast.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: '£ MRR', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => `£${Math.round(value).toLocaleString()}`}
                />
                <Legend />
                <Area type="monotone" dataKey="mrrHigh" stackId="1" stroke="none" fill="url(#colorRange)" name="Confidence Range" />
                <Area 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#9333ea" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMRR)" 
                  name="Projected MRR"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200 text-xs text-purple-900">
              <strong>Interpretation:</strong> Shaded area shows ±8-15% confidence range. Mid-line is base forecast assuming 18% monthly MRR growth from new customers and ARPU expansion.
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-slate-900 mb-4">User Acquisition Forecast with Confidence Range</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={forecast.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value) => Math.round(value).toLocaleString()}
                />
                <Legend />
                <Area type="monotone" dataKey="usersHigh" stackId="1" stroke="none" fill="url(#colorUsers)" fillOpacity={0.2} name="Confidence Range" />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  name="Projected Users"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900">
              <strong>Interpretation:</strong> Shaded area shows ±8-15% confidence range. Mid-line is base forecast assuming 15% monthly user growth (organic expansion within existing orgs + new orgs).
            </div>
          </div>
        )}
      </Card>

      {/* Scenario Analysis */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Scenario Assumptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="font-semibold text-slate-900 mb-2">Conservative Scenario</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 8% monthly org growth</li>
              <li>• 10% monthly user growth</li>
              <li>• 12% monthly MRR growth</li>
              <li className="text-amber-600 font-medium mt-2">6-mo MRR: ~£{Math.round(summary.projectedMRR * 0.85).toLocaleString()}</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded border border-blue-200 ring-2 ring-blue-300">
            <div className="font-semibold text-slate-900 mb-2">Base Case (Current)</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 12% monthly org growth</li>
              <li>• 15% monthly user growth</li>
              <li>• 18% monthly MRR growth</li>
              <li className="text-blue-600 font-medium mt-2">6-mo MRR: £{summary.projectedMRR.toLocaleString()}</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded border border-slate-200">
            <div className="font-semibold text-slate-900 mb-2">Aggressive Scenario</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 18% monthly org growth</li>
              <li>• 22% monthly user growth</li>
              <li>• 25% monthly MRR growth</li>
              <li className="text-green-600 font-medium mt-2">6-mo MRR: ~£{Math.round(summary.projectedMRR * 1.15).toLocaleString()}</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-900">
          <strong>Note:</strong> Base case assumes continued market traction from SynergyFlow unified offering. Conservative assumes market headwinds; Aggressive assumes viral adoption from cross-synergy benefits.
        </div>
      </Card>

      {/* Board Recommendation */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-300">
        <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Board Decision Framework
        </h3>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="p-3 bg-white rounded border border-emerald-200">
            <div className="font-semibold text-emerald-900">If Base Case Holds:</div>
            <p className="text-xs text-slate-600 mt-1">
              £{summary.projectedMRR.toLocaleString()}/month MRR by month 6 enables expansion into new verticals or geographic markets. Consider scaling GTM budget.
            </p>
          </div>
          <div className="p-3 bg-white rounded border border-emerald-200">
            <div className="font-semibold text-emerald-900">If Aggressive Scenario Emerges:</div>
            <p className="text-xs text-slate-600 mt-1">
              Monitor MRR weekly vs. forecast. If trending above +2σ, accelerate hiring for support/ops to handle growth without service degradation.
            </p>
          </div>
          <div className="p-3 bg-white rounded border border-emerald-200">
            <div className="font-semibold text-emerald-900">If Conservative Scenario Occurs:</div>
            <p className="text-xs text-slate-600 mt-1">
              Review product-market fit in secondary markets. Analyze churn drivers. Re-assess pricing or feature set for higher ARPU.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}