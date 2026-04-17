import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function PremisoBoardDiscussion({ proposalId }) {
  const [proposal, setProposal] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [votes, setVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, membersRes, messagesRes] = await Promise.all([
          base44.entities.BoardProposal.get(proposalId),
          base44.entities.BoardMember.filter({ active: true }),
          base44.entities.BoardMessage.filter({ channel_id: 'readiness' })
        ]);

        setProposal(propRes);
        setBoardMembers(membersRes);
        setMessages(messagesRes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));

        // Initialize votes
        const initialVotes = {};
        membersRes.forEach(m => {
          initialVotes[m.app_name] = null;
        });
        setVotes(initialVotes);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await base44.entities.BoardMessage.create({
        channel_id: 'readiness',
        channel_name: 'Product Readiness',
        from_member: 'Board Coordinator',
        message_content: messageInput,
        message_type: 'perspective',
        timestamp: new Date().toISOString()
      });

      setMessages(prev => [...prev, {
        channel_id: 'readiness',
        from_member: 'Board Coordinator',
        message_content: messageInput,
        message_type: 'perspective',
        timestamp: new Date().toISOString()
      }]);

      setMessageInput('');
      toast.success('Message posted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to post message');
    }
  };

  const handleVote = (memberApp, voteType) => {
    setVotes(prev => ({
      ...prev,
      [memberApp]: voteType
    }));
  };

  const handleSubmitVotes = async () => {
    const allVoted = boardMembers.every(m => votes[m.app_name]);
    if (!allVoted) {
      toast.error('All board members must vote');
      return;
    }

    setSubmitting(true);
    try {
      const yesVotes = Object.entries(votes).filter(([_, v]) => v === 'yes').map(([k]) => k);
      const noVotes = Object.entries(votes).filter(([_, v]) => v === 'no').map(([k]) => k);
      const abstainVotes = Object.entries(votes).filter(([_, v]) => v === 'abstain').map(([k]) => k);

      const isUnanimous = noVotes.length === 0 && abstainVotes.length === 0;

      // Update proposal with votes
      await base44.entities.BoardProposal.update(proposalId, {
        yes_votes: yesVotes,
        no_votes: noVotes,
        abstain_votes: abstainVotes,
        is_unanimous: isUnanimous,
        approval_stage: 'discussion_required',
        discussion_count: messages.length,
        status: isUnanimous ? 'approved' : 'pending_chairman',
        approval_history: [
          ...((proposal?.approval_history || [])),
          {
            stage: isUnanimous ? 'passed' : 'discussion_required',
            timestamp: new Date().toISOString(),
            reviewed_by: 'Board Vote',
            notes: `Votes: ${yesVotes.length} Yes, ${noVotes.length} No, ${abstainVotes.length} Abstain`
          }
        ]
      });

      if (isUnanimous) {
        toast.success('Unanimous vote! Executing Premiso readiness plan...');
        setExecuting(true);

        // Auto-execute readiness plan
        const execRes = await base44.functions.invoke('autoExecuteReadinessPlan', {
          proposal_id: proposalId,
          product_name: 'Premiso'
        });

        if (execRes.data.success) {
          toast.success(`✓ Premiso readiness plan auto-executed! ${execRes.data.action_items_created} action items created.`);
        }
      } else {
        toast.success('Votes recorded. Proposal advanced to chairman review.');
      }

      setProposal(prev => ({
        ...prev,
        yes_votes: yesVotes,
        no_votes: noVotes,
        abstain_votes: abstainVotes,
        is_unanimous: isUnanimous
      }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit votes');
    } finally {
      setSubmitting(false);
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  if (!proposal) {
    return <Card className="p-6"><p className="text-slate-600">Proposal not found</p></Card>;
  }

  const yesCount = proposal.yes_votes?.length || 0;
  const noCount = proposal.no_votes?.length || 0;
  const abstainCount = proposal.abstain_votes?.length || 0;

  return (
    <div className="space-y-4">
      {/* Proposal Header */}
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <CardTitle>{proposal.title}</CardTitle>
                <p className="text-sm text-amber-700 mt-2">{proposal.summary}</p>
              </div>
            </div>
            <Badge className={proposal.approval_stage === 'passed' ? 'bg-green-600' : 'bg-amber-600'}>
              {proposal.approval_stage}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Board Discussion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5" />
            Board Discussion ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="max-h-64 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded border">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No discussion yet. Start the conversation!</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="bg-white p-3 rounded border-l-2 border-blue-400">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-slate-900">{msg.from_member}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{msg.message_content}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Share your perspective on Premiso readiness..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="min-h-20 resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || submitting}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Send className="w-4 h-4" />
              Post Perspective
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Board Voting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board Vote: Approve Premiso 100% Readiness Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vote Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{yesCount}</p>
              <p className="text-xs text-green-600 font-medium">Support</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">{noCount}</p>
              <p className="text-xs text-red-600 font-medium">Oppose</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-2xl font-bold text-yellow-700">{abstainCount}</p>
              <p className="text-xs text-yellow-600 font-medium">Abstain</p>
            </div>
          </div>

          {/* Board Member Votes */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {boardMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between bg-slate-50 p-3 rounded border">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{member.member_name}</p>
                  <p className="text-xs text-slate-500">{member.app_name}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'yes' ? 'default' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'yes')}
                    disabled={submitting || executing}
                    className="text-xs px-2 h-8"
                  >
                    Support
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'no' ? 'destructive' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'no')}
                    disabled={submitting || executing}
                    className="text-xs px-2 h-8"
                  >
                    Oppose
                  </Button>
                  <Button
                    size="sm"
                    variant={votes[member.app_name] === 'abstain' ? 'secondary' : 'outline'}
                    onClick={() => handleVote(member.app_name, 'abstain')}
                    disabled={submitting || executing}
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
            disabled={submitting || executing || !boardMembers.some(m => votes[m.app_name])}
            className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            size="lg"
          >
            {executing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Auto-Executing Premiso Plan...
              </>
            ) : submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Votes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Board Vote
              </>
            )}
          </Button>

          {proposal.is_unanimous && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900">
              ✓ <span className="font-semibold">Unanimous Support!</span> Plan auto-executed autonomously.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}