import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, CheckCircle2, Clock, Play, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ExecutionMetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const [proposals, actionItems, products] = await Promise.all([
        base44.entities.BoardProposal.list().catch(() => []),
        base44.entities.ActionItem.filter({ category: 'proposal' }).catch(() => []),
        base44.entities.Product.list().catch(() => [])
      ]);

      // Calculate metrics by status
      const total = proposals.length;
      const approved = proposals.filter(p => p.status === 'approved').length;
      const inProgress = actionItems.filter(a => a.status === 'in_progress').length;
      const completed = actionItems.filter(a => a.status === 'completed').length;
      const pending = proposals.filter(p => p.status === 'pending_chairman').length;

      // Calculate by proposal type
      const typeBreakdown = {};
      proposals.forEach(p => {
        const type = p.proposal_type || 'other';
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = { total: 0, approved: 0, executing: 0, completed: 0 };
        }
        typeBreakdown[type].total++;
        if (p.status === 'approved') typeBreakdown[type].approved++;
      });

      actionItems.forEach(a => {
        const proposal = proposals.find(p => p.id === a.trigger_entity_id);
        if (proposal) {
          const type = proposal.proposal_type || 'other';
          if (a.status === 'in_progress') typeBreakdown[type].executing++;
          if (a.status === 'completed') typeBreakdown[type].completed++;
        }
      });

      const typeChart = Object.entries(typeBreakdown).map(([type, data]) => ({
        type: type.replace(/_/g, ' '),
        total: data.total,
        approved: data.approved,
        executing: data.executing,
        completed: data.completed
      }));

      setMetrics({
        total,
        approved,
        inProgress,
        completed,
        pending,
        percentApproved: Math.round((approved / total) * 100) || 0,
        percentExecuting: Math.round((inProgress / total) * 100) || 0,
        percentCompleted: Math.round((completed / total) * 100) || 0,
        typeBreakdown: typeChart
      });
    } catch (e) {
      console.error('Error loading metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoExecute = async () => {
    setExecuting(true);
    try {
      const response = await base44.functions.invoke('autoExecuteApprovedProposals', {});
      await loadMetrics();
      toast.success(`✅ ${response.newly_executed} proposals triggered for execution`);
    } catch (error) {
      toast.error(error?.message || 'Failed to trigger execution');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  if (!metrics) return null;

  const statusCards = [
    {
      label: 'Total Proposals',
      value: metrics.total,
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-slate-50 border-slate-200 text-slate-700',
      textColor: 'text-slate-900'
    },
    {
      label: 'Approved',
      value: metrics.approved,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      textColor: 'text-green-900',
      percent: metrics.percentApproved
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      textColor: 'text-blue-900',
      percent: metrics.percentExecuting
    },
    {
      label: 'Completed',
      value: metrics.completed,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      textColor: 'text-emerald-900',
      percent: metrics.percentCompleted
    }
  ];

  const pieData = [
    { name: 'Approved', value: metrics.approved, color: '#10b981' },
    { name: 'In Progress', value: metrics.inProgress, color: '#3b82f6' },
    { name: 'Completed', value: metrics.completed, color: '#06b6d4' },
    { name: 'Pending', value: metrics.pending, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl">
      {/* Header with auto-execute button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Execution Metrics</h2>
          <p className="text-sm text-slate-600 mt-1">Real-time proposal execution status across the board</p>
        </div>
        <Button
          onClick={handleAutoExecute}
          disabled={executing || metrics.approved === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-bold"
        >
          {executing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Auto-Execute {metrics.approved} Approved
            </>
          )}
        </Button>
      </div>

      {/* Status cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card, idx) => (
          <Card key={idx} className={`border-2 ${card.color} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{card.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className={`text-3xl font-black ${card.textColor}`}>{card.value}</p>
              {card.percent !== undefined && (
                <Badge className="text-xs">{card.percent}%</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        {pieData.length > 0 && (
          <Card className="p-6 bg-white border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${Math.round(percent * 100)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Type breakdown bar chart */}
        {metrics.typeBreakdown.length > 0 && (
          <Card className="p-6 bg-white border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">By Initiative Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#64748b" name="Total" />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="executing" fill="#3b82f6" name="Executing" />
                <Bar dataKey="completed" fill="#06b6d4" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Summary stats */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-300">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Execution Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-xs font-semibold text-purple-900 mb-2">APPROVAL RATE</p>
            <div className="text-2xl font-black text-purple-600">{metrics.percentApproved}%</div>
            <p className="text-xs text-purple-700 mt-1">{metrics.approved} of {metrics.total} approved</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">EXECUTION RATE</p>
            <div className="text-2xl font-black text-blue-600">{metrics.percentExecuting}%</div>
            <p className="text-xs text-blue-700 mt-1">{metrics.inProgress} executing now</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-2">COMPLETION RATE</p>
            <div className="text-2xl font-black text-green-600">{metrics.percentCompleted}%</div>
            <p className="text-xs text-green-700 mt-1">{metrics.completed} completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-xs font-semibold text-amber-900 mb-2">PENDING REVIEW</p>
            <div className="text-2xl font-black text-amber-600">{metrics.pending}</div>
            <p className="text-xs text-amber-700 mt-1">Awaiting chairman decision</p>
          </div>
        </div>
      </Card>
    </div>
  );
}