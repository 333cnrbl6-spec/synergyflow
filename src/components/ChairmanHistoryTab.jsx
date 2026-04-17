import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ChairmanHistoryTab() {
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['pastProposals'],
    queryFn: async () => {
      const res = await base44.functions.invoke('boardCommunications', { 
        action: 'get_proposals',
        status_filter: ['approved', 'rejected', 'deferred']
      });
      return res.data.proposals || [];
    },
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ['proposalActionItems'],
    queryFn: async () => {
      const res = await base44.entities.ActionItem.filter({ 
        trigger_entity_type: 'BoardProposal' 
      });
      return res || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'deferred':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'deferred':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      case 'deferred':
        return <Badge className="bg-amber-600">Deferred</Badge>;
      default:
        return null;
    }
  };

  if (proposals.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-slate-500">No past decisions yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => {
        const relatedItems = actionItems.filter(
          item => item.trigger_entity_id === proposal.id
        );

        return (
          <Card key={proposal.id} className={`border-l-4 ${getStatusColor(proposal.status)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(proposal.status)}
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">{proposal.summary}</p>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Type</p>
                  <Badge variant="secondary" className="capitalize">
                    {proposal.proposal_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Raised By</p>
                  <p>{proposal.raised_by}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Date</p>
                  <p>{format(new Date(proposal.timestamp), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {proposal.chairman_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Chairman Notes</p>
                  <p className="text-sm text-blue-900">{proposal.chairman_notes}</p>
                </div>
              )}

              {relatedItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Action Items</p>
                  <div className="space-y-2">
                    {relatedItems.map((item) => (
                      <div key={item.id} className="bg-slate-100 rounded p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Status: <span className="font-semibold capitalize">{item.status}</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}