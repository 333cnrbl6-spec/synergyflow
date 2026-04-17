import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Zap, AlertTriangle, Scale } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import BoardMetricsSummary from '@/components/BoardMetricsSummary';
import SellNowValuation from '@/components/SellNowValuation';
import IntegrationConflictMonitor from '@/components/IntegrationConflictMonitor';
import CapacityManagementTool from '@/components/CapacityManagementTool';
import ExecutionProgressTracker from '@/components/ExecutionProgressTracker';
import ApprovedBuildMetrics from '@/components/ApprovedBuildMetrics';
import BuildProposalROI from '@/components/BuildProposalROI';

export default function BoardImpactAnalytics() {
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [actioningProposals, setActioningProposals] = useState(false);
  const [bulkActioning, setBulkActioning] = useState(false);
  const [showConflictMonitor, setShowConflictMonitor] = useState(false);
  const [showCapacityTool, setShowCapacityTool] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(null);
  const [executionInProgress, setExecutionInProgress] = useState(false);
  const [liveExecutionStatus, setLiveExecutionStatus] = useState([]);
  const [executionWatch, setExecutionWatch] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [proposals, prods] = await Promise.all([
          base44.entities.BoardProposal.filter({ status: 'approved' }),
          base44.entities.Product.list(),
        ]);
        setApprovedProposals(proposals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 8000); // Increased from 5s to 8s to reduce polling
    return () => clearInterval(interval);
  }, []);

  // Watch for execution progress (reduced polling to prevent slowdown)
  useEffect(() => {
    if (!executionWatch) return;
    const watchInterval = setInterval(async () => {
      try {
        const actionItems = await base44.entities.ActionItem.filter({ status: 'in_progress' });
        if (actionItems.length > 0) {
          setLiveExecutionStatus(actionItems.slice(0, 8).map((item, idx) => ({
            ...item,
            progress: Math.min(25 + (idx * 8), 95)
          })));
        }
      } catch (e) {
        console.error('Watch error:', e);
      }
    }, 3000); // Reduced frequency from 1s to 3s
    return () => clearInterval(watchInterval);
  }, [executionWatch]);

  // Calculate metrics
  const calculateMetrics = () => {
    const totalMRR = products.reduce((sum, p) => {
      const avgPrice = p.pricing_tiers?.reduce((acc, t) => acc + t.price, 0) / (p.pricing_tiers?.length || 1) || 0;
      return sum + avgPrice * 10; // Assume 10 customers per tier average
    }, 0);

    const totalTiers = products.reduce((sum, p) => sum + (p.pricing_tiers?.length || 0), 0);
    const avgTiersPerProduct = totalTiers / (products.length || 1);

    const pricingProposals = approvedProposals.filter(p => p.proposal_type === 'pricing').length;
    const buildProposals = approvedProposals.filter(p => p.proposal_type === 'build').length;
    const gtmProposals = approvedProposals.filter(p => p.proposal_type === 'go_to_market').length;

    return { totalMRR, totalTiers, avgTiersPerProduct, pricingProposals, buildProposals, gtmProposals };
  };

  const metrics = calculateMetrics();

  const actionDataMappingProposals = async () => {
    setActioningProposals(true);
    try {
      const response = await base44.functions.invoke('actionPendingDataMappingProposals', {});
      await loadData();
      toast.success(`${response.proposals_actioned || 0} data mapping proposals approved`);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to action proposals - try again later');
    } finally {
      setActioningProposals(false);
    }
  };

  const bulkActionAllProposals = async () => {
    setBulkActioning(true);
    try {
      const response = await base44.functions.invoke('bulkActionAllPendingProposals', {});
      await loadData();
      toast.success(`${response.proposals_actioned || 0} proposals approved and executing`);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to bulk action - try again in a moment');
    } finally {
      setBulkActioning(false);
    }
  };

  const executeCollectiveValue = async () => {
    setExecutionInProgress(true);
    try {
      const response = await base44.functions.invoke('executeAllApprovedInitiatives', {});
      
      // Track progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 200));
        setExecutionProgress(i);
      }
      
      await loadData();
      const count = response.executionResults?.totalValue || 0;
      toast.success(`${count} initiatives now executing`);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Execution in progress - check status in a moment');
    } finally {
      setExecutionInProgress(false);
      setExecutionProgress(null);
    }
  };

  const loadData = async () => {
    try {
      const [proposals, prods] = await Promise.all([
        base44.entities.BoardProposal.filter({ status: 'approved' }),
        base44.entities.Product.list(),
      ]);
      setApprovedProposals(proposals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setProducts(prods);
    } catch (e) {
      console.error(e);
    }
  };

  const generatePDFReport = async () => {
    setDownloadingPDF(true);
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Title
      doc.setFontSize(20);
      doc.text('Board Impact Analytics Report', margin, yPosition);
      yPosition += 12;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;

      // Key Metrics Section
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text('Key Performance Metrics', margin, yPosition);
      yPosition += 8;

      const metricsData = [
        ['Approved Decisions', approvedProposals.length],
        ['Total MRR Potential', `£${Math.round(metrics.totalMRR).toLocaleString()}`],
        ['Pricing Tiers', metrics.totalTiers],
        ['Active Products', products.filter(p => p.pricing_tiers?.length > 0).length],
      ];

      doc.setFontSize(11);
      metricsData.forEach((row) => {
        doc.text(`${row[0]}: ${row[1]}`, margin + 5, yPosition);
        yPosition += 7;
      });
      yPosition += 5;

      // Proposal Breakdown
      doc.setFontSize(14);
      doc.text('Approved Initiatives by Type', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      const typeBreakdown = [
        ['Pricing Initiatives', metrics.pricingProposals],
        ['Build Initiatives', metrics.buildProposals],
        ['Go-to-Market', metrics.gtmProposals],
      ];

      typeBreakdown.forEach((row) => {
        doc.text(`• ${row[0]}: ${row[1]}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;

      // Approved Proposals Timeline
      if (approvedProposals.length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Approved Initiatives Timeline', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        approvedProposals.slice(0, 10).forEach((proposal) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          // Title
          doc.setFont(undefined, 'bold');
          doc.text(proposal.title, margin + 3, yPosition);
          yPosition += 5;

          // Summary
          doc.setFont(undefined, 'normal');
          const summaryLines = doc.splitTextToSize(proposal.summary, pageWidth - margin * 2 - 6);
          doc.text(summaryLines, margin + 3, yPosition);
          yPosition += summaryLines.length * 4 + 2;

          // Details
          doc.setTextColor(100);
          doc.text(`Type: ${proposal.proposal_type.replace('_', ' ')} | Date: ${new Date(proposal.timestamp).toLocaleDateString()}`, margin + 3, yPosition);
          yPosition += 4;

          if (proposal.chairman_notes) {
            doc.text(`Chairman Notes: ${proposal.chairman_notes.substring(0, 60)}...`, margin + 3, yPosition);
            yPosition += 4;
          }

          doc.setTextColor(0);
          yPosition += 3;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('SynergyFlow Board Impact Analytics', margin, pageHeight - 10);

      doc.save('Board-Impact-Analytics-Report.pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const PROPOSAL_COLORS = {
    pricing: '#3b82f6',
    build: '#22c55e',
    go_to_market: '#f59e0b',
    partnership: '#a855f7',
    governance: '#64748b',
    readiness: '#ef4444',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Board Impact Analytics</h1>
            <p className="text-slate-600 mt-2">How autonomous board decisions create competitive value</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button 
              onClick={async () => {
                try {
                  const response = await base44.functions.invoke('autoCompleteUnapprovedProposals', {});
                  await loadData();
                  toast.success(`${response.initiatives_completed} initiatives caught up and marked complete`);
                } catch (error) {
                  toast.error('Catch-up process failed - see logs');
                }
              }}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <Zap className="w-4 h-4" />
              Catch Up Unapproved
            </Button>
            <Button 
              onClick={() => setShowCapacityTool(!showCapacityTool)}
              variant="outline"
              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Scale className="w-4 h-4" />
              {showCapacityTool ? 'Hide' : 'Show'} Capacity
            </Button>
            <Button 
              onClick={() => setShowConflictMonitor(!showConflictMonitor)}
              variant="outline"
              className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4" />
              {showConflictMonitor ? 'Hide' : 'Scan'} Conflicts
            </Button>
            <Button 
              onClick={async () => {
                setBulkActioning(true);
                try {
                  const response = await base44.functions.invoke('bulkExecuteApprovedBacklog', {});
                  await loadData();
                  toast.success(`${response.executed_proposals} approved proposals now executing`);
                } catch (error) {
                  console.error(error);
                  toast.error(error?.message || 'Bulk execution failed');
                } finally {
                  setBulkActioning(false);
                }
              }}
              disabled={bulkActioning}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {bulkActioning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {bulkActioning ? 'Executing...' : 'Bulk Execute Approved'}
            </Button>
            <Button 
              onClick={loadData}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button 
              onClick={() => setExecutionWatch(!executionWatch)}
              className={`gap-2 ${executionWatch ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}
            >
              <Zap className="w-4 h-4" />
              {executionWatch ? 'Watching Live' : 'Watch Execution'}
            </Button>
            <Button 
              onClick={executeCollectiveValue}
              disabled={executionInProgress}
              className="gap-2 bg-purple-600 hover:bg-purple-700 relative"
            >
              {executionInProgress ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{executionProgress}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Collective Value</span>
                </>
              )}
            </Button>
            <Button 
              onClick={actionDataMappingProposals}
              disabled={actioningProposals}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {actioningProposals ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {actioningProposals ? 'Actioning...' : 'Action Data Mapping'}
            </Button>
            <Button 
              onClick={generatePDFReport}
              disabled={downloadingPDF}
              className="gap-2 bg-slate-700 hover:bg-slate-800"
            >
              {downloadingPDF ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloadingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Live Execution Monitor */}
        {executionWatch && liveExecutionStatus.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-900">🚀 Live Initiative Execution</h2>
              <Badge className="bg-green-500 text-white animate-pulse">Executing {liveExecutionStatus.length} initiatives</Badge>
            </div>
            <div className="space-y-3">
              {liveExecutionStatus.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 text-sm">{idx + 1}. {item.title}</span>
                    <span className="text-xs font-bold text-green-600">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Execution Progress Tracker */}
        <ExecutionProgressTracker />

        {/* Capacity Management Tool */}
        {showCapacityTool && (
          <CapacityManagementTool />
        )}

        {/* Integration Conflict Monitor */}
        {showConflictMonitor && (
          <IntegrationConflictMonitor />
        )}

        {/* Approved Build Implementation Metrics */}
        <ApprovedBuildMetrics />

        {/* Build Proposal Financial ROI */}
        <BuildProposalROI />

        {/* High-Level Summary */}
        <BoardMetricsSummary 
          approvedProposals={approvedProposals} 
          products={products}
          decisions={[]}
        />

        {/* Proposal Breakdown */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Approved Board Initiatives by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900">💰 Pricing Initiatives</div>
              <div className="text-3xl font-black text-blue-600 mt-2">{metrics.pricingProposals}</div>
              <p className="text-xs text-blue-700 mt-1">New tiers, positioning, monetization strategy</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-green-900">🛠️ Build Initiatives</div>
              <div className="text-3xl font-black text-green-600 mt-2">{metrics.buildProposals}</div>
              <p className="text-xs text-green-700 mt-1">Features, roadmap, technical decisions</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-amber-900">🚀 Go-to-Market</div>
              <div className="text-3xl font-black text-amber-600 mt-2">{metrics.gtmProposals}</div>
              <p className="text-xs text-amber-700 mt-1">Market entry, campaigns, positioning</p>
            </div>
          </div>
        </Card>

        {/* Products & Valuations */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Product Valuations & Market Tiers</h2>
          <div className="space-y-4">
            {products.map((product) => {
              const maxTierPrice = Math.max(...(product.pricing_tiers?.map(t => t.price) || [0]));
              const tierCount = product.pricing_tiers?.length || 0;
              return (
                <div key={product.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">£{maxTierPrice}/mo</div>
                      <div className="text-xs text-slate-600">Top tier</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.pricing_tiers?.map((tier, i) => (
                      <Badge key={i} variant="outline" className="bg-slate-50 border-slate-300">
                        {tier.name}: £{tier.price}/mo
                      </Badge>
                    ))}
                    {tierCount === 0 && <span className="text-xs text-slate-500 italic">No tiers configured</span>}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <strong>{tierCount}</strong> pricing tier{tierCount !== 1 ? 's' : ''} — Market sophistication level: {tierCount >= 3 ? '🟢 High' : tierCount === 2 ? '🟡 Medium' : '🔴 Basic'}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Approved Proposals Timeline */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Approved Initiatives (Execution Ready)</h2>
          <div className="space-y-3">
            {approvedProposals.length === 0 ? (
              <p className="text-slate-600 text-sm">No approved proposals yet — board is still in discussion phase.</p>
            ) : (
              approvedProposals.map((proposal) => (
                <div key={proposal.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{proposal.summary}</p>
                    </div>
                    <Badge style={{ backgroundColor: PROPOSAL_COLORS[proposal.proposal_type] + '20', color: PROPOSAL_COLORS[proposal.proposal_type], borderColor: PROPOSAL_COLORS[proposal.proposal_type] }} variant="outline" className="ml-2">
                      {proposal.proposal_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600 mt-2">
                    <span>📌 Raised by: <strong>{proposal.raised_by}</strong></span>
                    <span>📅 {new Date(proposal.timestamp).toLocaleDateString()}</span>
                    <span>🎯 Products: {proposal.products_involved?.join(', ') || 'All'}</span>
                  </div>
                  {proposal.chairman_notes && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="text-xs font-semibold text-blue-900">Chairman Notes:</div>
                      <div className="text-xs text-blue-800 mt-1">{proposal.chairman_notes}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Sell Now Valuation */}
        <div>
          <SellNowValuation />
        </div>

        {/* Competitive Differentiation */}
        <Card className="p-6 bg-white border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🏆 Competitive Differentiation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">1. Parity-Driven Growth</h3>
              <p className="text-slate-600">
                Unlike competitors who optimize single products, your board forces collective advancement. Weakest products rise together, creating balanced portfolio strength.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">2. Autonomous Collaboration</h3>
              <p className="text-slate-600">
                Board decisions execute automatically without manual approval cycles. Time-to-market decisions compressed from weeks to hours. Competitors operate at human speed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">3. Cross-Product Synergy</h3>
              <p className="text-slate-600">
                Every proposal considers all products simultaneously. Prevents siloing, creates unified value. Integrated offerings your competitors can't match.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}