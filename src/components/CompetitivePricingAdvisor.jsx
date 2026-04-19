import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, AlertCircle, CheckCircle2, Target, Loader, RefreshCw, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function CompetitivePricingAdvisor() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Load cached analysis on mount
    const cached = localStorage.getItem('competitivePricingAnalysis');
    if (cached) {
      const data = JSON.parse(cached);
      setAnalysis(data.analysis);
      setLastUpdated(data.timestamp);
    }
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeCompetitivePricing', {});
      
      setAnalysis(response.data.analysis);
      setLastUpdated(new Date().toISOString());
      
      // Cache results
      localStorage.setItem('competitivePricingAnalysis', JSON.stringify({
        analysis: response.data.analysis,
        timestamp: new Date().toISOString()
      }));

      toast.success(`Analyzed ${response.data.analysis.total_products_analyzed} products - ${response.data.analysis.products_needing_adjustment} need adjustment`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to analyze competitive pricing');
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) {
    return (
      <Card className="p-12 text-center border-2 border-dashed border-slate-300">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-semibold mb-2">No competitive analysis yet</p>
        <p className="text-slate-500 text-sm mb-6">Click "Analyze Market" to fetch real-time pricing benchmarks</p>
        <Button onClick={runAnalysis} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Globe className="w-4 h-4" />
          Analyze Market
        </Button>
      </Card>
    );
  }

  const selectedRec = analysis?.recommendations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-emerald-600" />
              Competitive Pricing Advisor
            </h2>
            <p className="text-sm text-emerald-800 mt-1">
              Real-time market benchmarks and pricing recommendations to maintain competitive advantage
            </p>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-emerald-700 mt-3">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </Card>

      {/* Portfolio Optimization Summary */}
      {analysis?.portfolio_optimization && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Portfolio Optimization Strategy
          </h3>
          <div className="space-y-3 text-sm text-blue-900">
            <p><strong>Bundle Opportunity:</strong> {analysis.portfolio_optimization.bundle_opportunity}</p>
            <p><strong>Synergy Pricing:</strong> {analysis.portfolio_optimization.synergy_pricing_potential}</p>
            <p><strong>Overall Strategy:</strong> {analysis.portfolio_optimization.overall_recommendation}</p>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-purple-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Products Analyzed</div>
          <div className="text-3xl font-black text-purple-600">{analysis?.total_products_analyzed || 0}</div>
        </Card>
        <Card className="p-5 border-l-4 border-amber-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Need Price Adjustment</div>
          <div className="text-3xl font-black text-amber-600">{analysis?.products_needing_adjustment || 0}</div>
        </Card>
        <Card className="p-5 border-l-4 border-green-500">
          <div className="text-xs text-slate-600 font-semibold mb-2">Optimization Opportunities</div>
          <div className="text-3xl font-black text-green-600">{analysis?.recommendations.filter(r => r.pricing_recommendation?.urgency === 'high').length || 0}</div>
        </Card>
      </div>

      {/* Product Recommendations */}
      <Tabs defaultValue={analysis?.recommendations[0]?.product_name} className="space-y-4">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(analysis?.recommendations.length || 1, 4)}, 1fr)` }}>
          {analysis?.recommendations.map((rec) => (
            <TabsTrigger key={rec.product_id} value={rec.product_name} className="text-xs">
              {rec.product_name}
              {rec.adjustment_needed && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {analysis?.recommendations.map((rec) => (
          <TabsContent key={rec.product_id} value={rec.product_name}>
            <div className="space-y-4">
              {/* Market Insights */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Market Insights</h3>
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">{rec.market_insights}</p>
                  <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs font-semibold text-slate-900 mb-2">Market Share Potential</div>
                    <p className="text-sm text-slate-700">{rec.estimated_market_share}</p>
                  </div>
                </div>
              </Card>

              {/* Competitive Landscape */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Competitive Landscape</h3>
                <div className="space-y-4">
                  {rec.competitors?.map((comp, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{comp.competitor_name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{comp.market_positioning}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {comp.pricing_tiers?.map((tier, tidx) => (
                          <div key={tidx} className="p-3 bg-slate-50 rounded border border-slate-200">
                            <div className="text-xs font-semibold text-slate-900">{tier.tier_name}</div>
                            <div className="text-lg font-bold text-slate-900 mt-1">£{tier.monthly_price}/mo</div>
                            {tier.annual_price && (
                              <div className="text-xs text-slate-600">£{tier.annual_price}/yr</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pricing Recommendation */}
              {rec.pricing_recommendation && (
                <Card className={`p-6 border-l-4 ${rec.adjustment_needed ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                  <h3 className={`font-bold mb-4 flex items-center gap-2 ${rec.adjustment_needed ? 'text-red-900' : 'text-green-900'}`}>
                    {rec.adjustment_needed ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Pricing Adjustment Recommended
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Pricing is Competitive
                      </>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-white rounded border border-slate-200">
                      <div className="text-xs font-semibold text-slate-900 mb-2">Starter/Entry</div>
                      <div className="text-2xl font-black text-slate-900">£{rec.pricing_recommendation.recommended_entry_price}/mo</div>
                      <Badge className="mt-2 text-xs bg-blue-100 text-blue-700 border-blue-300">Entry Tier</Badge>
                    </div>
                    <div className="p-4 bg-white rounded border border-slate-200 ring-2 ring-amber-300">
                      <div className="text-xs font-semibold text-slate-900 mb-2">Professional/Mid</div>
                      <div className="text-2xl font-black text-slate-900">£{rec.pricing_recommendation.recommended_mid_price}/mo</div>
                      <Badge className="mt-2 text-xs bg-amber-100 text-amber-700 border-amber-300">Most Popular</Badge>
                    </div>
                    <div className="p-4 bg-white rounded border border-slate-200">
                      <div className="text-xs font-semibold text-slate-900 mb-2">Enterprise/Premium</div>
                      <div className="text-2xl font-black text-slate-900">£{rec.pricing_recommendation.recommended_premium_price}/mo</div>
                      <Badge className="mt-2 text-xs bg-purple-100 text-purple-700 border-purple-300">Premium</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <div className="font-semibold text-slate-900 mb-1">Competitive Advantage</div>
                      <p className="text-slate-700">{rec.pricing_recommendation.competitive_advantage}</p>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200">
                      <div className="font-semibold text-slate-900 mb-1">Rationale</div>
                      <p className="text-slate-700">{rec.pricing_recommendation.pricing_rationale}</p>
                    </div>
                  </div>

                  {rec.pricing_recommendation.urgency && (
                    <div className="mt-4 flex items-center gap-2">
                      <Badge className={`${
                        rec.pricing_recommendation.urgency === 'high' ? 'bg-red-600 text-white' :
                        rec.pricing_recommendation.urgency === 'medium' ? 'bg-amber-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {rec.pricing_recommendation.urgency.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Methodology */}
      <Card className="p-6 bg-slate-50 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3">Analysis Methodology</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• <strong>Real-time Web Search:</strong> Current competitor pricing, features, and positioning</li>
          <li>• <strong>Market Benchmarking:</strong> Typical pricing ranges for your software categories</li>
          <li>• <strong>Synergy Analysis:</strong> Cross-product bundling and portfolio optimization opportunities</li>
          <li>• <strong>Competitive Positioning:</strong> Feature differentiation and pricing strategy recommendations</li>
        </ul>
        <p className="text-xs text-slate-600 mt-4">
          Data refreshed daily. Recommendations are based on current market conditions and should be validated with sales and customer feedback.
        </p>
      </Card>
    </div>
  );
}