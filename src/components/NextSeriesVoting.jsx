import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Zap, ThumbsUp, ThumbsDown, Building2, FileText, Layers } from 'lucide-react';
import { toast } from 'sonner';

const APP_CONFIG = {
  species_explorer: { name: 'Species Explorer', color: 'bg-green-500', icon: '🦎' },
  premiso: { name: 'Premiso', color: 'bg-blue-500', icon: '🏢' },
  charityhub: { name: 'CharityHub', color: 'bg-pink-500', icon: '❤️' },
  casenarrative: { name: 'CaseNarrative', color: 'bg-purple-500', icon: '⚖️' },
};

export default function NextSeriesVoting() {
  const [boardMember, setBoardMember] = useState(null);
  const [implementationStatus, setImplementationStatus] = useState({});
  const [votingProposals, setVotingProposals] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const members = await base44.entities.BoardMember.filter({ app_name: user.full_name });
      
      if (members && members.length > 0) {
        setBoardMember(members[0]);
      }

      // Fetch implementation status for each app
      const [verifications, proposals, tasks] = await Promise.all([
        base44.entities.ProductVerification.list().catch(() => []),
        base44.entities.BoardProposal.filter({ status: 'approved' }).catch(() => []),
        base44.entities.ImplementationTask.list().catch(() => [])
      ]);

      // Calculate build status per app
      const status = {};
      Object.keys(APP_CONFIG).forEach(appId => {
        const appVerifications = verifications.filter(v => 
          v.product_name?.toLowerCase().includes(appId.replace('_', ' '))
        );
        const appTasks = tasks.filter(t => t.product_name?.toLowerCase().includes(appId.replace('_', ' ')));
        const appProposals = proposals.filter(p => 
          p.products_involved?.some(prod => prod.toLowerCase().includes(appId.replace('_', ' ')))
        );

        const completedTests = appVerifications.reduce((sum, v) => sum + (v.coverage_percentage || 0), 0) / (appVerifications.length || 1);
        const deployedTasks = appTasks.filter(t => t.implementation_status === 'deployed').length;
        
        status[appId] = {
          verification_coverage: Math.round(completedTests),
          deployed_tasks: deployedTasks,
          pending_proposals: appProposals.filter(p => p.approval_stage === 'passed').length,
          in_progress: appProposals.filter(p => p.approval_stage === 'in_progress').length,
          completed: appProposals.filter(p => p.approval_stage === 'completed').length,
        };
      });

      setImplementationStatus(status);

      // Get proposals ready for next series voting
      const nextSeriesProposals = proposals.filter(p => 
        p.status === 'approved' && 
        p.approval_stage === 'completed' &&
        !p.next_series_voted
      );

      setVotingProposals(nextSeriesProposals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalIds, vote) => {
    try {
      // Record vote in proposal
      const proposal = votingProposals.find(p => proposalIds.includes(p.id));
      const currentVotes = proposal?.[vote + '_votes'] || [];
      const user = await base44.auth.me();
      
      if (!currentVotes.includes(user.full_name)) {
        await base44.entities.BoardProposal.update(proposalIds[0], {
          [vote + '_votes']: [...currentVotes, user.full_name]
        });
      }

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

  const executeNextSeries = async () => {
    setExecuting(true);
    try {
      // Get proposals with majority yes votes
      const user = await base44.auth.me();
      const members = await base44.entities.BoardMember.list();
      const totalMembers = members.length;
      const majorityThreshold = Math.ceil(totalMembers / 2);

      const approvedProposals = votingProposals.filter(p => {
        const yesCount = (p.yes_votes || []).length;
        return yesCount >= majorityThreshold;
      });

      if (approvedProposals.length === 0) {
        toast.error('No proposals have achieved majority vote');
        return;
      }

      // Update proposals to trigger next series implementation
      await Promise.all(
        approvedProposals.map(p => 
          base44.entities.BoardProposal.update(p.id, {
            next_series_voted: true,
            next_series_approved: true,
            next_series_approval_date: new Date().toISOString()
          })
        )
      );

      // Create implementation tasks for next series
      const newTasks = approvedProposals.flatMap(proposal => {
        return (proposal.products_involved || []).map(productName => {
          const appId = Object.keys(APP_CONFIG).find(id => 
            productName.toLowerCase().includes(id.replace('_', ' '))
          );
          
          return {
            product_id: appId || 'unknown',
            product_name: productName,
            board_member_app: boardMember?.app_name || user.full_name,
            issue_description: `Next Series Implementation: ${proposal.title}`,
            issue_severity: 'medium',
            fix_type: 'feature_enhancement',
            implementation_status: 'pending',
            implementation_notes: `Approved by board consensus on ${new Date().toLocaleDateString()}. ${proposal.summary}`
          };
        });
      });

      if (newTasks.length > 0) {
        await base44.entities.ImplementationTask.bulkCreate(newTasks);
      }

      toast.success(`${approvedProposals.length} proposals approved for next series implementation`);
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const totalMembers = 4; // Assuming 4 board members
  const majorityThreshold = Math.ceil(totalMembers / 2);

  return (
    <div className="space-y-6">
      
      {/* Overview */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Next Series Implementation Voting
            </h2>
            <p className="text-sm text-indigo-700 mt-1">
              Board members vote on completed proposals to approve the next series of implementation briefs per app.
            </p>
          </div>
          <Badge className="bg-indigo-500 text-white">
            Majority Vote Required ({majorityThreshold}/{totalMembers})
          </Badge>
        </div>

        {/* Build Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(APP_CONFIG).map(([appId, config]) => {
            const status = implementationStatus[appId] || {};
            return (
              <div key={appId} className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{config.name}</div>
                    <div className="text-xs text-slate-500">Build Status</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Verification:</span>
                    <span className="font-semibold">{status.verification_coverage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Deployed:</span>
                    <span className="font-semibold text-green-600">{status.deployed_tasks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pending:</span>
                    <span className="font-semibold text-orange-600">{status.pending_proposals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">In Progress:</span>
                    <span className="font-semibold text-blue-600">{status.in_progress || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execute Button */}
        {votingProposals.length > 0 && (
          <Button
            onClick={executeNextSeries}
            disabled={executing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2"
          >
            {executing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Approving Next Series...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Approve Next Series ({votingProposals.length} Proposals Ready)
              </>
            )}
          </Button>
        )}
      </Card>

      {/* Voting Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Proposals Ready for Next Series Vote
        </h3>

        {votingProposals.length === 0 ? (
          <Card className="p-8 text-center">
            <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 font-medium">No proposals ready for next series voting</p>
            <p className="text-sm text-slate-500 mt-1">
              Proposals appear here once they reach "completed" status from the implementation backlog.
            </p>
          </Card>
        ) : (
          votingProposals.map(proposal => {
            const yesCount = (proposal.yes_votes || []).length;
            const noCount = (proposal.no_votes || []).length;
            const hasMajority = yesCount >= majorityThreshold;
            const userVote = userVotes[proposal.id];

            return (
              <Card key={proposal.id} className={`p-5 border-2 transition-all ${
                hasMajority ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-lg">{proposal.title}</h4>
                      {hasMajority && (
                        <Badge className="bg-green-500 text-white gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Majority Achieved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{proposal.summary}</p>
                    
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        🏷️ {proposal.proposal_type}
                      </Badge>
                      {proposal.products_involved?.map((product, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {APP_CONFIG[product.toLowerCase()]?.icon || '📦'} {product}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {hasMajority && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{yesCount}</div>
                      <div className="text-xs text-slate-500">Yes Votes</div>
                    </div>
                  )}
                </div>

                {/* Vote Tally */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <span className="font-bold text-green-700">{yesCount}</span>
                    <span className="text-slate-600 ml-1">Yes</span>
                    {proposal.yes_votes?.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1">{proposal.yes_votes.join(', ')}</div>
                    )}
                  </div>
                  <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    <span className="font-bold text-red-700">{noCount}</span>
                    <span className="text-slate-600 ml-1">No</span>
                    {proposal.no_votes?.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1">{proposal.no_votes.join(', ')}</div>
                    )}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{majorityThreshold} yes votes needed</span>
                  </div>
                </div>

                {/* Voting Buttons */}
                {!hasMajority && !userVote && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVote([proposal.id], 'yes')}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Vote Yes - Approve Next Series
                    </Button>
                    <Button
                      onClick={() => handleVote([proposal.id], 'no')}
                      variant="outline"
                      className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Vote No
                    </Button>
                  </div>
                )}

                {userVote && !hasMajority && (
                  <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">
                      You voted <span className="font-semibold">{userVote.toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Waiting for other board members to reach majority
                    </p>
                  </div>
                )}

                {hasMajority && (
                  <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-semibold">
                      ✓ Approved for Next Series Implementation
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Implementation briefs will be created automatically
                    </p>
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