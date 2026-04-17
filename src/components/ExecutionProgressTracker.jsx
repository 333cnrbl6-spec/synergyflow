import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

export default function ExecutionProgressTracker() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackProgress();
    const interval = setInterval(trackProgress, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const trackProgress = async () => {
    try {
      const response = await base44.functions.invoke('trackInitiativeProgress', {});
      setProgress(response.metrics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return null;
  }

  return (
    <Card className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Zap className="w-5 h-5" />
          Initiative Execution Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Total Processed</p>
              <p className="text-xs text-slate-600">{progress.initiativesProcessed} of {progress.totalApprovedInitiatives} initiatives</p>
            </div>
            <span className="text-2xl font-bold text-purple-600">{progress.percentProcessed}%</span>
          </div>
          <Progress value={progress.percentProcessed} className="h-3" />
        </div>

        {/* Built/Deployed Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Initiatives Built & Deployed</p>
              <p className="text-xs text-slate-600">{progress.initiativesBuilt} of {progress.totalApprovedInitiatives} live</p>
            </div>
            <span className="text-2xl font-bold text-green-600">{progress.percentBuilt}%</span>
          </div>
          <Progress value={progress.percentBuilt} className="h-3 bg-green-100" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{progress.initiativesInProgress}</div>
            <p className="text-xs text-slate-600">In Progress</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{progress.initiativesCompleted}</div>
            <p className="text-xs text-slate-600">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{progress.initiativesBuilt}</div>
            <p className="text-xs text-slate-600">Deployed Live</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded border border-purple-200 p-3">
          <p className="text-xs text-slate-600 mb-1">Initiative-to-Live Conversion</p>
          <p className="text-sm font-semibold text-purple-900">
            {progress.conversionRate}% of approved initiatives now built and deployed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}