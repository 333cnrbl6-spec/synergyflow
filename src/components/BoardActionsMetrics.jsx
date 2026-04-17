import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, AlertCircle, Zap, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function BoardActionsMetrics() {
  const [proposalMetrics, setProposalMetrics] = useState(null);
  const [readinessData, setReadinessData] = useState([]);
  const [valueData, setValueData] = useState([]);
  const [boardActivity, setBoardActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initiatingVoting, setInitiatingVoting] = useState(false);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const [proposals, readiness, actionItems] = await Promise.all([
        base44.entities.BoardProposal.filter({ status: 'approved' }),
        base44.entities.ProductReadiness.list(),
        base44.entities.ActionItem.filter({ category: 'proposal' })
      ]);

      // Calculate voting metrics
      const totalProposals = proposals.length;
      const votingStarted = proposals.filter(p => 
        (p.yes_votes?.length || 0) > 0 || 
        (p.no_votes?.length || 0) > 0 || 
        (p.abstain_votes?.length || 0) > 0
      ).length;

      const boardMembers = await base44.entities.BoardMember.filter({ active: true });
      const majorityThreshold = Math.ceil(boardMembers.length / 2);

      let consensusReached = 0;
      let readyForExecution = [];
      const proposalBreakdown = [];

      for (const proposal of proposals) {
        const yesCount = proposal.yes_votes?.length || 0;
        if (yesCount >= majorityThreshold) {
          consensusReached++;
          readyForExecution.push(proposal.id);
        }
        
        const totalVotes = (proposal.yes_votes?.length || 0) + 
                          (proposal.no_votes?.length || 0) + 
                          (proposal.abstain_votes?.length || 0);
        
        proposalBreakdown.push({
          title: proposal.title.substring(0, 20),
          yes: proposal.yes_votes?.length || 0,
          no: proposal.no_votes?.length || 0,
          abstain: proposal.abstain_votes?.length || 0,
          total: totalVotes,
          type: proposal.proposal_type
        });
      }

      // Readiness by proposal type
      const typeReadiness = {};
      proposals.forEach(p => {
        if (!typeReadiness[p.proposal_type]) {
          typeReadiness[p.proposal_type] = { count: 0, readiness: 0 };
        }
        typeReadiness[p.proposal_type].count += 1;
        
        const relatedReadiness = readiness.find(r => 
          r.related_proposal_id === p.id
        );
        if (relatedReadiness) {
          typeReadiness[p.proposal_type].readiness += relatedReadiness.overall_readiness_percentage;
        }
      });

      const readinessChart = Object.entries(typeReadiness).map(([type, data]) => ({
        type: type.replace('_', ' '),
        readiness: Math.round(data.readiness / (data.count || 1)),
        proposals: data.count
      }));

      // Value metrics by type
      const typeValue = {};
      proposals.forEach(p => {
        if (!typeValue[p.proposal_type]) {
          typeValue[p.proposal_type] = 0;
        }
        typeValue[p.proposal_type] += 1;
      });

      const valueChart = Object.entries(typeValue).map(([type, count]) => ({
        name: type.replace('_', ' '),
        value: count,
        percentage: Math.round((count / totalProposals) * 100)
      }));

      // Board activity timeline
      const activityTimeline = proposals
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(p => ({
          proposal: p.title.substring(0, 25),
          votes: (p.yes_votes?.length || 0) + (p.no_votes?.length || 0),
          status: (p.yes_votes?.length || 0) >= majorityThreshold ? 'Consensus' : 'Voting'
        }));

      setProposalMetrics({
        totalProposals,
        votingStarted,
        consensusReached,
        readyForExecution: readyForExecution.length,
        votingProgress: Math.round((votingStarted / totalProposals) * 100),
        executionProgress: Math.round((consensusReached / totalProposals) * 100),
        majorityThreshold
      });

      setReadinessData(readinessChart);
      setValueData(valueChart);
      setBoardActivity(activityTimeline);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateVoting = async () => {
    setInitiatingVoting(true);
    try {
      const result = await base44.functions.invoke('initiateBoardVotingOnAllProposals', {});
      await loadMetrics();
      toast.success(`Voting initiated on ${result.data.voting_initiated} proposals`);
    } catch (error) {
      toast.error(error.message || 'Failed to initiate voting');
    } finally {
      setInitiatingVoting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <Button
        onClick={handleInitiateVoting}
        disabled={initiatingVoting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 py-6"
      >
        {initiatingVoting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Initiating Voting...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Start Board Voting on All {proposalMetrics?.totalProposals} Unexecuted Proposals
          </>
        )}
      </Button>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-semibold">Total Proposals</p>
              <p className="text-3xl font-black text-blue-600 mt-1">{proposalMetrics?.totalProposals}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-semibold">Voting Active</p>
              <p className="text-3xl font-black text-amber-600 mt-1">{proposalMetrics?.votingStarted}</p>
              <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full transition-all" 
                  style={{ width: `${proposalMetrics?.votingProgress}%` }}
                />
              </div>
            </div>
            <Users className="w-8 h-8 text-amber-400" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-semibold">Consensus Reached</p>
              <p className="text-3xl font-black text-green-600 mt-1">{proposalMetrics?.consensusReached}</p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${proposalMetrics?.executionProgress}%` }}
                />
              </div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-semibold">Ready to Execute</p>
              <p className="text-3xl font-black text-purple-600 mt-1">{proposalMetrics?.readyForExecution}</p>
              <p className="text-xs text-purple-700 mt-1">
                {proposalMetrics?.majorityThreshold} votes needed
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Readiness by Proposal Type */}
      <Card className="p-6 bg-white border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Readiness & Preparedness by Initiative Type</h3>
        {readinessData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={readinessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Readiness %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="readiness" fill="#10b981" name="Readiness %" />
              <Bar dataKey="proposals" fill="#3b82f6" name="# Proposals" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-600 text-sm">No readiness data yet</p>
        )}
      </Card>

      {/* Value Distribution */}
      <Card className="p-6 bg-white border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">💰 Value Distribution Across Board Initiatives</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex justify-center">
            {valueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={valueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {valueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-600 text-sm">No value data</p>
            )}
          </div>

          <div className="lg:col-span-2 space-y-3">
            {valueData.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.name}</span>
                  <Badge className="bg-slate-200 text-slate-800">{item.value} proposals</Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-slate-800 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">{item.percentage}% of board initiatives</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Board Activity Timeline */}
      <Card className="p-6 bg-white border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🗳️ Real-Time Board Voting Activity</h3>
        {boardActivity.length > 0 ? (
          <div className="space-y-2">
            {boardActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{activity.proposal}</p>
                  <p className="text-xs text-slate-600">{activity.votes} votes cast</p>
                </div>
                <Badge className={activity.status === 'Consensus' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-sm">No voting activity yet</p>
        )}
      </Card>

      {/* Launch Preparedness Summary */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-300">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🚀 Launch Preparedness Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm font-semibold text-indigo-900 mb-2">Voting Progress</div>
            <div className="text-3xl font-black text-indigo-600">{proposalMetrics?.votingProgress}%</div>
            <p className="text-xs text-indigo-700 mt-1">Board engaging on all initiatives</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-sm font-semibold text-green-900 mb-2">Execution Readiness</div>
            <div className="text-3xl font-black text-green-600">{proposalMetrics?.executionProgress}%</div>
            <p className="text-xs text-green-700 mt-1">Ready for autonomous launch</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="text-sm font-semibold text-purple-900 mb-2">Board Consensus</div>
            <div className="text-3xl font-black text-purple-600">{proposalMetrics?.majorityThreshold}</div>
            <p className="text-xs text-purple-700 mt-1">Votes needed for majority</p>
          </div>
        </div>
      </Card>
    </div>
  );
}