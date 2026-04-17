import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

export default function BoardConsensusVoting() {
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [consensusStatus, setConsensusStatus] = useState(null);
  const [boardMember, setBoardMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      const [proposals, members] = await Promise.all([
        base44.entities.BoardProposal.filter({ status: 'approved' }),
        base44.entities.BoardMember.filter({ app_name: user.full_name })
      ]);

      setApprovedProposals(proposals);
      if (members && members.length > 0) {
        setBoardMember(members[0]);
      }

      // Check consensus status
      const consensusResp = await base44.functions.invoke('boardConsensusVoting', {
        action: 'check_consensus'
      });
      setConsensusStatus(consensusResp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalIds, vote) => {
    try {
      await base44.functions.invoke('boardConsensusVoting', {
        action: 'vote',
        proposal_ids: proposalIds,
        vote: vote
      });

      setUserVotes(prev => ({
        ...prev,
        ...proposalIds.reduce((acc, id) => ({ ...acc, [id]: vote }), {})
      }));

      await loadData();
      toast.success(`Vote recorded: ${vote.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  const executeConsensus = async () => {
    setExecuting(true);
    try {
      const result = await base44.functions.invoke('boardConsensusVoting', {
        action: 'execute_on_consensus'
      });

      await loadData();
      toast.success(`${result.data.proposals_executed} proposals now executing autonomously`);
    } catch (error) {
      toast.error(error.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const majorityThreshold = consensusStatus?.majority_threshold || 0;

  return (
    <div className="space-y-6">
      {/* Consensus Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-900">🗳️ Board Consensus Voting</h2>
          <Badge className="bg-blue-500 text-white">
            {consensusStatus?.consensus_reached || 0} / {consensusStatus?.total_approved_proposals || 0} Approved
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-slate-600 font-semibold">Total Approved</div>
            <div className="text-2xl font-black text-blue-600">{consensusStatus?.total_approved_proposals || 0}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-xs text-slate-600 font-semibold">Ready for Execution</div>
            <div className="text-2xl font-black text-green-600">{consensusStatus?.ready_for_autonomous_execution || 0}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <div className="text-xs text-slate-600 font-semibold">Majority Threshold</div>
            <div className="text-2xl font-black text-amber-600">{majorityThreshold} votes</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-slate-600 font-semibold">Your Role</div>
            <div className="text-sm font-bold text-purple-600">{boardMember?.role || 'Board Member'}</div>
          </div>
        </div>

        {consensusStatus?.ready_for_autonomous_execution > 0 && (
          <Button
            onClick={executeConsensus}
            disabled={executing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
          >
            {executing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing {consensusStatus?.ready_for_autonomous_execution} Proposals...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Execute {consensusStatus?.ready_for_autonomous_execution} Consensus Proposals Autonomously
              </>
            )}
          </Button>
        )}
      </Card>

      {/* Proposals Ready for Voting */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Proposals Awaiting Board Vote</h3>
        
        {approvedProposals.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-600">No approved proposals pending board vote.</p>
          </Card>
        ) : (
          approvedProposals.map(proposal => {
            const consensusItem = consensusStatus?.consensusProposals?.find(c => c.id === proposal.id);
            const hasConsensus = consensusItem?.has_consensus;
            const userVote = userVotes[proposal.id];

            return (
              <Card key={proposal.id} className="p-4 border border-slate-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{proposal.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{proposal.summary}</p>
                  </div>
                  {hasConsensus && (
                    <Badge className="ml-2 bg-green-500 text-white gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Consensus
                    </Badge>
                  )}
                </div>

                {/* Vote Tally */}
                <div className="flex gap-4 mb-4 text-xs">
                  <div className="bg-green-50 px-3 py-2 rounded border border-green-200">
                    <span className="font-bold text-green-700">{consensusItem?.yes_votes || 0}</span>
                    <span className="text-slate-600 ml-1">Yes</span>
                  </div>
                  <div className="bg-red-50 px-3 py-2 rounded border border-red-200">
                    <span className="font-bold text-red-700">{consensusItem?.no_votes || 0}</span>
                    <span className="text-slate-600 ml-1">No</span>
                  </div>
                  <div className="text-slate-600">of {majorityThreshold} needed</div>
                </div>

                {/* Your Vote */}
                {!hasConsensus && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVote([proposal.id], 'yes')}
                      variant={userVote === 'yes' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      disabled={userVote !== undefined}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {userVote === 'yes' ? 'Voted Yes' : 'Vote Yes'}
                    </Button>
                    <Button
                      onClick={() => handleVote([proposal.id], 'no')}
                      variant={userVote === 'no' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      disabled={userVote !== undefined}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {userVote === 'no' ? 'Voted No' : 'Vote No'}
                    </Button>
                    <Button
                      onClick={() => handleVote([proposal.id], 'abstain')}
                      variant={userVote === 'abstain' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      disabled={userVote !== undefined}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {userVote === 'abstain' ? 'Abstained' : 'Abstain'}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}