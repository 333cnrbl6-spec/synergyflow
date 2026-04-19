import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingDown, Users, Target, RefreshCw, Loader, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ChurnRiskDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load cached analysis on mount
    const cached = localStorage.getItem('churnRiskAnalysis');
    if (cached) {
      const data = JSON.parse(cached);
      setAnalysis(data.analysis);
    }
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeChurnRisk', {});
      
      setAnalysis(response.data);
      
      // Cache results
      localStorage.setItem('churnRiskAnalysis', JSON.stringify({
        analysis: response.data,
        timestamp: new Date().toISOString()
      }));

      toast.success(`Analyzed ${response.data.summary.total_organizations} organizations - ${response.data.summary.critical_risk} critical risk accounts`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to analyze churn risk');
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <Card className="p-12 text-center border-2 border-dashed border-slate-300">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-semibold mb-2">No churn analysis yet</p>
        <p className="text-slate-500 text-sm mb-6">Click "Analyze Accounts" to calculate churn risk scores</p>
        <Button onClick={runAnalysis} className="gap-2 bg-red-600 hover:bg-red-700">
          <TrendingDown className="w-4 h-4" />
          Analyze Accounts
        </Button>
      </Card>
    );
  }

  const riskDistribution = [
    { name: 'Critical', value: analysis?.summary.critical_risk, fill: '#dc2626' },
    { name: 'High', value: analysis?.summary.high_risk, fill: '#f97316' },
    { name: 'Medium', value: analysis?.summary.medium_risk, fill: '#eab308' },
    { name: 'Low', value: analysis?.summary.low_risk, fill: '#22c55e' }
  ].filter(d => d.value > 0);

  const interventionData = analysis?.top_interventions || [];

  const allOrganizations = [
    ...(analysis?.organizations.critical || []),
    ...(analysis?.organizations.high || []),
    ...(analysis?.organizations.medium || []),
    ...(analysis?.organizations.low || [])
  ];

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    if (score >= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskBadgeColor = (level) => {
    switch(level) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-600 text-white';
      case 'Medium': return 'bg-yellow-600 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-red-900 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Churn Risk Analysis
            </h2>
            <p className="text-sm text-red-800 mt-1">
              ML-powered account health scoring to surface at-risk organizations before they churn
            </p>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={loading}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Key Metrics */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-5 border-l-4 border-slate-500">
            <div className="text-xs text-slate-600 font-semibold mb-2">Total Organizations</div>
            <div className="text-3xl font-black text-slate-900">{analysis.summary.total_organizations}</div>
          </Card>

          <Card className="p-5 border-l-4 border-red-600">
            <div className="text-xs text-slate-600 font-semibold mb-2">Critical Risk</div>
            <div className="text-3xl font-black text-red-600">{analysis.summary.critical_risk}</div>
            <p className="text-xs text-red-600 mt-1">Immediate attention</p>
          </Card>

          <Card className="p-5 border-l-4 border-orange-600">
            <div className="text-xs text-slate-600 font-semibold mb-2">High Risk</div>
            <div className="text-3xl font-black text-orange-600">{analysis.summary.high_risk}</div>
            <p className="text-xs text-orange-600 mt-1">Monitor closely</p>
          </Card>

          <Card className="p-5 border-l-4 border-blue-600">
            <div className="text-xs text-slate-600 font-semibold mb-2">Avg Churn Score</div>
            <div className="text-3xl font-black text-blue-600">{analysis.summary.avg_churn_score}</div>
            <p className="text-xs text-blue-600 mt-1">Portfolio health</p>
          </Card>

          <Card className="p-5 border-l-4 border-amber-600">
            <div className="text-xs text-slate-600 font-semibold mb-2">At-Risk %</div>
            <div className="text-3xl font-black text-amber-600">{analysis.summary.at_risk_percentage}%</div>
            <p className="text-xs text-amber-600 mt-1">Need intervention</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="critical">Critical Risk</TabsTrigger>
          <TabsTrigger value="high">High Risk</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Distribution */}
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Interventions */}
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Recommended Interventions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interventionData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="intervention" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Critical Risk Tab */}
        <TabsContent value="critical" className="space-y-4">
          <Card className="p-6 border-l-4 border-red-600 bg-red-50">
            <h3 className="font-bold text-red-900 mb-4">Critical Risk Accounts ({analysis?.organizations.critical?.length || 0})</h3>
            <div className="space-y-3">
              {analysis?.organizations.critical?.map((org, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOrg(selectedOrg?.organization_id === org.organization_id ? null : org)}
                  className="p-4 bg-white rounded border border-red-300 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{org.organization_name}</h4>
                      <p className="text-xs text-slate-600 mt-1">{org.subscription_tier} tier • {org.apps_included} app(s)</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${getRiskColor(org.churn_score)}`}>
                        {org.churn_score}
                      </div>
                      <Badge className={getRiskBadgeColor(org.risk_level)}>
                        {org.risk_level}
                      </Badge>
                    </div>
                  </div>

                  {selectedOrg?.organization_id === org.organization_id && (
                    <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-xs font-semibold text-red-900">Days Until Expiry</div>
                          <div className="text-lg font-bold text-red-600">{org.days_until_expiry}</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-xs font-semibold text-red-900">Account Age</div>
                          <div className="text-lg font-bold text-red-600">{org.months_since_signup} mo</div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border border-red-200">
                        <div className="text-xs font-semibold text-red-900 mb-2">Risk Factors</div>
                        <ul className="space-y-1 text-xs text-slate-700">
                          <li>• Expiration: {org.risk_factors.expiration_risk}%</li>
                          <li>• Maturity: {org.risk_factors.maturity_risk}%</li>
                          <li>• Payment: {org.risk_factors.payment_risk}%</li>
                          <li>• Tier: {org.risk_factors.tier_risk}%</li>
                          <li>• Coverage: {org.risk_factors.coverage_risk}%</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="text-xs font-semibold text-green-900 mb-2">Recommended Actions</div>
                        <ul className="space-y-1 text-xs text-green-900">
                          {org.interventions.map((intervention, i) => (
                            <li key={i}>• {intervention}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* High Risk Tab */}
        <TabsContent value="high" className="space-y-4">
          <Card className="p-6 border-l-4 border-orange-600 bg-orange-50">
            <h3 className="font-bold text-orange-900 mb-4">High Risk Accounts ({analysis?.organizations.high?.length || 0})</h3>
            <div className="space-y-3">
              {analysis?.organizations.high?.slice(0, 8).map((org, idx) => (
                <div key={idx} className="p-4 bg-white rounded border border-orange-300 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{org.organization_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{org.subscription_tier} • {org.months_since_signup}mo old</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-orange-600">{org.churn_score}</div>
                    <div className="text-xs font-semibold text-orange-600 mt-1">{org.recommended_action}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Intervention Strategies
            </h3>
            <div className="space-y-4">
              {analysis?.top_interventions?.map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.intervention}</h4>
                      <p className="text-sm text-slate-600 mt-1">Affects {item.count} organization(s)</p>
                    </div>
                    <Badge className="bg-green-600 text-white">{item.count}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded border border-green-200">
              <h4 className="font-semibold text-slate-900 mb-3">Quick Actions</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Set renewal reminders for accounts expiring within 30 days</li>
                <li>✓ Launch onboarding support for accounts under 3 months old</li>
                <li>✓ Outreach campaign for missing payment methods</li>
                <li>✓ Bundle recommendations for single-product accounts</li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Methodology */}
      <Card className="p-6 bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3">Churn Risk Scoring Methodology</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p><strong>Expiration Risk (35%):</strong> Days remaining until subscription expires (critical if &lt;30 days)</p>
          <p><strong>Account Maturity (25%):</strong> Newer accounts (0-3 months) have highest churn probability</p>
          <p><strong>Payment Status (20%):</strong> Missing payment method or cancelled status indicates friction</p>
          <p><strong>Subscription Tier (10%):</strong> Starter tier customers churn more than enterprise</p>
          <p><strong>Product Coverage (10%):</strong> Single-product accounts churn more than bundled accounts</p>
        </div>
        <p className="text-xs text-slate-600 mt-4">Scores range 0-100. Recommended action thresholds: Critical ≥70, High ≥50, Medium ≥30</p>
      </Card>
    </div>
  );
}