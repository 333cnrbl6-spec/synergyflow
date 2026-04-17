import BoardConsensusVoting from '@/components/BoardConsensusVoting';

export default function BoardConsensus() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Board Consensus</h1>
          <p className="text-slate-600 mt-2">Collective voting on approved proposals. Majority consensus triggers autonomous execution.</p>
        </div>
        
        <BoardConsensusVoting />
      </div>
    </div>
  );
}