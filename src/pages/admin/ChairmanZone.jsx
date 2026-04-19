import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CheckCircle2, Clock, AlertCircle, Send, ThumbsUp, ThumbsDown, Pause, Info, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ChairmanRecommendations from '@/components/ChairmanRecommendations';
import ChairmanHistoryTab from '@/components/ChairmanHistoryTab';
import BoardActionsMetrics from '@/components/BoardActionsMetrics';
import ChairmanDashboardMonitor from '@/components/ChairmanDashboardMonitor';

export default function ChairmanZone() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('transcript');
  const [chairmanNotes, setChairmanNotes] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [proposalFilter, setProposalFilter] = useState('all');

  // React Query for proposals with 30s polling
  const { data: proposalData = {}, isLoading: loadingProposals, error: proposalError } = useQuery({
    queryKey: ['boardProposals'],
    queryFn: async () => {
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
      return res.data;
    },
    refetchInterval: 30000, // 30s instead of 5s
    staleTime: 25000,
  });

  // React Query for decisions - only fetch when tab is active
  const { data: decisionData = {}, isLoading: loadingDecisions } = useQuery({
    queryKey: ['boardDecisions'],
    queryFn: async () => {
      const res = await base44.functions.invoke('boardCommunications', { action: 'get_decisions' });
      return res.data;
    },
    enabled: activeTab === 'decisions', // Lazy load
    refetchInterval: activeTab === 'decisions' ? 30000 : false,
    staleTime: 25000,
  });

  const proposals = proposalData.proposals || [];
  const decisions = decisionData.decisions || [];
  const loading = loadingProposals;

  // Memoize filtered proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => proposalFilter === 'all' || p.status === proposalFilter);
  }, [proposals, proposalFilter]);

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
      
      await queryClient.invalidateQueries({ queryKey: ['boardProposals'] });
      const nextPending = proposals.find(p => p.status === 'pending_chairman' && p.id !== selectedProposal.id);
      setSelectedProposal(nextPending || null);
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
      
      await queryClient.invalidateQueries({ queryKey: ['boardProposals'] });
      const nextPending = proposals.find(p => p.status === 'pending_chairman' && p.id !== selectedProposal.id);
      setSelectedProposal(nextPending || null);
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
      
      await queryClient.invalidateQueries({ queryKey: ['boardProposals'] });
      const nextPending = proposals.find(p => p.status === 'pending_chairman' && p.id !== selectedProposal.id);
      setSelectedProposal(nextPending || null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to defer proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAllPending = async () => {
    const pending = proposals.filter(p => p.status === 'pending_chairman');
    if (pending.length === 0) {
      toast.info('No pending proposals to approve');
      return;
    }
    
    setSaving(true);
    try {
      await Promise.all(
        pending.map(p =>
          base44.functions.invoke('boardCommunications', {
            action: 'chairman_review',
            proposal_id: p.id,
            status: 'approved',
            chairman_notes: '',
          })
        )
      );
      toast.success(`${pending.length} proposal(s) approved`);
      setSelectedProposal(null);
      await queryClient.invalidateQueries({ queryKey: ['boardProposals'] });
    } catch (e) {
      console.error(e);
      toast.error('Failed to approve proposals');
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Real-Time Monitor */}
        <ChairmanDashboardMonitor />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-slate-900">Chairman's Zone</h1>
            {proposals.filter(p => p.status === 'pending_chairman').length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 py-1 text-base">
                {proposals.filter(p => p.status === 'pending_chairman').length} Pending
              </Badge>
            )}
          </div>
          <p className="text-slate-600 mt-2">Human-readable board transcript, proposals, and decisions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap border-b border-slate-200 pb-3">
          <Button
            variant={activeTab === 'monitor' ? 'default' : 'outline'}
            onClick={() => setActiveTab('monitor')}
            className="gap-2"
          >
            🔴 Real-Time Monitor
          </Button>
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
            Proposals ({proposals.filter(p => p.status === 'pending_chairman').length})
          </Button>
          <Button
            variant={activeTab === 'decisions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('decisions')}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Decided ({decisions.length})
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'default' : 'outline'}
            onClick={() => setActiveTab('insights')}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Board Insights
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            History
          </Button>
          <Button
            variant={activeTab === 'voting' ? 'default' : 'outline'}
            onClick={() => setActiveTab('voting')}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Board Voting
          </Button>
        </div>

        {/* Real-Time Monitor Tab */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <ChairmanDashboardMonitor />
          </div>
        )}

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
              <div className="space-y-2">
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
                {proposals.filter(p => p.status === 'pending_chairman').length > 0 && (
                  <Button
                    onClick={handleApproveAllPending}
                    disabled={saving}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve All
                  </Button>
                )}
              </div>

              {/* Proposals List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh]">
              {filteredProposals.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-slate-500 text-sm">No proposals yet.</p>
                </Card>
              ) : (
                filteredProposals.map((prop) => (
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
                              : prop.status === 'deferred'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {prop.status === 'pending_chairman' ? 'Pending' : prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
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
                <Card className="h-full flex flex-col overflow-hidden">
                  <div className={`px-6 py-3 text-white font-semibold text-lg ${
                    selectedProposal.status === 'approved' ? 'bg-green-600' :
                    selectedProposal.status === 'rejected' ? 'bg-red-600' :
                    selectedProposal.status === 'deferred' ? 'bg-amber-600' :
                    'bg-yellow-500'
                  }`}>
                    Status: {selectedProposal.status === 'pending_chairman' ? 'Awaiting Decision' : selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                  </div>
                  <CardHeader className="border-b">
                    <div>
                      <CardTitle>{selectedProposal.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-2">{selectedProposal.summary}</p>
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
                        placeholder="Add your chairman commentary or decision (optional)…"
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

        {/* Decisions Tab - Only show contentious decisions needing veto */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            {/* Filter: Show only decisions where votes do NOT favour (contentious) */}
            {(() => {
              const contentiousDecisions = decisions.filter(dec => {
                const totalVotes = (dec.voting_results?.yes_votes?.length || 0) +
                                   (dec.voting_results?.no_votes?.length || 0) +
                                   (dec.voting_results?.abstain_votes?.length || 0);
                const yesVotes = dec.voting_results?.yes_votes?.length || 0;
                // Show only if NOT unanimous or consensus (>75%)
                return totalVotes > 0 && (yesVotes < totalVotes || yesVotes / totalVotes < 0.75);
              });

              if (contentiousDecisions.length === 0) {
                return (
                  <Card className="text-center py-12 border-2 border-green-200 bg-green-50">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">All decisions auto-approved</p>
                    <p className="text-slate-500 text-sm mt-1">Decisions with board consensus are automatically approved. No veto decisions pending.</p>
                  </Card>
                );
              }

              return (
                <div className="space-y-4">
                  <Card className="border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Veto Decisions Required</p>
                        <p className="text-sm text-red-800 mt-1">
                          These {contentiousDecisions.length} decision(s) lack clear board consensus. Review and veto if needed.
                        </p>
                      </div>
                    </div>
                  </Card>

                  {contentiousDecisions.map((dec) => {
                    const totalVotes = (dec.voting_results?.yes_votes?.length || 0) +
                                       (dec.voting_results?.no_votes?.length || 0) +
                                       (dec.voting_results?.abstain_votes?.length || 0);
                    const yesVotes = dec.voting_results?.yes_votes?.length || 0;
                    const noVotes = dec.voting_results?.no_votes?.length || 0;
                    const abstainVotes = dec.voting_results?.abstain_votes?.length || 0;

                    return (
                      <Card key={dec.id} className="border-l-4 border-red-500">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{dec.decision_title}</CardTitle>
                              <p className="text-sm text-slate-600 mt-1">{dec.description}</p>
                            </div>
                            <Badge className="bg-red-600">Awaiting Veto</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Proposed By</p>
                              <p>{dec.proposed_by}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Owner</p>
                              <p>{dec.implementation_owner || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Yes Votes</p>
                              <p className="font-bold text-green-600">{yesVotes}/{totalVotes}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">No Votes</p>
                              <p className="font-bold text-red-600">{noVotes}/{totalVotes}</p>
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
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <ChairmanRecommendations />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <ChairmanHistoryTab />
        )}

        {/* Board Voting Tab */}
        {activeTab === 'voting' && (
          <BoardActionsMetrics />
        )}
      </div>
    </div>
  );
}