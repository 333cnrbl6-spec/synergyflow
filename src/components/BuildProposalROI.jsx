import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function BuildProposalROI() {
  const [proposals, setProposals] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRevenue: 0,
    maxRevenue: 100000,
    minROI: -100,
    maxROI: 1000
  });

  useEffect(() => {
    loadProposalData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [proposals, filters]);

  const loadProposalData = async () => {
    try {
      // Get all build proposals
      const buildProposals = await base44.asServiceRole.entities.BoardProposal.filter({
        proposal_type: 'build',
        status: 'approved'
      });

      // Get products for revenue data
      const products = await base44.asServiceRole.entities.Product.list();
      const productMap = products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Get action items for cost estimation
      const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
        trigger_entity_type: 'BoardProposal'
      });

      // Calculate financial metrics per proposal
      const proposalsWithMetrics = buildProposals.map(proposal => {
        // Estimated implementation cost (based on action items)
        const relatedActions = actionItems.filter(a => a.trigger_entity_id === proposal.id);
        const estimatedCost = relatedActions.length * 5000; // £5k per action item

        // Projected revenue from related products
        const relatedProduct = proposal.products_involved?.[0];
        const product = productMap[relatedProduct];
        const projectedRevenue = product?.pricing_tiers?.reduce((sum, tier) => sum + tier.price * 10, 0) || 15000;

        // ROI calculation
        const roi = estimatedCost > 0 ? ((projectedRevenue - estimatedCost) / estimatedCost) * 100 : 0;

        return {
          id: proposal.id,
          title: proposal.title,
          summary: proposal.summary,
          products: proposal.products_involved || [],
          estimatedCost,
          projectedRevenue,
          roi: Math.round(roi),
          actionCount: relatedActions.length,
          timestamp: proposal.timestamp
        };
      });

      setProposals(proposalsWithMetrics.sort((a, b) => b.roi - a.roi));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load proposal data:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = proposals.filter(p =>
      p.projectedRevenue >= filters.minRevenue &&
      p.projectedRevenue <= filters.maxRevenue &&
      p.roi >= filters.minROI &&
      p.roi <= filters.maxROI
    );
    setFilteredData(filtered);
  };

  const totalRevenue = filteredData.reduce((sum, p) => sum + p.projectedRevenue, 0);
  const totalCost = filteredData.reduce((sum, p) => sum + p.estimatedCost, 0);
  const avgROI = filteredData.length > 0 ? Math.round(filteredData.reduce((sum, p) => sum + p.roi, 0) / filteredData.length) : 0;

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-green-700 font-semibold">Total Projected Revenue</p>
                <p className="text-3xl font-black text-green-600 mt-2">£{(totalRevenue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-orange-700 font-semibold">Total Implementation Cost</p>
                <p className="text-3xl font-black text-orange-600 mt-2">£{(totalCost / 1000).toFixed(0)}k</p>
              </div>
              <Zap className="w-5 h-5 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-700 font-semibold">Avg ROI</p>
                <p className="text-3xl font-black text-blue-600 mt-2">{avgROI}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-purple-700 font-semibold">Net Profit Potential</p>
                <p className="text-3xl font-black text-purple-600 mt-2">£{((totalRevenue - totalCost) / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="w-5 h-5 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter by Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Revenue Range (£)</label>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="5000"
                value={filters.maxRevenue}
                onChange={(e) => setFilters({...filters, maxRevenue: parseInt(e.target.value)})}
                className="w-full"
              />
              <p className="text-xs text-slate-600 mt-1">Up to £{filters.maxRevenue.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">ROI Range (%)</label>
              <input 
                type="range" 
                min="-100" 
                max="1000" 
                step="50"
                value={filters.maxROI}
                onChange={(e) => setFilters({...filters, maxROI: parseInt(e.target.value)})}
                className="w-full"
              />
              <p className="text-xs text-slate-600 mt-1">Up to {filters.maxROI}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scatter Chart - Revenue vs Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Implementation Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="estimatedCost" name="Implementation Cost (£)" />
              <YAxis dataKey="projectedRevenue" name="Projected Revenue (£)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Initiatives" data={filteredData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ROI by Initiative</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="roi" fill="#10b981" name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Proposal List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Build Initiatives Breakdown ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <p className="text-slate-600 text-sm">No initiatives match the selected filters.</p>
            ) : (
              filteredData.map((proposal) => (
                <div key={proposal.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{proposal.summary}</p>
                    </div>
                    <Badge className={`ml-2 ${proposal.roi >= 100 ? 'bg-green-100 text-green-900' : proposal.roi >= 0 ? 'bg-blue-100 text-blue-900' : 'bg-red-100 text-red-900'}`}>
                      {proposal.roi}% ROI
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600">Cost</p>
                      <p className="font-semibold text-slate-900">£{(proposal.estimatedCost / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Revenue</p>
                      <p className="font-semibold text-slate-900">£{(proposal.projectedRevenue / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Net Profit</p>
                      <p className="font-semibold text-green-600">£{((proposal.projectedRevenue - proposal.estimatedCost) / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}