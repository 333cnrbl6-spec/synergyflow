import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BoardInsights() {
  const [proposals, setProposals] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [propRes, decRes] = await Promise.all([
          base44.functions.invoke('boardCommunications', { action: 'get_proposals' }),
          base44.functions.invoke('boardCommunications', { action: 'get_decisions' }),
        ]);
        setProposals(propRes.data.proposals || []);
        setDecisions(decRes.data.decisions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Calculate approval rates
  const approvalData = proposals.reduce(
    (acc, p) => {
      if (p.status === 'approved') acc.approved++;
      else if (p.status === 'rejected') acc.rejected++;
      else if (p.status === 'deferred') acc.deferred++;
      else acc.pending++;
      return acc;
    },
    { approved: 0, rejected: 0, deferred: 0, pending: 0 }
  );

  const approvalChartData = [
    { name: 'Approved', value: approvalData.approved, fill: '#22c55e' },
    { name: 'Rejected', value: approvalData.rejected, fill: '#ef4444' },
    { name: 'Deferred', value: approvalData.deferred, fill: '#f59e0b' },
    { name: 'Pending', value: approvalData.pending, fill: '#94a3b8' },
  ];

  // Build frequency over time (last 30 days)
  const buildFreqData = proposals.reduce((acc, p) => {
    const date = new Date(p.timestamp).toLocaleDateString('en-GB');
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count++;
      if (p.proposal_type === 'build') existing.builds++;
    } else {
      acc.push({ date, count: 1, builds: p.proposal_type === 'build' ? 1 : 0 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Voting patterns
  const votingData = decisions
    .filter(d => d.voting_results)
    .map(d => ({
      title: d.decision_title.slice(0, 20),
      yes: d.voting_results.yes_votes?.length || 0,
      no: d.voting_results.no_votes?.length || 0,
      abstain: d.voting_results.abstain_votes?.length || 0,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const totalProposals = proposals.length;
  const approvalRate = totalProposals > 0 ? Math.round((approvalData.approved / totalProposals) * 100) : 0;
  const avgBuildsPerDay = buildFreqData.length > 0 
    ? (buildFreqData.reduce((sum, d) => sum + d.builds, 0) / buildFreqData.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Board Insights</h1>
          <p className="text-slate-600">Strategic trends in proposals, approvals, and voting patterns</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Proposals</p>
              <p className="text-3xl font-black text-slate-900">{totalProposals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Approval Rate</p>
              <p className="text-3xl font-black text-green-600">{approvalRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Avg Builds/Day</p>
              <p className="text-3xl font-black text-blue-600">{avgBuildsPerDay}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Total Decisions</p>
              <p className="text-3xl font-black text-slate-900">{decisions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Approval Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {approvalChartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={approvalChartData} dataKey="value" label nameKey="name">
                      {approvalChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No proposals yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Build Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {buildFreqData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={buildFreqData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total Proposals" />
                    <Bar dataKey="builds" fill="#10b981" name="Build Proposals" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No activity yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Voting Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Voting Patterns by Decision</CardTitle>
          </CardHeader>
          <CardContent>
            {votingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={votingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yes" stackId="votes" fill="#22c55e" name="Yes" />
                  <Bar dataKey="no" stackId="votes" fill="#ef4444" name="No" />
                  <Bar dataKey="abstain" stackId="votes" fill="#f59e0b" name="Abstain" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No voting data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposal Types Breakdown */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Proposals by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {['build', 'pricing', 'go_to_market', 'partnership', 'governance', 'readiness'].map(type => {
                const count = proposals.filter(p => p.proposal_type === type).length;
                return (
                  <div key={type} className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-black text-slate-900">{count}</p>
                    <p className="text-xs text-slate-600 capitalize mt-1">{type}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}