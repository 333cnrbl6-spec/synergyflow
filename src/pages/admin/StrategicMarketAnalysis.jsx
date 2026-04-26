import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, MessageSquare, Zap, Target } from 'lucide-react';
import MarketGapDiscussionPanel from '@/components/strategy/MarketGapDiscussionPanel';
import NewSAASProposalBuilder from '@/components/strategy/NewSAASProposalBuilder';

export default function StrategicMarketAnalysis() {
  const [gaps, setGaps] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [boardMessages, setBoardMessages] = useState([]);
  const [selectedGap, setSelectedGap] = useState(null);
  const [showProposalBuilder, setShowProposalBuilder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gapsList, proposalsList, messagesList] = await Promise.all([
        base44.entities.MarketGapAnalysis.list('-created_date', 50),
        base44.entities.NewSAASProposal.list('-created_date', 50),
        base44.entities.BoardMessage.filter({ channel_id: 'strategy' }, '-timestamp', 100)
      ]);

      setGaps(gapsList);
      setProposals(proposalsList);
      setBoardMessages(messagesList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading strategic analysis...</div>;
  }

  const stats = {
    gaps: gaps.length,
    proposals: proposals.length,
    discussions: boardMessages.length,
    potential_mrr: proposals.reduce((sum, p) => sum + (p.financial_projections?.year_1_mrr_target || 0), 0)
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">UK SaaS Market Strategy</h1>
        <p className="text-slate-600 text-lg">
          Collaborative market gap analysis and new product strategy. Leverage combined strengths to identify uncontested competitive space.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-2">Market Gaps</p>
                <p className="text-3xl font-bold text-slate-900">{stats.gaps}</p>
              </div>
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-2">Proposals</p>
                <p className="text-3xl font-bold text-slate-900">{stats.proposals}</p>
              </div>
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-2">Board Discussion</p>
                <p className="text-3xl font-bold text-slate-900">{stats.discussions}</p>
              </div>
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-2">Y1 MRR Potential</p>
                <p className="text-3xl font-bold text-slate-900">£{(stats.potential_mrr / 1000).toFixed(0)}k</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gaps" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="gaps">Market Gaps</TabsTrigger>
          <TabsTrigger value="proposals">Product Proposals</TabsTrigger>
          <TabsTrigger value="discussion">Board Discussion</TabsTrigger>
          <TabsTrigger value="collaboration">Build Collaborations</TabsTrigger>
        </TabsList>

        {/* Market Gaps Tab */}
        <TabsContent value="gaps">
          <MarketGapDiscussionPanel onGapIdentified={loadData} />
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Product Proposals</h2>
            <Button
              onClick={() => setShowProposalBuilder(!showProposalBuilder)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4" />
              Create Proposal
            </Button>
          </div>

          {showProposalBuilder && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>New SaaS Product Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <NewSAASProposalBuilder
                  gap={selectedGap}
                  onProposalCreated={() => {
                    setShowProposalBuilder(false);
                    loadData();
                  }}
                />
              </CardContent>
            </Card>
          )}

          {proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{proposal.product_name}</h3>
                        <p className="text-slate-600 mt-1">{proposal.tagline}</p>
                      </div>
                      <Badge className={
                        proposal.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : proposal.status === 'ready_for_vote'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {proposal.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-700">{proposal.vision}</p>

                    {proposal.synergyflow_integration?.products_combined && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">SynergyFlow Integration:</p>
                        <div className="flex flex-wrap gap-2">
                          {proposal.synergyflow_integration.products_combined.map((p) => (
                            <Badge key={p} variant="secondary">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {proposal.core_features && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Core Features:</p>
                        <div className="space-y-1">
                          {proposal.core_features.slice(0, 3).map((feat, idx) => (
                            <p key={idx} className="text-sm text-slate-600">• {feat.feature_name}</p>
                          ))}
                          {proposal.core_features.length > 3 && (
                            <p className="text-sm text-slate-500">+ {proposal.core_features.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    {proposal.target_market && (
                      <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg text-center">
                        <div>
                          <p className="text-xs text-slate-600">TAM</p>
                          <p className="font-bold text-slate-900">£{proposal.target_market.tam_gbp_millions}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Y1 MRR</p>
                          <p className="font-bold text-slate-900">£{(proposal.financial_projections?.year_1_mrr_target / 1000).toFixed(0)}k</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">MVP</p>
                          <p className="font-bold text-slate-900">{proposal.build_timeline?.mvp_months}m</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm">View Full Proposal</Button>
                      {proposal.status === 'draft' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Submit to Board</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600">No proposals yet. Start by identifying a market gap above!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Board Discussion Tab */}
        <TabsContent value="discussion" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Board Strategy Discussion</h2>
          {boardMessages.length > 0 ? (
            <div className="space-y-4">
              {boardMessages.map((msg) => (
                <Card key={msg.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{msg.from_member}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(msg.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {msg.message_type}
                      </Badge>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{msg.message_content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600">No discussions yet. Start posting in the #strategy channel!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration">
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-600" />
                Build Collaborations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-700 text-lg">
                SynergyFlow's unique advantage is the ability to combine complementary products into breakthrough solutions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-slate-900 mb-2">🏛️ Legal Tech Excellence</h3>
                  <p className="text-sm text-slate-600">CaseNarrative's legal expertise combined with Base44's AI creates unmatched legal operations intelligence</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-slate-900 mb-2">🌍 Conservation at Scale</h3>
                  <p className="text-sm text-slate-600">Species Explorer + CharityHub creates the only integrated conservation & impact platform</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-slate-900 mb-2">🏢 Property Intelligence</h3>
                  <p className="text-sm text-slate-600">Premiso's market data combined with AI insights for institutional property strategy</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-slate-900 mb-2">🤖 AI-First Enterprise</h3>
                  <p className="text-sm text-slate-600">Base44 AI as the intelligent backbone powering all products creates network effects</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">🎯 Competitive Moat</p>
                <p className="text-sm text-green-800">
                  Competitors have ONE product. We have FIVE, perfectly positioned to build integrated solutions competitors can't match. This is our unfair advantage.
                </p>
              </div>

              <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                <MessageSquare className="w-5 h-5" />
                Join #strategy Board Discussion
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}