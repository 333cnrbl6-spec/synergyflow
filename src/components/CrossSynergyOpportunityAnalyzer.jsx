import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Send, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function CrossSynergyOpportunityAnalyzer() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [overlapSummary, setOverlapSummary] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load any previously analyzed opportunities from localStorage
    const cached = localStorage.getItem('crossSynergyOpportunities');
    if (cached) {
      const data = JSON.parse(cached);
      setOpportunities(data.opportunities || []);
      setOverlapSummary(data.overlap_summary);
    }
  }, []);

  const analyzeOpportunities = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeCrossSynergyOpportunities', {});
      
      setOpportunities(response.data.opportunities || []);
      setOverlapSummary(response.data.subscriber_overlap_summary);
      
      // Cache results
      localStorage.setItem('crossSynergyOpportunities', JSON.stringify({
        opportunities: response.data.opportunities || [],
        overlap_summary: response.data.subscriber_overlap_summary
      }));

      toast.success(`Found ${response.data.new_opportunities} new cross-synergy opportunities`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to analyze opportunities');
    } finally {
      setAnalyzing(false);
    }
  };

  const submitToBoard = async (opportunity) => {
    setSubmitting(true);
    try {
      // Create a board proposal from the opportunity
      await base44.entities.BoardProposal.create({
        title: opportunity.title,
        summary: opportunity.summary,
        raised_by: 'ML Analysis',
        channel_id: 'strategy',
        channel_name: '#strategy',
        proposal_type: 'build',
        products_involved: opportunity.products_involved,
        status: 'pending_chairman',
        is_unanimous: false,
        approval_stage: 'needs_review',
        discussion_count: 0,
        yes_votes: [],
        no_votes: [],
        abstain_votes: [],
        timestamp: new Date().toISOString()
      });

      toast.success(`Proposal "${opportunity.title}" submitted to board for review`);
      setSelectedOpportunity(null);
      
      // Refresh opportunities to mark as submitted
      analyzeOpportunities();
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-300';
      case 'P2': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getEffortColor = (effort) => {
    switch(effort) {
      case 'Low': return 'text-green-700 bg-green-50';
      case 'Medium': return 'text-amber-700 bg-amber-50';
      case 'High': return 'text-red-700 bg-red-50';
      default: return 'text-slate-700 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              Cross-Synergy Opportunity Analyzer
            </h2>
            <p className="text-sm text-indigo-800 mt-1">
              ML-powered analysis identifies feature gaps and subscriber overlaps to suggest new build proposals
            </p>
          </div>
          <Button
            onClick={analyzeOpportunities}
            disabled={analyzing}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {analyzing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Subscriber Overlap Summary */}
      {overlapSummary && overlapSummary.high_overlap_pairs && overlapSummary.high_overlap_pairs.length > 0 && (
        <Card className="p-6 border-l-4 border-cyan-500 bg-cyan-50">
          <h3 className="font-bold text-cyan-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            High Overlap Product Pairs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overlapSummary.high_overlap_pairs.map((pair, i) => (
              <div key={i} className="p-4 bg-white rounded border border-cyan-200">
                <div className="font-semibold text-slate-900">{pair.products}</div>
                <div className="text-sm text-slate-600 mt-2">
                  {pair.shared_subscribers} shared subscribers ({pair.overlap_percent}% overlap)
                </div>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(pair.overlap_percent, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Opportunities List */}
      {opportunities.length === 0 && !analyzing ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-300">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold mb-2">No opportunities analyzed yet</p>
          <p className="text-slate-500 text-sm">Click "Run Analysis" to identify cross-synergy opportunities</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp, idx) => (
            <Card 
              key={opp.opportunity_id}
              className={`p-5 cursor-pointer transition-all border-l-4 ${
                selectedOpportunity?.opportunity_id === opp.opportunity_id
                  ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-300'
                  : 'border-slate-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedOpportunity(selectedOpportunity?.opportunity_id === opp.opportunity_id ? null : opp)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{opp.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{opp.summary}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Badge className={`border ${getPriorityColor(opp.priority)}`}>
                    {opp.priority}
                  </Badge>
                  <Badge className={`border ${getEffortColor(opp.effort)}`}>
                    {opp.effort} Effort
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {opp.products_involved.map((prod, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-50">
                    {prod}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded border border-slate-200 mb-3">
                <strong className="text-slate-900">Impact:</strong> {opp.estimated_impact}
              </div>

              {selectedOpportunity?.opportunity_id === opp.opportunity_id && (
                <div className="space-y-3 border-t border-slate-200 pt-3 mt-3">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Implementation Hint</div>
                    <p className="text-sm text-blue-900">{opp.implementation_hint}</p>
                  </div>
                  <Button
                    onClick={() => submitToBoard(opp)}
                    disabled={submitting}
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit to Board for Review
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Info */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          How This Works
        </h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Feature Gap Analysis:</strong> ML examines each product's feature set and identifies gaps that other products in the portfolio already solve.
          </p>
          <p>
            <strong>Subscriber Overlap:</strong> Calculates which customers use multiple products, indicating opportunity for cross-selling or integration.
          </p>
          <p>
            <strong>Proposal Generation:</strong> Suggests build initiatives that leverage existing customer overlap and fill feature gaps, maximizing customer lifetime value.
          </p>
          <p className="pt-2 text-xs text-slate-600">
            Proposals are submitted to the board for chairman review and can be auto-executed if approved. Cache refreshes every hour.
          </p>
        </div>
      </Card>
    </div>
  );
}