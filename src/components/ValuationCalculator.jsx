import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import BoardValuationSuggestions from './BoardValuationSuggestions';

export default function ValuationCalculator() {
  const [proposals, setProposals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingOn, setVotingOn] = useState(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      await loadProposals();
    };
    init();
  }, []);

  const loadProposals = async () => {
    try {
      const props = await base44.entities.ValuationProposal.list('-created_date');
      setProposals(props);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (proposalId, voteType) => {
    setVotingOn(proposalId);
    try {
      const proposal = proposals.find(p => p.id === proposalId);
      const updated = { ...proposal };

      if (voteType === 'yes') {
        updated.yes_votes = [...(proposal.yes_votes || []), user.full_name];
        updated.no_votes = (proposal.no_votes || []).filter(v => v !== user.full_name);
      } else {
        updated.no_votes = [...(proposal.no_votes || []), user.full_name];
        updated.yes_votes = (proposal.yes_votes || []).filter(v => v !== user.full_name);
      }

      await base44.entities.ValuationProposal.update(proposalId, updated);
      await loadProposals();
      toast.success(`Your ${voteType === 'yes' ? 'approval' : 'rejection'} recorded`);
    } catch (e) {
      toast.error('Failed to record vote');
    } finally {
      setVotingOn(null);
    }
  };

  const approveProposal = async (proposalId) => {
    try {
      const proposal = proposals.find(p => p.id === proposalId);
      await base44.entities.ValuationProposal.update(proposalId, {
        status: 'approved',
        approved_timestamp: new Date().toISOString()
      });

      // Store calculated valuations
      const calculations = calculateValuations(proposal);
      
      // Create board communication
      await base44.functions.invoke('postValuationApproval', {
        proposal_id: proposalId,
        proposal_title: proposal.title,
        calculations
      });

      await loadProposals();
      toast.success('Valuation approved and recorded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve');
    }
  };

  const calculateValuations = (proposal) => {
    const individualValues = {};
    let totalIndividual = 0;

    proposal.products.forEach(p => {
      const value = p.annual_revenue_potential * p.valuation_multiple;
      individualValues[p.product_name] = value;
      totalIndividual += value;
    });

    const suiteBonus = (totalIndividual * proposal.suite_premium_percentage) / 100;
    const suiteValue = totalIndividual + suiteBonus;

    return {
      individual_values: individualValues,
      total_individual: totalIndividual,
      suite_premium_percentage: proposal.suite_premium_percentage,
      suite_bonus: suiteBonus,
      suite_total_value: suiteValue
    };
  };

  if (loading) return <div className="text-center py-8">Loading proposals...</div>;

  return (
    <div className="space-y-8">
      {/* Board Valuation Suggestions Summary */}
      <BoardValuationSuggestions />

      <div className="space-y-6">
      {proposals.length === 0 ? (
        <Card className="p-6 text-center text-slate-600">No valuation proposals yet</Card>
      ) : (
        proposals.map(proposal => {
          const calcs = calculateValuations(proposal);
          const yesVotes = proposal.yes_votes?.length || 0;
          const noVotes = proposal.no_votes?.length || 0;
          const totalVotes = yesVotes + noVotes;
          const userVoted = proposal.yes_votes?.includes(user?.full_name) || proposal.no_votes?.includes(user?.full_name);

          return (
            <Card key={proposal.id} className="p-6 bg-white border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{proposal.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">Proposed by {proposal.proposed_by}</p>
                </div>
                <Badge className={proposal.status === 'approved' ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'}>
                  {proposal.status}
                </Badge>
              </div>

              {/* Individual Product Valuations */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">Individual Product Values</h4>
                <div className="space-y-2">
                  {proposal.products.map((prod, idx) => {
                    const value = calcs.individual_values[prod.product_name];
                    return (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-900">{prod.product_name}</div>
                          <div className="text-xs text-slate-600">
                            £{prod.annual_revenue_potential.toLocaleString()}ARR × {prod.valuation_multiple}x multiple
                          </div>
                          {prod.rationale && (
                            <div className="text-xs text-slate-600 italic mt-1">"{prod.rationale}"</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">£{value.toLocaleString()}M</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suite Valuation */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3">🎯 Portfolio Suite Valuation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Individual Values</span>
                    <span className="font-bold">£{calcs.total_individual.toLocaleString()}M</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Integration Premium (+{proposal.suite_premium_percentage}%)</span>
                    <span className="font-bold">£{calcs.suite_bonus.toLocaleString()}M</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2 mt-2 flex justify-between text-lg">
                    <span className="font-bold text-slate-900">Suite Total Value</span>
                    <span className="font-black text-purple-700">£{calcs.suite_total_value.toLocaleString()}M</span>
                  </div>
                </div>
              </div>

              {/* Voting Section */}
              {proposal.status !== 'approved' && (
                <div className="bg-slate-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-900">Board Vote</span>
                    <span className="text-sm text-slate-600">
                      {yesVotes} Yes • {noVotes} No
                    </span>
                  </div>
                  
                  {userVoted ? (
                    <div className="text-sm text-slate-600 italic">
                      {proposal.yes_votes?.includes(user?.full_name) 
                        ? '✓ You voted to approve' 
                        : '✗ You voted to reject'}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => vote(proposal.id, 'yes')}
                        disabled={votingOn === proposal.id}
                        variant="outline"
                        className="flex-1 gap-2 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => vote(proposal.id, 'no')}
                        disabled={votingOn === proposal.id}
                        variant="outline"
                        className="flex-1 gap-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Approve Button (for Chairman) */}
              {proposal.status === 'proposed' && user?.role === 'admin' && totalVotes > 0 && yesVotes > noVotes && (
                <Button
                  onClick={() => approveProposal(proposal.id)}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve as Official Valuation
                </Button>
              )}
            </Card>
          );
        })
      )}
      </div>
    </div>
  );
}