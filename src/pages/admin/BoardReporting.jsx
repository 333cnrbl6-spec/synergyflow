import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function BoardReporting() {
  const [proposals, setProposals] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [props, snaps] = await Promise.all([
        base44.entities.BoardProposal.filter({ status: 'approved' }),
        base44.entities.ValuationSnapshot.list(),
      ]);
      setProposals(props);
      setSnapshots(snaps);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingPDF(true);
    try {
      const response = await base44.functions.invoke('generateMonthlyProposalReport', {});
      
      // Convert response to blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const month = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
      a.download = `board-report-${month}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report generated and downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const totalValue = snapshots.reduce((sum, s) => sum + (s.sell_now_value || 0), 0);
  const totalMRR = snapshots.reduce((sum, s) => sum + (s.monthly_mrr || 0), 0);

  // Post-changes uplift: each approved proposal type carries an estimated uplift factor
  const UPLIFT_BY_TYPE = {
    build:        0.12,
    pricing:      0.08,
    go_to_market: 0.10,
    partnership:  0.07,
    governance:   0.03,
    readiness:    0.05,
  };
  const totalUpliftFactor = proposals.reduce((acc, p) => {
    return acc + (UPLIFT_BY_TYPE[p.proposal_type] || 0.05);
  }, 0);
  // Cap combined uplift at 80% to stay credible
  const cappedUplift = Math.min(totalUpliftFactor, 0.80);
  const projectedValue = totalValue * (1 + cappedUplift);
  const projectedMRR = totalMRR * (1 + cappedUplift * 0.6); // MRR grows more conservatively
  const valueDelta = projectedValue - totalValue;
  const upliftPct = Math.round(cappedUplift * 100);

  const proposalsByType = {};
  proposals.forEach(p => {
    if (!proposalsByType[p.proposal_type]) {
      proposalsByType[p.proposal_type] = [];
    }
    proposalsByType[p.proposal_type].push(p);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Board Reporting</h1>
          <p className="text-slate-600">Generate monthly summaries of approved proposals and portfolio impact</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Approved Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{proposals.length}</div>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                £{Math.round(totalValue).toLocaleString()}M
              </div>
              <p className="text-xs text-slate-500 mt-1">Cumulative</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Monthly MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                £{Math.round(totalMRR).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(proposalsByType).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Types</p>
            </CardContent>
          </Card>
        </div>

        {/* Dual Valuation: As-Is vs Post-Changes */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Portfolio Valuation Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

            {/* Current As-Is */}
            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Current — As Is</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    £{totalValue > 0 ? totalValue.toFixed(1) : '—'}M
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Sell-now valuation</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-lg font-semibold text-slate-700">
                    £{Math.round(totalMRR).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500">Monthly MRR</p>
                </div>
                {snapshots.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {snapshots.map(s => (
                      <div key={s.id} className="flex justify-between text-xs text-slate-600">
                        <span className="truncate">{s.product_name}</span>
                        <span className="font-medium shrink-0 ml-2">£{s.sell_now_value?.toFixed(1) || '—'}M</span>
                      </div>
                    ))}
                  </div>
                )}
                {snapshots.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No valuation snapshots recorded yet</p>
                )}
              </CardContent>
            </Card>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{upliftPct}%</div>
                <div className="text-xs text-slate-500">projected uplift</div>
                <div className="text-xs text-slate-400 mt-1">from {proposals.length} approved initiatives</div>
              </div>
              <ArrowRight className="w-8 h-8 text-slate-300 hidden md:block" />
              <div className="text-xs text-slate-400 italic text-center max-w-[140px]">
                Based on proposal type mix & board decisions
              </div>
            </div>

            {/* Post-Changes Projected */}
            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> After Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-green-700">
                    £{projectedValue > 0 ? projectedValue.toFixed(1) : '—'}M
                  </div>
                  <p className="text-xs text-green-600 mt-0.5">Projected sell-now valuation</p>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <div className="text-lg font-semibold text-green-700">
                    £{Math.round(projectedMRR).toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">Projected monthly MRR</p>
                </div>
                <div className="bg-green-100 rounded-lg px-3 py-2 mt-1">
                  <div className="text-sm font-bold text-green-800">
                    +£{valueDelta > 0 ? valueDelta.toFixed(1) : '—'}M value uplift
                  </div>
                  <div className="text-xs text-green-600">
                    +£{Math.round(projectedMRR - totalMRR).toLocaleString()} additional MRR
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-slate-400 mt-3 italic">
            * Projected figures are estimates based on proposal type uplift factors. Build: +12%, Go-to-Market: +10%, Pricing: +8%, Partnership: +7%, Readiness: +5%, Governance: +3% per initiative. Combined uplift capped at 80%.
          </p>
        </div>

        {/* Generate Report Section */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Monthly PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Generate a comprehensive PDF summary including all approved proposals, their categories, and cumulative portfolio impact for board meetings.
            </p>
            <Button
              onClick={generateReport}
              disabled={generatingPDF || proposals.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {generatingPDF ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {generatingPDF ? 'Generating...' : 'Generate & Download PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Proposals by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(proposalsByType).map(([type, typeProposals]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {type.replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-slate-900">{typeProposals.length}</p>
                  <div className="space-y-2">
                    {typeProposals.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-600 line-clamp-1">{p.title}</p>
                        {p.is_unanimous && (
                          <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                            Unanimous
                          </Badge>
                        )}
                      </div>
                    ))}
                    {typeProposals.length > 3 && (
                      <p className="text-xs text-slate-500 pt-2">
                        +{typeProposals.length - 3} more in this category
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {proposals.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No approved proposals yet</p>
                <p className="text-slate-500 text-sm">Reports will be available once proposals are approved</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}