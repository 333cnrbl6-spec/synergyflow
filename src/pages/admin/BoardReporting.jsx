import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
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