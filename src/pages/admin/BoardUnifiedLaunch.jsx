import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Rocket, Users, Target, Calendar, Zap } from 'lucide-react';

export default function BoardUnifiedLaunch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfection');

  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await base44.entities.Product.list();
        setProducts(prods);
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

  // Calculate perfection score
  const perfectionScores = products.map(p => {
    const checks = [
      !!p.pricing_tiers?.length,
      !!p.description && p.description.length > 50,
      (p.features?.length || 0) >= 3,
      !!p.icon_url,
      !!p.target_market
    ];
    return {
      product: p.name,
      score: (checks.filter(Boolean).length / checks.length) * 100,
      checks
    };
  });

  const avgPerfection = Math.round(perfectionScores.reduce((sum, p) => sum + p.score, 0) / perfectionScores.length);
  const readyToLaunch = perfectionScores.filter(p => p.score === 100).length;

  const onboardingPhases = [
    {
      phase: 'Phase 1: Pre-Launch',
      duration: 'Weeks 1-2',
      color: 'from-blue-500/20 to-cyan-500/20',
      items: [
        'Admin team training on all product suites',
        'Documentation & help center setup',
        'Customer success team onboarding',
        'Launch communication templates prepared',
      ]
    },
    {
      phase: 'Phase 2: Soft Launch',
      duration: 'Week 3',
      color: 'from-purple-500/20 to-pink-500/20',
      items: [
        'Beta testing with internal team',
        'First 100 users invited to closed beta',
        'Feedback collection & final refinements',
        'Support process testing',
      ]
    },
    {
      phase: 'Phase 3: Public Launch',
      duration: 'Week 4',
      color: 'from-green-500/20 to-emerald-500/20',
      items: [
        'Public access enabled for all apps',
        'Marketing campaigns activated',
        'Social & PR rollout coordinated',
        'Live support team operational',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-base mb-4">🚀 Launch Ready</Badge>
          </div>
          <h1 className="text-5xl font-black text-slate-900">Unified Board Launch</h1>
          <p className="text-slate-600 text-lg">Polished & Perfected Apps Ready to Market</p>
        </div>

        {/* Launch Readiness Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">PERFECTION SCORE</p>
                  <p className="text-3xl font-black text-slate-900">{avgPerfection}%</p>
                  <p className="text-xs text-slate-600 mt-1">Portfolio average</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">READY TO LAUNCH</p>
                  <p className="text-3xl font-black text-green-600">{readyToLaunch}/{products.length}</p>
                  <p className="text-xs text-slate-600 mt-1">Apps perfected</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">LAUNCH DATE</p>
                  <p className="text-2xl font-black text-slate-900">April 28</p>
                  <p className="text-xs text-slate-600 mt-1">Target week</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">UNIFIED ENTITY</p>
                  <p className="text-3xl font-black text-slate-900">{products.length}</p>
                  <p className="text-xs text-slate-600 mt-1">Apps launching together</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="perfection">App Perfection</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Plan</TabsTrigger>
          </TabsList>

          {/* Perfection Checklist */}
          <TabsContent value="perfection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Product Perfection Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {perfectionScores.map((item) => (
                    <div key={item.product} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">{item.product}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-lg font-black text-blue-900">{Math.round(item.score)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {item.checks[0] ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span className={item.checks[0] ? 'text-slate-900 font-medium' : 'text-slate-600'}>Pricing Tiers Configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.checks[1] ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span className={item.checks[1] ? 'text-slate-900 font-medium' : 'text-slate-600'}>Detailed Description</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.checks[2] ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span className={item.checks[2] ? 'text-slate-900 font-medium' : 'text-slate-600'}>3+ Features Defined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.checks[3] ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span className={item.checks[3] ? 'text-slate-900 font-medium' : 'text-slate-600'}>Logo/Icon Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.checks[4] ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span className={item.checks[4] ? 'text-slate-900 font-medium' : 'text-slate-600'}>Target Market Defined</span>
                        </div>
                      </div>
                      {item.score === 100 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
                          <p className="text-green-700 text-sm font-semibold">✓ Ready to Launch</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Plan */}
          <TabsContent value="onboarding" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Unified Onboarding Program (4 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timeline */}
                <div className="space-y-4">
                  {onboardingPhases.map((phase, idx) => (
                    <div key={phase.phase} className={`bg-gradient-to-r ${phase.color} border border-white/20 rounded-lg p-5`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{phase.phase}</h3>
                          <p className="text-white/60 text-sm">{phase.duration}</p>
                        </div>
                        <Badge className="bg-white/20 text-white">Step {idx + 1}</Badge>
                      </div>
                      <ul className="space-y-2">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/90 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* User Journeys */}
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    User Onboarding Journey
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {[
                      { num: '1', title: 'Welcome', desc: 'Account creation & workspace setup' },
                      { num: '2', title: 'Discover', desc: 'Interactive product tour' },
                      { num: '3', title: 'Act', desc: 'Complete first core workflow' },
                      { num: '4', title: 'Support', desc: 'Ongoing help & community' },
                    ].map((step) => (
                      <div key={step.num} className="bg-white/10 border border-white/20 rounded-lg p-4">
                        <div className="text-3xl font-black text-blue-400 mb-2">{step.num}</div>
                        <h4 className="text-white font-semibold mb-1">{step.title}</h4>
                        <p className="text-white/60 text-sm">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Launch Success Metrics
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-white/60 text-xs uppercase mb-2">Week 1</p>
                      <p className="text-2xl font-black text-white">500+</p>
                      <p className="text-xs text-white/60">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs uppercase mb-2">Week 4</p>
                      <p className="text-2xl font-black text-white">5K+</p>
                      <p className="text-xs text-white/60">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs uppercase mb-2">Onboarding</p>
                      <p className="text-2xl font-black text-white">> 85%</p>
                      <p className="text-xs text-white/60">Complete</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xs uppercase mb-2">Support</p>
                      <p className="text-2xl font-black text-white">< 5%</p>
                      <p className="text-xs text-white/60">Help Tickets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Launch Readiness Indicator */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">🎉 Board Unified Launch Status</h3>
                <p className="text-green-700 text-sm">All {products.length} apps launching as a unified entity with coordinated strategy</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Rocket className="w-4 h-4" />
                Schedule Launch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}