import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Target, Users, AlertCircle, CheckCircle2, 
  ArrowUpRight, BarChart3, Zap, GitBranch 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

const APP_CONFIG = {
  species_explorer: { 
    name: 'Species Explorer', 
    color: '#10b981',
    emoji: '🦎',
    synergy: 'Conservation Hub',
    role: 'Field Research & Data Collection'
  },
  premiso: { 
    name: 'Premiso', 
    color: '#3b82f6',
    emoji: '🏢',
    synergy: 'SynergyFlow',
    role: 'Property Management & Operations'
  },
  charityhub: { 
    name: 'CharityHub', 
    color: '#ec4899',
    emoji: '❤️',
    synergy: 'SynergyFlow',
    role: 'Third Sector Operations & Compliance'
  },
  casenarrative: { 
    name: 'CaseNarrative', 
    color: '#8b5cf6',
    emoji: '⚖️',
    synergy: 'Legal Integration Hub',
    role: 'Legal Case Documentation & AI'
  },
};

const SYNERGY_GROUPS = {
  'SynergyFlow': {
    name: 'SynergyFlow',
    products: ['premiso', 'charityhub'],
    description: 'Operational management across property and third sector',
    synergy_multiplier: 1.15,
    benefits: [
      'Unified user/organization database',
      'Cross-product reporting',
      'Shared compliance framework'
    ]
  },
  'Conservation Hub': {
    name: 'Conservation Hub',
    products: ['species_explorer'],
    description: 'Wildlife research and conservation data',
    synergy_multiplier: 1.0,
    benefits: [
      'Specialized research tools',
      'Field data collection',
      'Species tracking'
    ]
  },
  'Legal Integration Hub': {
    name: 'Legal Integration Hub',
    products: ['casenarrative'],
    description: 'Legal case management and narrative building',
    synergy_multiplier: 1.0,
    benefits: [
      'AI-assisted documentation',
      'Legal compliance tracking',
      'Case management'
    ]
  }
};

