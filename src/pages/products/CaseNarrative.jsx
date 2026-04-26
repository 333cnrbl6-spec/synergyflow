import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, BookOpen, GitCompare, Zap, Eye } from 'lucide-react';

export default function CaseNarrative() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Solo Barrister',
      price: '£59',
      period: '/month',
      description: 'Independent practitioners',
      features: [
        '10 narratives/month',
        'Timeline visualization',
        'Brief generation',
        'Precedent suggestions',
        'Email support',
        'Mobile case notes',
        'Basic evidence tagging'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Law Firm',
      price: '£179',
      period: '/month',
      description: 'Litigation teams & chambers',
      features: [
        'Unlimited narratives',
        'Interactive timeline builder',
        'Court-ready brief formatting',
        'Evidence document linking',
        'Co-counsel collaboration',
        'Precedent cross-referencing',
        'Priority support',
        'Advanced analytics',
        'Custom templates'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Corporate Counsel',
      price: '£299',
      period: '/month',
      description: 'In-house legal teams',
      features: [
        'All Law Firm features',
        'Multi-case management',
        'Advanced reporting',
        'Litigation support suite',
        'Integration with legal systems',
        '24/7 dedicated support',
        'Custom workflows',
        'API access',
        'White-label options'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-amber-600" />,
      title: 'Auto-Generate Case Narratives',
      description: 'From chaotic notes to chronological brief. AI creates compelling narratives that judges understand.'
    },
    {
      icon: <Eye className="w-6 h-6 text-amber-600" />,
      title: 'Interactive Timeline Visualization',
      description: 'See your case unfold. Visual timeline shows evidence sequence, key dates, and critical events.'
    },
    {
      icon: <GitCompare className="w-6 h-6 text-amber-600" />,
      title: 'Automated Precedent Linking',
      description: 'AI suggests relevant case law automatically. Never miss a binding precedent again.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      title: '80% Faster Brief Writing',
      description: 'Court-ready briefs in minutes instead of days. Reduces preparation time dramatically.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-amber-600">📖</div>
            <div>
              <p className="font-bold text-slate-900">CaseNarrative</p>
              <p className="text-xs text-slate-500">Litigation brief generation</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-amber-100 text-amber-900">For Litigation & Barristers</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          From chaotic notes to court-ready briefs
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Generate compelling case narratives, timelines, and litigation briefs in minutes. What used to take days now takes hours.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 bg-amber-600 hover:bg-amber-700">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Built for Litigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-amber-600 mb-2">1</div>
              <p className="font-semibold text-slate-900 mb-2">Upload Case Notes</p>
              <p className="text-sm text-slate-600">Drag & drop files or copy-paste notes</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-amber-600 mb-2">2</div>
              <p className="font-semibold text-slate-900 mb-2">AI Analyzes</p>
              <p className="text-sm text-slate-600">Extract timeline, evidence, key facts</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-amber-600 mb-2">3</div>
              <p className="font-semibold text-slate-900 mb-2">Generate Narrative</p>
              <p className="text-sm text-slate-600">Compelling, chronological brief ready</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="text-3xl font-bold text-amber-600 mb-2">4</div>
              <p className="font-semibold text-slate-900 mb-2">Court Ready</p>
              <p className="text-sm text-slate-600">Edit, format, and file immediately</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Transparent Pricing</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">Choose your plan. No hidden fees. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-amber-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-amber-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">{tier.cta}</Button>
                <div className="space-y-3">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Stop Writing Briefs Manually</h2>
          <p className="text-lg mb-8 opacity-90">Get court-ready narratives in minutes. Spend more time on strategy, less time on paperwork.</p>
          <Button size="lg" variant="outline" className="bg-white text-amber-600 hover:bg-slate-100">
            Try CaseNarrative Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 CaseNarrative. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}