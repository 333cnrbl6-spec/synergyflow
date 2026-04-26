import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedPricingCard from './UnifiedPricingCard';

export default function PricingProposalVoting({ proposal }) {
  const [pricing, setPricing] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState({ yes: 0, no: 0, abstain: 0 });

  useEffect(() => {
    loadProposalData();
  }, [proposal.id]);

  const loadProposalData = async () => {
    try {
      // Get pricing structure
      const pricingData = await base44.entities.PricingStructure.filter({
        board_proposal_id: proposal.id
      });
      if (pricingData.length > 0) {
        setPricing(pricingData[0]);
      }

      // Get current vote counts
      setVotes({
        yes: proposal.yes_votes?.length || 0,
        no: proposal.no_votes?.length || 0,
        abstain: proposal.abstain_votes?.length || 0
      });

      // Check if current user voted
      const user = await base44.auth.me();
      const userHasVoted = [
        ...(proposal.yes_votes || []),
        ...(proposal.no_votes || []),
        ...(proposal.abstain_votes || [])
      ].includes(user.email);
      setHasVoted(userHasVoted);
    } catch (err) {
      console.error('Failed to load proposal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      const user = await base44.auth.me();

      const updateData = {
        yes_votes: proposal.yes_votes || [],
        no_votes: proposal.no_votes || [],
        abstain_votes: proposal.abstain_votes || []
      };

      // Remove previous vote
      updateData.yes_votes = updateData.yes_votes.filter(v => v !== user.email);
      updateData.no_votes = updateData.no_votes.filter(v => v !== user.email);
      updateData.abstain_votes = updateData.abstain_votes.filter(v => v !== user.email);

      // Add new vote
      updateData[`${voteType}_votes`].push(user.email);

      await base44.entities.BoardProposal.update(proposal.id, updateData);

      setVotes({
        yes: updateData.yes_votes.length,
        no: updateData.no_votes.length,
        abstain: updateData.abstain_votes.length
      });
      setHasVoted(true);

      const voteLabels = { yes: 'Approved', no: 'Rejected', abstain: 'Abstained' };
      toast.success(`Vote recorded: ${voteLabels[voteType]}`);
    } catch (err) {
      console.error('Vote failed:', err);
      toast.error('Failed to record vote');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading proposal...</div>;
  }

  if (!pricing) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <p className="text-slate-600">Pricing data not available</p>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = votes.yes + votes.no + votes.abstain;
  const majorityNeeded = Math.ceil((totalVotes + 1) / 2);
  const isMajority = votes.yes > votes.no;
  const isApproved = proposal.status === 'approved';

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {isApproved ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold text-green-600">Approved by Board</span>
          </>
        ) : proposal.status === 'rejected' ? (
          <>
            <XCircle className="w-6 h-6 text-red-600" />
            <span className="text-lg font-semibold text-red-600">Rejected</span>
          </>
        ) : (
          <>
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-600">Awaiting Board Vote</span>
          </>
        )}
      </div>

      {/* Pricing Preview */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Proposed Pricing Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.tiers?.map((tier) => (
            <UnifiedPricingCard
              key={tier.tier_id}
              tier={tier}
              isPopular={tier.tier_id === 'professional'}
            />
          ))}
        </div>
      </div>

      {/* Rationale */}
      {pricing.rationale && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proposal Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{pricing.rationale}</p>
          </CardContent>
        </Card>
      )}

      {/* Voting Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vote Counts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{votes.yes}</p>
              <p className="text-xs text-slate-600 mt-1">In Favor</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{votes.no}</p>
              <p className="text-xs text-slate-600 mt-1">Against</p>
            </div>
            <div className="text-center p-4 bg-slate-100 rounded-lg">
              <p className="text-2xl font-bold text-slate-600">{votes.abstain}</p>
              <p className="text-xs text-slate-600 mt-1">Abstain</p>
            </div>
          </div>

          {totalVotes > 0 && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Majority needed: {majorityNeeded}</span>
                  <span className={isMajority ? 'text-green-600 font-semibold' : 'text-slate-600'}>
                    {isMajority ? '✓ Majority achieved' : '✗ No majority'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${(votes.yes / totalVotes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Voting Buttons */}
          {!isApproved && !hasVoted && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleVote('yes')}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleVote('no')}
                variant="outline"
                className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={() => handleVote('abstain')}
                variant="outline"
                className="flex-1"
              >
                Abstain
              </Button>
            </div>
          )}

          {hasVoted && !isApproved && (
            <p className="text-sm text-slate-600 text-center">
              ✓ Your vote has been recorded. Awaiting board decision.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Effective Date */}
      {isApproved && pricing.effective_date && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Pricing Implementation</p>
                <p className="text-sm text-blue-800 mt-1">
                  This pricing becomes effective on <strong>{new Date(pricing.effective_date).toLocaleDateString()}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}