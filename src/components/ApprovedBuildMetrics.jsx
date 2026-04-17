import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export default function ApprovedBuildMetrics() {
  const [metrics, setMetrics] = useState({
    totalBuildProposals: 0,
    approvedBuildProposals: 0,
    implementedInitiatives: 0,
    inProgressInitiatives: 0,
    implementationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Get all build proposals
      const allBuildProposals = await base44.asServiceRole.entities.BoardProposal.filter({
        proposal_type: 'build'
      });

      // Get approved build proposals
      const approvedBuildProposals = allBuildProposals.filter(p => p.status === 'approved');

      // Get implementation tracking
      const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
        trigger_entity_type: 'BoardProposal',
        category: 'revenue'
      });

      // Count implemented (deployed/completed)
      const implementedCount = actionItems.filter(
        a => a.implementation_status === 'deployed' || a.status === 'completed'
      ).length;

      // Count in progress
      const inProgressCount = actionItems.filter(
        a => a.implementation_status === 'in_progress' || a.status === 'in_progress'
      ).length;

      const implementationRate = approvedBuildProposals.length > 0
        ? ((implementedCount / approvedBuildProposals.length) * 100).toFixed(0)
        : 0;

      setMetrics({
        totalBuildProposals: allBuildProposals.length,
        approvedBuildProposals: approvedBuildProposals.length,
        implementedInitiatives: implementedCount,
        inProgressInitiatives: inProgressCount,
        implementationRate
      });
    } catch (error) {
      console.error('Failed to load build metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <CheckCircle2 className="w-5 h-5" />
          Board-Approved Build Implementation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Journey visualization */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-slate-900">{metrics.totalBuildProposals}</div>
            <p className="text-xs text-slate-600 mt-1">Suggested</p>
          </div>
          <div className="h-0.5 flex-1 bg-slate-300 mx-2" />
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-blue-600">{metrics.approvedBuildProposals}</div>
            <p className="text-xs text-slate-600 mt-1">Approved by Board</p>
          </div>
          <div className="h-0.5 flex-1 bg-slate-300 mx-2" />
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-orange-600">{metrics.inProgressInitiatives}</div>
            <p className="text-xs text-slate-600 mt-1">In Progress</p>
          </div>
          <div className="h-0.5 flex-1 bg-slate-300 mx-2" />
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-green-600">{metrics.implementedInitiatives}</div>
            <p className="text-xs text-slate-600 mt-1">Implemented Live</p>
          </div>
        </div>

        {/* Implementation rate */}
        <div className="bg-white rounded border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Implementation Success Rate</p>
              <p className="text-xs text-slate-600 mt-1">Board-approved initiatives now live in target apps</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-3xl font-bold text-green-600">{metrics.implementationRate}%</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-green-50 rounded border border-green-300 p-3">
          <p className="text-sm text-green-900">
            <strong>{metrics.implementedInitiatives}</strong> build initiatives have successfully completed the full approval-to-implementation journey and are now live in their target applications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}