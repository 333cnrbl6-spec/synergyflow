import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Clock, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const stageConfig = {
  needs_review: { color: 'bg-yellow-50', icon: AlertCircle, label: 'Needs Review', icon_color: 'text-yellow-600' },
  discussion_required: { color: 'bg-blue-50', icon: Clock, label: 'Discussion Required', icon_color: 'text-blue-600' },
  final_approval: { color: 'bg-purple-50', icon: Clock, label: 'Final Approval', icon_color: 'text-purple-600' },
  passed: { color: 'bg-green-50', icon: CheckCircle2, label: 'Passed', icon_color: 'text-green-600' },
  rejected: { color: 'bg-red-50', icon: AlertCircle, label: 'Rejected', icon_color: 'text-red-600' }
};

export default function ProposalApprovalFlow({ proposal, onUpdate }) {
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const config = stageConfig[proposal.approval_stage] || stageConfig.needs_review;
  const Icon = config.icon;

  const handleAdvanceStage = async (action = null) => {
    if (!notes.trim() && proposal.approval_stage === 'final_approval') {
      toast.error('Please provide notes for final approval');
      return;
    }

    setProcessing(true);
    try {
      const res = await base44.functions.invoke('processMultiStageApproval', {
        proposal_id: proposal.id,
        action: action || 'advance',
        notes: notes,
        reviewed_by: 'chairman'
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setNotes('');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to advance stage');
    } finally {
      setProcessing(false);
    }
  };

  // Determine if current stage allows advancement
  const canAdvance = !proposal.is_unanimous && ['needs_review', 'discussion_required', 'final_approval'].includes(proposal.approval_stage);

  return (
    <Card className={`${config.color} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${config.icon_color}`} />
            <div>
              <CardTitle className="text-lg">{config.label}</CardTitle>
              <p className="text-xs text-slate-600 mt-1">
                {proposal.is_unanimous ? '✓ Unanimous vote - Auto-approved' : 'Non-unanimous - Multi-stage review'}
              </p>
            </div>
          </div>
          <Badge className={proposal.approval_stage === 'passed' ? 'bg-green-600' : proposal.approval_stage === 'rejected' ? 'bg-red-600' : 'bg-slate-600'}>
            {proposal.approval_stage.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      {/* Stage Progress */}
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${proposal.approval_stage === 'needs_review' ? 'bg-yellow-600' : 'bg-green-600'}`} />
            <span className={proposal.approval_stage === 'needs_review' ? 'text-yellow-700 font-semibold' : 'text-slate-600'}>
              Needs Review
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${['discussion_required', 'final_approval', 'passed', 'rejected'].includes(proposal.approval_stage) ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-3 h-3 rounded-full ${['discussion_required', 'final_approval', 'passed', 'rejected'].includes(proposal.approval_stage) ? 'bg-blue-600' : 'bg-slate-300'}`} />
            <span>Discussion Required</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className={`flex items-center gap-2 ${['final_approval', 'passed', 'rejected'].includes(proposal.approval_stage) ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`w-3 h-3 rounded-full ${['final_approval', 'passed', 'rejected'].includes(proposal.approval_stage) ? 'bg-purple-600' : 'bg-slate-300'}`} />
            <span>Final Approval</span>
          </div>
        </div>

        {/* Approval History */}
        {proposal.approval_history && proposal.approval_history.length > 0 && (
          <div className="bg-white rounded p-3 border">
            <p className="text-xs font-semibold text-slate-700 mb-2">Approval History</p>
            <div className="space-y-1 text-xs">
              {proposal.approval_history.map((entry, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span className="capitalize font-medium">{entry.stage}</span>
                  <span className="text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        {canAdvance && (
          <div className="space-y-3 pt-3 border-t">
            <Textarea
              placeholder="Add notes for this stage (required for Final Approval)…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20 resize-none text-sm"
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleAdvanceStage()}
                disabled={processing}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Advance to Next Stage
                  </>
                )}
              </Button>

              {proposal.approval_stage === 'final_approval' && (
                <Button
                  onClick={() => handleAdvanceStage('reject')}
                  disabled={processing}
                  variant="destructive"
                >
                  Reject
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Final Status Messages */}
        {proposal.approval_stage === 'passed' && (
          <div className="bg-green-100 border border-green-300 rounded p-3">
            <p className="text-sm text-green-900 font-semibold">✓ Proposal Approved</p>
            <p className="text-xs text-green-800 mt-1">This proposal is approved and ready for execution.</p>
          </div>
        )}

        {proposal.approval_stage === 'rejected' && (
          <div className="bg-red-100 border border-red-300 rounded p-3">
            <p className="text-sm text-red-900 font-semibold">✗ Proposal Rejected</p>
            <p className="text-xs text-red-800 mt-1">This proposal has been rejected and will not be executed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}