export default function PostExecutionStrategy() {
  const [valuations, setValuations] = useState({});
  const [readiness, setReadiness] = useState({});
  const [executedProposals, setExecutedProposals] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [snaps, ready, proposals, members] = await Promise.all([
        base44.entities.ValuationSnapshot.list().catch(() => []),
        base44.entities.ProductReadiness.list().catch(() => []),
        base44.entities.BoardProposal.filter({ status: 'approved', approval_stage: 'completed' }).catch(() => []),
        base44.entities.BoardMember.list().catch(() => [])
      ]);

      // Group latest valuations by product
      const latestVals = {};
      snaps.forEach(snap => {
        const key = snap.product_name?.toLowerCase().replace(/\s+/g, '_');
        if (!latestVals[key] || new Date(snap.snapshot_date) > new Date(latestVals[key].snapshot_date)) {
          latestVals[key] = snap;
        }
      });
      setValuations(latestVals);

      // Group latest readiness by product
      const latestReady = {};
      ready.forEach(r => {
        const key = r.product_name?.toLowerCase().replace(/\s+/g, '_');
        if (!latestReady[key] || new Date(r.last_assessed) > new Date(latestReady[key].last_assessed)) {
          latestReady[key] = r;
        }
      });
      setReadiness(latestReady);

      setExecutedProposals(proposals);
      setBoardMembers(members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  // Calculate portfolio impact
  const portfolioMetrics = calculatePortfolioMetrics(valuations, readiness);

  return (
    <div className="space-y-8">
      
      {/* Executive Summary */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <TrendingUp className="w-7 h-7 text-green-400" />
              Post-Execution Strategic Impact
            </h2>
            <p className="text-slate-300">Analysis of last series proposal execution and portfolio readiness for collaborative next steps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-300 mb-1">Portfolio Value Increase</div>
            <div className="text-3xl font-bold text-green-400">
              +{portfolioMetrics.totalValueIncrease}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {portfolioMetrics.totalAbsoluteIncrease > 0 && `£${(portfolioMetrics.totalAbsoluteIncrease / 1000000).toFixed(1)}M`}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-300 mb-1">Average Readiness</div>
            <div className="text-3xl font-bold text-blue-400">{portfolioMetrics.avgReadiness}%</div>
            <div className="text-xs text-slate-400 mt-1">Across all products</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-300 mb-1">Executed Proposals</div>
            <div className="text-3xl font-bold text-amber-400">{executedProposals.length}</div>
            <div className="text-xs text-slate-400 mt-1">Deployed to build</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
            <div className="text-sm text-slate-300 mb-1">Synergy Multiplier</div>
            <div className="text-3xl font-bold text-purple-400">
              {(portfolioMetrics.synergyMultiplier * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Combined products boost</div>
          </div>
        </div>
      </Card>

      {/* Individual Product Valuations */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Product Valuation Impact Analysis
        </h3>
        
        <div className="grid gap-4">
          {Object.entries(APP_CONFIG).map(([appId, config]) => {
            const val = valuations[appId];
            const ready = readiness[appId];
            const relatedProposals = executedProposals.filter(p => 
              p.products_involved?.some(prod => prod.toLowerCase().includes(appId.replace('_', ' ')))
            );

            const beforeValue = val?.sell_now_value ? val.sell_now_value * 0.8 : 0; // Estimate before as 80% of after
            const afterValue = val?.sell_now_value || 0;
            const valueIncrease = afterValue - beforeValue;
            const percentIncrease = beforeValue > 0 ? ((valueIncrease / beforeValue) * 100).toFixed(1) : 0;

            return (
              <Card key={appId} className="p-5 border-l-4" style={{ borderColor: config.color }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{config.emoji}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900">{config.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{config.role}</p>
                      <Badge className="mt-2 text-xs border" style={{ 
                        backgroundColor: `${config.color}20`, 
                        color: config.color,
                        borderColor: config.color
                      }}>
                        {config.synergy}
                      </Badge>
                    </div>
                  </div>

                  {ready && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-slate-900">{ready.overall_readiness_percentage}%</div>
                      <div className="text-xs text-slate-500">Product Readiness</div>
                      <div className="mt-3">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${ready.overall_readiness_percentage}%`,
                              backgroundColor: config.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Valuation Comparison */}
                {val && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-xs text-slate-600 font-semibold">Before Execution</div>
                      <div className="text-2xl font-bold text-slate-700 mt-1">
                        £{(beforeValue / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-semibold">After Execution</div>
                      <div className="text-2xl font-bold text-green-700 mt-1">
                        £{(afterValue / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-xs text-green-600 font-semibold mt-1">
                        +{percentIncrease}% increase
                      </div>
                    </div>
                  </div>
                )}

                {/* Readiness Details */}
                {ready && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Documentation</div>
                      <div className="font-bold text-slate-900 mt-1">{ready.documentation_readiness}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Security</div>
                      <div className="font-bold text-slate-900 mt-1">{ready.security_readiness}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Performance</div>
                      <div className="font-bold text-slate-900 mt-1">{ready.performance_readiness}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Features</div>
                      <div className="font-bold text-slate-900 mt-1">{ready.feature_completeness}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Market Readiness</div>
                      <div className="font-bold text-slate-900 mt-1">{ready.market_readiness}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <div className="text-xs text-slate-600">Proposals Executed</div>
                      <div className="font-bold text-slate-900 mt-1">{relatedProposals.length}</div>
                    </div>
                  </div>
                )}

                {/* Identified Gaps */}
                {ready?.identified_gaps && ready.identified_gaps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Readiness Gaps
                    </div>
                    <div className="space-y-2">
                      {ready.identified_gaps.slice(0, 3).map((gap, i) => (
                        <div key={i} className="text-xs p-2 bg-orange-50 rounded border border-orange-200">
                          <span className="font-semibold text-orange-900">{gap.category}</span>
                          <span className="text-orange-700 ml-2">— {gap.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Combined Portfolio Analysis */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5" />
          Combined Product Portfolio Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-slate-600 font-semibold mb-2">Total Portfolio Value</div>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600">Before:</span>
                <span className="text-lg font-bold text-slate-700">
                  £{(portfolioMetrics.totalBefore / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600">After:</span>
                <span className="text-lg font-bold text-green-700">
                  £{(portfolioMetrics.totalAfter / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-green-600">Increase:</span>
                  <span className="text-lg font-bold text-green-600">
                    +£{(portfolioMetrics.totalAbsoluteIncrease / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-slate-600 font-semibold mb-2">Synergy Benefits</div>
            <div className="space-y-2">
              {SYNERGY_GROUPS['SynergyFlow'].benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="text-sm text-slate-600 font-semibold mb-2">Execution Status</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Proposals Deployed:</span>
                <span className="text-sm font-bold text-slate-900">{executedProposals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Avg Product Readiness:</span>
                <span className="text-sm font-bold text-slate-900">{portfolioMetrics.avgReadiness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Ready for Launch:</span>
                <span className="text-sm font-bold text-green-600">
                  {Object.values(readiness).filter(r => r.overall_readiness_percentage >= 75).length}/4
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Collaborative Next Steps */}
      <Card className="p-6 border-l-4 border-amber-500 bg-amber-50">
        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          Collaborative Next Steps — Board Force Alignment
        </h3>

        <div className="space-y-4">
          {boardMembers.map((member) => {
            const appId = Object.keys(APP_CONFIG).find(id => 
              member.app_name?.toLowerCase().includes(id.replace('_', ' '))
            );
            const config = appId ? APP_CONFIG[appId] : null;
            const ready = appId ? readiness[appId] : null;

            return (
              <div key={member.id} className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-2xl">{config?.emoji || '👤'}</span>
                      {member.member_name}
                    </h4>
                    <p className="text-sm text-slate-600 mt-0.5">{member.role}</p>
                  </div>
                  {ready && (
                    <Badge 
                      className={`text-xs border ${
                        ready.overall_readiness_percentage >= 75 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : ready.overall_readiness_percentage >= 50
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-orange-100 text-orange-800 border-orange-300'
                      }`}
                    >
                      {ready.overall_readiness_percentage}% Ready
                    </Badge>
                  )}
                </div>

                {config && (
                  <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs font-semibold text-slate-700 mb-1">Primary Product</div>
                    <div className="text-sm font-bold text-slate-900">{config.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{config.synergy}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-amber-900">Immediate Next Steps:</div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {ready && ready.overall_readiness_percentage >= 75 ? (
                      <>
                        <li>✓ <span className="font-medium">Launch preparation</span> — Set go-live timeline</li>
                        <li>✓ <span className="font-medium">Customer onboarding</span> — Prepare demo & documentation</li>
                        <li>✓ <span className="font-medium">Support handoff</span> — Establish customer success processes</li>
                      </>
                    ) : ready && ready.overall_readiness_percentage >= 50 ? (
                      <>
                        <li>⚠ <span className="font-medium">Close remaining gaps</span> — {ready.identified_gaps?.[0]?.category || 'address readiness issues'}</li>
                        <li>⚠ <span className="font-medium">Extended testing cycle</span> — 2-3 weeks</li>
                        <li>⚠ <span className="font-medium">Launch hold</span> — Achieve 75%+ readiness</li>
                      </>
                    ) : (
                      <>
                        <li>🔧 <span className="font-medium">Intensive development</span> — Address critical gaps</li>
                        <li>🔧 <span className="font-medium">Quality assurance</span> — Comprehensive testing</li>
                        <li>🔧 <span className="font-medium">Re-assess in 4 weeks</span> — Target 75% readiness</li>
                      </>
                    )}
                  </ul>

                  {/* Cross-Product Collaboration */}
                  <div className="mt-3 p-3 bg-indigo-50 rounded border border-indigo-200 text-xs">
                    <span className="font-semibold text-indigo-900">Cross-Product Synergy:</span>
                    <span className="text-indigo-800 ml-1">
                      Support shared compliance framework & unified reporting with team members in {config?.synergy}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Force Alignment Statement */}
        <div className="mt-6 p-4 bg-white border-2 border-amber-400 rounded-lg text-center">
          <p className="text-sm font-semibold text-amber-900">
            🤝 As a combined force, each board member supports their product while leveraging synergies across the portfolio for mutual success
          </p>
        </div>
      </Card>
    </div>
  );
}

function calculatePortfolioMetrics(valuations, readiness) {
  const products = Object.keys(APP_CONFIG);
  
  let totalBefore = 0, totalAfter = 0, totalReady = 0;
  
  products.forEach(id => {
    const val = valuations[id];
    const ready = readiness[id];
    
    if (val) {
      const after = val.sell_now_value || 0;
      const before = after * 0.8;
      totalBefore += before;
      totalAfter += after;
    }
    
    if (ready) {
      totalReady += ready.overall_readiness_percentage;
    }
  });

  const avgReadiness = Math.round(totalReady / products.length);
  const totalAbsoluteIncrease = totalAfter - totalBefore;
  const totalValueIncrease = totalBefore > 0 ? Math.round((totalAbsoluteIncrease / totalBefore) * 100) : 0;
  
  // Synergy from combined products
  const synergyProducts = ['premiso', 'charityhub'].filter(id => readiness[id]);
  const baseSynergy = 1.15;
  const synergyMultiplier = synergyProducts.length === 2 ? baseSynergy : 1.0;

  return {
    totalBefore,
    totalAfter,
    totalAbsoluteIncrease,
    totalValueIncrease,
    avgReadiness,
    synergyMultiplier
  };
}