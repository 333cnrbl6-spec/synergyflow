import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle2, XCircle, Pause, Target } from 'lucide-react';

export default function ApprovalImpactAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalStats, setProposalStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [valuationRes, proposalsRes] = await Promise.all([
          base44.functions.invoke('getSellNowValuation', {}),
          base44.functions.invoke('boardCommunications', { action: 'get_proposals' })
        ]);

        setData(valuationRes.data);

        // Process proposal stats
        const proposals = proposalsRes.data.proposals || [];
        const approved = proposals.filter(p => p.status === 'approved').length;
        const rejected = proposals.filter(p => p.status === 'rejected').length;
        const deferred = proposals.filter(p => p.status === 'deferred').length;
        const pending = proposals.filter(p => p.status === 'pending_chairman').length;

        // Group proposals by type
        const byType = {};
        proposals.forEach(p => {
          if (!byType[p.proposal_type]) byType[p.proposal_type] = { total: 0, approved: 0 };
          byType[p.proposal_type].total++;
          if (p.status === 'approved') byType[p.proposal_type].approved++;
        });

        setProposalStats({
          total: proposals.length,
          approved,
          rejected,
          deferred,
          pending,
          byType: Object.entries(byType).map(([type, counts]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            total: counts.total,
            approved: counts.approved,
            approvalRate: counts.total > 0 ? ((counts.approved / counts.total) * 100).toFixed(0) : 0
          }))
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !proposalStats) return null;

  const formatCurrency = (num) => `£${(num / 1000000).toFixed(1)}M`;

  // Calculate impact metrics
  const sumProductValues = data.individual_products.reduce((sum, p) => sum + p.sell_now_value, 0);
  const ecosystemPremium = data.board_ecosystem.sell_now_value - sumProductValues;
  const premiumPercent = ((ecosystemPremium / sumProductValues) * 100).toFixed(1);

  const statusData = [
    { name: 'Approved', value: proposalStats.approved, color: '#10b981' },
    { name: 'Rejected', value: proposalStats.rejected, color: '#ef4444' },
    { name: 'Deferred', value: proposalStats.deferred, color: '#f59e0b' },
    { name: 'Pending', value: proposalStats.pending, color: '#6366f1' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Approval Impact Analysis</h1>
          <p className="text-slate-600">How chairman decisions are driving portfolio valuation</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-l-4 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-semibold uppercase">Approved Proposals</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-black text-green-600">{proposalStats.approved}</div>
              <div className="text-xs text-slate-500 mt-1">of {proposalStats.total} total</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-semibold uppercase">Rejected</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-black text-red-600">{proposalStats.rejected}</div>
              <div className="text-xs text-slate-500 mt-1">decisions</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-semibold uppercase">Deferred</span>
                <Pause className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600">{proposalStats.deferred}</div>
              <div className="text-xs text-slate-500 mt-1">pending review</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-semibold uppercase">Ecosystem Premium</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-600">{premiumPercent}%</div>
              <div className="text-xs text-slate-500 mt-1">{formatCurrency(ecosystemPremium)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Valuation Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Board Ecosystem Valuation */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Valuations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-slate-600 mb-1">Individual Products (Sum)</div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(sumProductValues)}</div>
                </div>
                <div className="flex items-center justify-center text-slate-400 py-2">↓</div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white">
                  <div className="text-sm font-semibold mb-1 opacity-90">Complete SynergyFlow Board</div>
                  <div className="text-3xl font-black">{formatCurrency(data.board_ecosystem.sell_now_value)}</div>
                  <div className="text-xs opacity-75 mt-1">Sell Now Value</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">📈 Board Parity Multiplier</p>
                  <p className="text-amber-800">
                    Coordinated ecosystem applies <strong>{data.board_ecosystem.ecosystem_multiple}x</strong> multiple vs individual <strong>8-12x</strong> per product
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Status Breakdown */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Decision Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Proposals by Type */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Approval Rates by Proposal Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proposalStats.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#94a3b8" name="Total Proposals" />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>

            {/* Type Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposalStats.byType.map((type) => (
                <div key={type.type} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{type.type}</span>
                    <Badge className={`${parseInt(type.approvalRate) >= 50 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {type.approvalRate}% approved
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">{type.approved} of {type.total} approved</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}