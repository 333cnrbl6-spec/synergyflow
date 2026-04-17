import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Lightbulb, Users, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function JointVenturesProposalBoard({ currentMember }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberIdeas, setMemberIdeas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposal();
  }, []);

  const fetchProposal = async () => {
    try {
      const props = await base44.entities.BoardProposal.filter({
        title: { $regex: 'Strategic Joint Ventures' }
      });
      if (props.length > 0) {
        setProposal(props[0]);
      }
      setProposals(props);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitIdeas = async () => {
    if (!memberIdeas.trim()) {
      toast.error('Please enter your collaborative ideas');
      return;
    }

    setSubmitting(true);
    try {
      // Create action item to track member contribution
      await base44.entities.ActionItem.create({
        title: `Strategic Brainstorm Input - ${currentMember?.app_name || 'Board Member'}`,
        description: memberIdeas,
        category: 'proposal',
        trigger_entity_type: 'BoardProposal',
        trigger_entity_id: proposal?.id,
        status: 'open',
        auto_triggered: false,
        assigned_to: currentMember?.app_name
      });

      setSubmitted(true);
      setMemberIdeas('');
      toast.success('Your ideas submitted to board brainstorm');

      // Post contribution to board
      await base44.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: 'strategy',
        message_content: `✅ ${currentMember?.app_name} contributed collaborative ideas to strategic joint ventures brainstorm.`,
        message_type: 'announcement',
        from_member: '📋 Board Collective'
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit ideas');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Lightbulb className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Active Proposal Banner */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <CardTitle className="text-purple-900">{proposal.title}</CardTitle>
                <p className="text-sm text-purple-800 mt-1">{proposal.summary}</p>
              </div>
            </div>
            <Badge className="bg-purple-600">Active</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Brainstorm Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Strategic Brainstorm Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm font-semibold text-amber-900">Market Gaps</p>
              <p className="text-xs text-amber-800 mt-1">What market gaps can we fill with joint development?</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-semibold text-blue-900">Product Integration</p>
              <p className="text-xs text-blue-800 mt-1">Which products could integrate for multiplier effects?</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-semibold text-green-900">New Verticals</p>
              <p className="text-xs text-green-800 mt-1">What new verticals could we dominate together?</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-semibold text-red-900">Revenue Targets</p>
              <p className="text-xs text-red-800 mt-1">Where is untapped revenue potential? Big money targets?</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            Submit Your Collaborative Ideas
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Share your strategic thinking on joint ventures, new apps, market opportunities, and synergies with other board members.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Ideas Submitted</p>
                <p className="text-sm text-green-800">Your contribution has been recorded and shared with the board.</p>
              </div>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Share your ideas on collaborative opportunities, new products, market targets, synergies, and strategic positioning. Consider opportunities outside our usual scope..."
                value={memberIdeas}
                onChange={(e) => setMemberIdeas(e.target.value)}
                className="min-h-32 text-slate-900"
              />
              <Button
                onClick={submitIdeas}
                disabled={submitting || !memberIdeas.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 h-11 gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Ideas to Board'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Timeline */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Process Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div className="w-0.5 h-8 bg-slate-300 mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-slate-900">Product Cross-Check</p>
                <p className="text-xs text-slate-600">Validate readiness and identify synergies</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div className="w-0.5 h-8 bg-slate-300 mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-slate-900">Collect Ideas (NOW)</p>
                <p className="text-xs text-slate-600">Submit collaborative opportunities and market targets</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div className="w-0.5 h-8 bg-slate-300 mt-2" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-slate-900">Board Synthesis</p>
                <p className="text-xs text-slate-600">AI synthesizes ideas into strategic recommendations</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Chairman Review</p>
                <p className="text-xs text-slate-600">Strategic decision and resource allocation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}