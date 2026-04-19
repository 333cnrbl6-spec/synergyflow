import PostExecutionStrategy from '@/components/PostExecutionStrategy';

export default function PostExecutionStrategyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Post-Execution Strategic Analysis</h1>
          <p className="text-slate-600 mt-2">Portfolio valuation impact, product readiness assessment, and collaborative next steps as a unified board force supporting each product within their synergy groups.</p>
        </div>
        
        <PostExecutionStrategy />
      </div>
    </div>
  );
}