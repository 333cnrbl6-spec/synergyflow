import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkInitiativesVoting({ coordinationProposal, boardMembers, onVoteComplete }) {
  const [votes, setVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showInitiatives, setShowInitiatives] = useState(false);

  const handleVote = (memberApp, voteType) => {
    setVotes(prev => ({
      ...prev,
      [memberApp]: voteType
    }));
  };

  const allVoted = boardMembers.every(m => votes[m.app_name]);
  const yesCount = Object.values(votes).filter(v => v === 'yes').length;
  const noCount = Object.values(votes).filter(v => v === 'no').length;
  const abstainCount = Object.values(votes).filter(v => v === 'abstain').length;

  const handleSubmitVotes = async () => {
    if (!allVoted) {
      toast.error('All board members must vote');
      return;
    }

    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('triggerLaunchReadinessVote', {
        proposal_id: coordinationProposal.id,
        votes
      });

      if (res.data.success && res.data.is_unanimous) {
        // Auto-execute all initiatives
        const execRes = await base44.functions.invoke('executeApprovedInitiatives', {
          coordination_proposal_id: coordinationProposal.id
        });

        toast.success(
          `Unanimous! ${execRes.data.initiatives_approved} initiatives marked as Execution Ready`
        );

        if (onVoteComplete) {
          onVoteComplete({
            unanimous: true,
            initiatives_approved: execRes.data.initiatives_approved
          });
        }
      } else {
        toast.success('Votes recorded. Initiatives entering multi-stage review...');
        if (onVoteComplete) onVoteComplete({ unanimous: false });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit votes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg">Unified Build Initiatives Vote</CardTitle>
                <p className="text-xs text-slate-600 mt-1">130+ cross-product initiatives ready for approval & execution</p>
              </div>
            </div>
            <Badge className="bg-blue-600">Master Coordination</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Initiative Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-3xl font-bold text-blue-700">130+</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Build Initiatives</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-3xl font-bold text-indigo-700">4</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Products Involved</p>
            </div>
          </div>

          {/* Show Initiatives Button */}
          <button
            onClick={() => setShowInitiatives(!showInitiatives)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
          >
            {showInitiatives ? 'Hide' : 'Show'} Initiative List
          </button>

          {showInitiatives && (
            <div className="bg-white rounded-lg p-3 border border-slate-200 max-h-48 overflow-y-auto text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">Key Initiatives:</p>
              <ul className="space-y-1 ml-2">
                <li>• Standardized automation bridge linking CaseNarrative to Species Explorer</li>
                <li>• Shared document-intelligence API between Age UK Bury & CaseNarrative</li>
                <li>• Cross-Product Integration API for Premiso</li>
                <li>• Workflow-to-Dashboard integration bridges</li>
                <li>• Property & Compliance template modules</li>
                <li>• Legal Operations Suite pilots</li>
                <li>• SynergyFlow Integration Kits</li>
                <li>• Enterprise Legal Workflow templates</li>
                <li>• + 122 more initiatives</li>
              </ul>
            </div>
          )}

          {/* Vote Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{yesCount}</p>
              <p className="text-xs text-green-600 font-medium">Yes</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">{noCount}</p>
              <p className="text-xs text-red-600 font-medium">No</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-yellow-700">{abstainCount}</p>
              <p className="text-xs text-yellow-600 font-medium">Abstain</p>
            </div>
          </div>

          {/* Board Member Votes */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {boardMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{member.member_name}</p>
                  <p className="text-xs text-slate-500">{member.app_name}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'yes' ? 'default' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'yes')}
                    disabled={submitting}
                    className="text-xs px-2 h-8"
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'no' ? 'destructive' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'no')}
                    disabled={submitting}
                    className="text-xs px-2 h-8"
                  >
                    No
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'abstain' ? 'secondary' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'abstain')}
                    disabled={submitting}
                    className="text-xs px-2 h-8"
                  >
                    Abstain
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitVotes}
            disabled={submitting || !allVoted}
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Votes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Unified Vote ({yesCount + noCount + abstainCount}/{boardMembers.length})
              </>
            )}
          </Button>

          {!allVoted && (
            <p className="text-center text-xs text-slate-600">
              {boardMembers.length - (yesCount + noCount + abstainCount)} more vote(s) needed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}