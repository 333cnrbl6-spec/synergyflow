import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function LaunchReadinessVoting({ proposal, boardMembers, onComplete }) {
  const [votes, setVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [allVoted, setAllVoted] = useState(false);

  const handleVote = (memberApp, voteType) => {
    setVotes(prev => ({
      ...prev,
      [memberApp]: voteType
    }));
  };

  const checkAllVoted = () => {
    return boardMembers.every(member => votes[member.app_name]);
  };

  const handleSubmitVotes = async () => {
    if (!checkAllVoted()) {
      toast.error('All board members must vote');
      return;
    }

    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('triggerLaunchReadinessVote', {
        proposal_id: proposal.id,
        votes
      });

      if (res.data.success) {
        toast.success(
          res.data.is_unanimous
            ? 'Unanimous vote! Launch preparation executing...'
            : 'Votes recorded. Entering multi-stage approval...'
        );
        setAllVoted(true);
        if (onComplete) onComplete(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit votes');
    } finally {
      setSubmitting(false);
    }
  };

  const yesCount = Object.values(votes).filter(v => v === 'yes').length;
  const noCount = Object.values(votes).filter(v => v === 'no').length;
  const abstainCount = Object.values(votes).filter(v => v === 'abstain').length;
  const totalVotes = yesCount + noCount + abstainCount;

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Unified Launch Readiness Vote</CardTitle>
              <p className="text-xs text-slate-600 mt-1">All board members must approve to level-peg products</p>
            </div>
          </div>
          {allVoted && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Voted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Vote Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-700">{yesCount}</p>
              <p className="text-xs text-green-600 font-medium">Yes Votes</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-700">{noCount}</p>
              <p className="text-xs text-red-600 font-medium">No Votes</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-700">{abstainCount}</p>
              <p className="text-xs text-yellow-600 font-medium">Abstain</p>
            </div>
          </div>

          {/* Board Member Voting Grid */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {boardMembers.map(member => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{member.member_name}</p>
                    <p className="text-xs text-slate-600">{member.app_name}</p>
                  </div>
                  {votes[member.app_name] && (
                    <Badge
                      className={
                        votes[member.app_name] === 'yes'
                          ? 'bg-green-600'
                          : votes[member.app_name] === 'no'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                      }
                    >
                      {votes[member.app_name].toUpperCase()}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'yes' ? 'default' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'yes')}
                    disabled={allVoted}
                    className="flex-1 text-xs"
                  >
                    👍 Yes
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'no' ? 'destructive' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'no')}
                    disabled={allVoted}
                    className="flex-1 text-xs"
                  >
                    👎 No
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'abstain' ? 'secondary' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'abstain')}
                    disabled={allVoted}
                    className="flex-1 text-xs"
                  >
                    🤷 Abstain
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Unanimous vote triggers auto-execution</p>
              <p className="text-xs mt-1">If all members vote yes, product preparation will automatically execute to level-peg all products for unified launch.</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitVotes}
            disabled={submitting || !checkAllVoted() || allVoted}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Votes...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Submit Launch Readiness Vote ({totalVotes}/{boardMembers.length})
              </>
            )}
          </Button>

          {!checkAllVoted() && (
            <p className="text-center text-xs text-slate-600">
              Waiting for {boardMembers.length - totalVotes} more vote(s)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}