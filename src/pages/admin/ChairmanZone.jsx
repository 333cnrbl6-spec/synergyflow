import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CheckCircle2, Clock, AlertCircle, Send, ThumbsUp, ThumbsDown, Pause, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ChairmanZone() {
  const [messages, setMessages] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transcript');
  const [chairmanNotes, setChairmanNotes] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [proposalFilter, setProposalFilter] = useState('pending_chairman');

  const loadData = async () => {
    try {
      const propRes = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      console.log('Loaded proposals:', propRes.data.proposals);
      setProposals(propRes.data.proposals || []);
      setDecisions([]);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveProposal = async () => {
    if (!selectedProposal) return;
    setSaving(true);
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'chairman_review',
        proposal_id: selectedProposal.id,
        status: 'approved',
        chairman_notes: chairmanNotes,
      });
      toast.success('Proposal approved');
      setChairmanNotes('');
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      setProposals(res.data.proposals || []);
      setSelectedProposal(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!selectedProposal) return;
    setSaving(true);
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'chairman_review',
        proposal_id: selectedProposal.id,
        status: 'rejected',
        chairman_notes: chairmanNotes,
      });
      toast.success('Proposal rejected');
      setChairmanNotes('');
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      setProposals(res.data.proposals || []);
      setSelectedProposal(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeferProposal = async () => {
    if (!selectedProposal) return;
    setSaving(true);
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'chairman_review',
        proposal_id: selectedProposal.id,
        status: 'deferred',
        chairman_notes: chairmanNotes,
      });
      toast.success('Proposal deferred');
      setChairmanNotes('');
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      setProposals(res.data.proposals || []);
      setSelectedProposal(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to defer proposal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Chairman's Zone</h1>
          <p className="text-slate-600">Human-readable board transcript, proposals, and decisions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={activeTab === 'transcript' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transcript')}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Board Transcript
          </Button>
          <Button
            variant={activeTab === 'proposals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('proposals')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Proposals ({proposals.length})
          </Button>
          <Button
            variant={activeTab === 'decisions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('decisions')}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Decided ({decisions.length})
          </Button>
        </div>

        {/* Transcript Tab */}
        {activeTab === 'transcript' && (
          <Card className="text-center py-12">
            <p className="text-slate-500">Board discussions appear as proposals. Review them in the Proposals tab.</p>
          </Card>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Proposal List */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={proposalFilter === 'pending_chairman' ? 'default' : 'outline'}
                  onClick={() => setProposalFilter('pending_chairman')}
                  size="sm"
                  className="text-xs"
                >
                  Pending
                </Button>
                <Button
                  variant={proposalFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setProposalFilter('all')}
                  size="sm"
                  className="text-xs"
                >
                  All
                </Button>
              </div>

              {/* Proposals List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh]">
              {proposals.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-slate-500 text-sm">No proposals yet.</p>
                </Card>
              ) : (
                proposals
                  .filter((p) => proposalFilter === 'all' || p.status === proposalFilter)
                  .map((prop) => (
                  <Card
                    key={prop.id}
                    className={`cursor-pointer transition-all ${
                      selectedProposal?.id === prop.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedProposal(prop)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm leading-tight">{prop.title}</CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            prop.status === 'pending_chairman'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : prop.status === 'approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {prop.status === 'pending_chairman' ? 'Pending' : prop.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Raised by: <strong>{prop.raised_by}</strong>
                      </p>
                    </CardHeader>
                  </Card>
                  ))
                  )}
                  </div>
                  </div>

            {/* Proposal Detail & Commentary */}
            <div className="lg:col-span-2">
              {selectedProposal ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedProposal.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-2">{selectedProposal.summary}</p>
                      </div>
                      <Badge className={selectedProposal.status === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {selectedProposal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 py-4 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Proposal Type</p>
                        <p className="text-sm capitalize">{selectedProposal.proposal_type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Products Involved</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProposal.products_involved?.map((prod) => (
                            <Badge key={prod} variant="secondary" className="capitalize">
                              {prod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Channel</p>
                        <p className="text-sm">#{selectedProposal.channel_name}</p>
                      </div>
                      {selectedProposal.chairman_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Your Notes</p>
                          <p className="text-sm text-blue-900">{selectedProposal.chairman_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {selectedProposal.status === 'pending_chairman' && (
                    <div className="border-t p-4 space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                          <p className="font-semibold">How to decide:</p>
                          <p className="mt-1"><strong>Approve</strong> — Accept and execute | <strong>Defer</strong> — Postpone decision | <strong>Reject</strong> — Decline proposal</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Add your chairman commentary or decision…"
                        value={chairmanNotes}
                        onChange={(e) => setChairmanNotes(e.target.value)}
                        className="resize-none h-24"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={handleApproveProposal}
                          disabled={saving}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={handleDeferProposal}
                          disabled={saving}
                          className="gap-2 bg-amber-600 hover:bg-amber-700"
                        >
                          <Pause className="w-4 h-4" />
                          Defer
                        </Button>
                        <Button
                          onClick={handleRejectProposal}
                          disabled={saving}
                          variant="destructive"
                          className="gap-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center text-center">
                  <div>
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Select a proposal to review and comment</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Decisions Tab */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            {decisions.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-slate-500">No decisions recorded yet.</p>
              </Card>
            ) : (
              decisions.map((dec) => (
                <Card key={dec.id} className="border-l-4 border-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dec.decision_title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{dec.description}</p>
                      </div>
                      <Badge className="bg-green-600">Decided</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Proposed By</p>
                        <p>{dec.proposed_by}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Owner</p>
                        <p>{dec.implementation_owner || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Status</p>
                        <Badge variant="outline" className="capitalize">
                          {dec.implementation_status}
                        </Badge>
                      </div>
                    </div>
                    {dec.notes && (
                      <div className="bg-slate-100 rounded p-3">
                        <p className="text-xs font-semibold text-slate-700 uppercase mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{dec.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}