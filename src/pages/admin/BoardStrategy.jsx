import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, AlertCircle, Rocket, Users, Zap } from 'lucide-react';
import StrategyLaunchPrep from '@/components/strategy/StrategyLaunchPrep';
import StrategyBusinessPlan from '@/components/strategy/StrategyBusinessPlan';
import StrategyRoadmap from '@/components/strategy/StrategyRoadmap';
import StrategyExecution from '@/components/strategy/StrategyExecution';
import ValuationProposalBuilder from '@/components/ValuationProposalBuilder';
import ValuationCalculator from '@/components/ValuationCalculator';
import CrossSynergyOpportunityAnalyzer from '@/components/CrossSynergyOpportunityAnalyzer';

export default function BoardStrategy() {
  const [products, setProducts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, usersList] = await Promise.all([
          base44.entities.Product.list(),
          base44.entities.User.list(),
        ]);
        setProducts(prods);
        setUsers(usersList);

        // Get approved proposals as board initiatives
        const propRes = await base44.functions.invoke('boardCommunications', { action: 'get_proposals' });
        setProposals(propRes.data.proposals?.filter(p => p.status === 'approved') || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const launchReadyCount = products.filter(p => p.pricing_tiers?.length > 0).length;
  const executingCount = proposals.filter(p => p.proposal_type === 'build' || p.proposal_type === 'go_to_market').length;
  const strategicGoals = proposals.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900">Board Strategy & Market Execution</h1>
          <p className="text-slate-600 mt-2">Unified roadmap from planning through go-to-market</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">STRATEGIC INITIATIVES</p>
                  <p className="text-3xl font-black text-slate-900">{strategicGoals}</p>
                  <p className="text-xs text-slate-600 mt-1">Board-approved decisions</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">IN EXECUTION</p>
                  <p className="text-3xl font-black text-slate-900">{executingCount}</p>
                  <p className="text-xs text-slate-600 mt-1">Build + GTM initiatives</p>
                </div>
                <div className="text-3xl">⚙️</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">LAUNCH READY</p>
                  <p className="text-3xl font-black text-slate-900">{launchReadyCount}</p>
                  <p className="text-xs text-slate-600 mt-1">Priced products</p>
                </div>
                <div className="text-3xl">🚀</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">TOTAL PRODUCTS</p>
                  <p className="text-3xl font-black text-slate-900">{products.length}</p>
                  <p className="text-xs text-slate-600 mt-1">In portfolio</p>
                </div>
                <div className="text-3xl">📦</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Strategy Overview</TabsTrigger>
              <TabsTrigger value="synergy">Cross-Synergy</TabsTrigger>
              <TabsTrigger value="valuation">Portfolio Valuation</TabsTrigger>
              <TabsTrigger value="launch">Launch Prep</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
            </TabsList>

          {/* Strategy Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategic Pillars */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Market Strategy Pillars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proposals.length === 0 ? (
                    <p className="text-slate-600 text-sm">No board initiatives yet. Create proposals to define strategy.</p>
                  ) : (
                    proposals.map((p) => (
                      <div key={p.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{p.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{p.summary}</p>
                          </div>
                          <Badge className="capitalize bg-blue-100 text-blue-700 border-blue-200">{p.proposal_type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-slate-600">
                          <span>📌 By {p.raised_by}</span>
                          <span>🎯 Products: {p.products_involved?.join(', ') || 'All'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Product Portfolio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-green-600" />
                    Product Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                      <Badge variant={p.pricing_tiers?.length > 0 ? 'default' : 'outline'} className="text-xs">
                        {p.pricing_tiers?.length > 0 ? `${p.pricing_tiers.length} tiers` : 'Prep'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Team Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-purple-600" />
                    Leadership Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-sm text-slate-900">{u.full_name}</span>
                      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">{u.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cross-Synergy Opportunities */}
          <TabsContent value="synergy" className="space-y-4">
            <CrossSynergyOpportunityAnalyzer />
          </TabsContent>

          {/* Portfolio Valuation */}
          <TabsContent value="valuation" className="space-y-4">
            <ValuationProposalBuilder />
            <ValuationCalculator />
          </TabsContent>

          {/* Launch Preparation */}
          <TabsContent value="launch">
            <StrategyLaunchPrep products={products} proposals={proposals} />
          </TabsContent>

          {/* Business Planning */}
          <TabsContent value="roadmap">
            <div className="space-y-4">
              <StrategyBusinessPlan products={products} proposals={proposals} />
              <StrategyRoadmap products={products} proposals={proposals} />
            </div>
          </TabsContent>

          {/* Execution Tracking */}
          <TabsContent value="execution">
            <StrategyExecution products={products} proposals={proposals} users={users} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}