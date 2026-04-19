import NextSeriesVoting from '@/components/NextSeriesVoting';

export default function NextSeriesVotingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Next Series Implementation</h1>
          <p className="text-slate-600 mt-2">Board members review completed proposals and vote to approve the next series of implementation briefs per app. Majority consensus triggers autonomous brief creation — no chairman approval needed.</p>
        </div>
        
        <NextSeriesVoting />
      </div>
    </div>
  );
}