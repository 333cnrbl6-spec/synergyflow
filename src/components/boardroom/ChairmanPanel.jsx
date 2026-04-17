import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_STYLES = {
  pending_chairman: { label: 'Awaiting Chairman', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  deferred: { label: 'Deferred', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

const TYPE_LABELS = {
  build: '🔨 Build',
  pricing: '💰 Pricing',
  go_to_market: '🚀 Go-to-Market',
  partnership: '🤝 Partnership',
  governance: '⚖️ Governance',
  readiness: '📈 Readiness',
};

export default function ChairmanPanel({ proposals, onRefresh }) {
  const [notes, setNotes] = useState({});
  const [processing, setProcessing] = useState(null);

  const pending = proposals.filter(p => p.status === 'pending_chairman');
  const decided = proposals.filter(p => p.status !== 'pending_chairman');

  const handleDecision = async (proposal, status) => {
    setProcessing(proposal.id);
    try {
      await base44.functions.invoke('boardCommunications', {
        action: 'chairman_review',
        proposal_id: proposal.id,
        status,
        chairman_notes: notes[proposal.id] || ''
      });
      setNotes(n => ({ ...n, [proposal.id]: '' }));
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
        <span className="text-lg">👑</span>
        <div>
          <h3 className="text-amber-900 font-bold text-sm tracking-wide">CHAIRMAN'S DESK</h3>
          <p className="text-amber-700 text-xs">Board proposals awaiting approval or build sign-off</p>
        </div>
        {pending.length > 0 && (
          <span className="ml-auto bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Pending proposals */}
        {pending.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-4">No proposals awaiting review — the board is in discussion.</p>
        )}

        {pending.map(proposal => (
          <div key={proposal.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-amber-700 font-semibold">{TYPE_LABELS[proposal.proposal_type] || proposal.proposal_type}</span>
                  {proposal.products_involved?.length > 0 && (
                    <span className="text-xs text-slate-600">{proposal.products_involved.join(', ')}</span>
                  )}
                </div>
                <p className="text-slate-900 font-semibold text-sm">{proposal.title}</p>
                {proposal.summary !== proposal.title && (
                  <p className="text-slate-700 text-xs">{proposal.summary}</p>
                )}
                <p className="text-slate-600 text-xs">Raised by: {proposal.raised_by}</p>
              </div>
            </div>

            {/* Chairman notes input */}
            <input
              type="text"
              placeholder="Chairman's notes (optional)..."
              value={notes[proposal.id] || ''}
              onChange={e => setNotes(n => ({ ...n, [proposal.id]: e.target.value }))}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded px-3 py-1.5 placeholder:text-slate-500"
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                disabled={processing === proposal.id}
                onClick={() => handleDecision(proposal, 'approved')}
              >
                ✅ Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                disabled={processing === proposal.id}
                onClick={() => handleDecision(proposal, 'deferred')}
              >
                ⏸ Defer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
                disabled={processing === proposal.id}
                onClick={() => handleDecision(proposal, 'rejected')}
              >
                ❌ Reject
              </Button>
            </div>
          </div>
        ))}

        {/* Recently decided */}
        {decided.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-700 uppercase tracking-wide font-semibold">Recently Decided</p>
            {decided.slice(0, 5).map(proposal => {
              const style = STATUS_STYLES[proposal.status] || STATUS_STYLES.deferred;
              return (
                <div key={proposal.id} className={`rounded-lg p-2.5 border ${style.bg} ${style.border} flex items-center justify-between gap-2`}>
                  <div>
                    <p className={`text-xs font-semibold ${style.text}`}>{proposal.title}</p>
                    <p className="text-slate-600 text-xs">{proposal.raised_by}</p>
                    {proposal.chairman_notes && (
                      <p className="text-slate-700 text-xs italic mt-0.5">"{proposal.chairman_notes}"</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${style.text}`}>{style.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}