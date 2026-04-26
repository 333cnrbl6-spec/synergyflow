import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Zap, Brain, Lock, TrendingUp } from 'lucide-react';

export default function Base44AI() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Solo Practitioner',
      price: '£49',
      period: '/month',
      description: 'Independent lawyers & barristers',
      features: [
        '50 AI document analyses/month',
        'Contract risk flagging',
        'Case summary generation',
        'Basic precedent matching',
        'Email support',
        'Case law database (UK)',
        'API access (100 calls/month)'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Team',
      price: '£149',
      period: '/month',
      description: 'Small firms & corporate counsel',
      features: [
        'Unlimited AI analyses',
        'Advanced contract review',
        'Litigation brief generation',
        'Precedent linking (automated)',
        'Priority support',
        'Custom training docs',
        'Batch processing',
        'API access (10k calls/month)',
        'Explainable AI results'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Large firms & legal tech providers',
      features: [
        'Unlimited everything',
        'White-label integration',
        'Custom AI training',
        '24/7 dedicated support',
        'Unlimited API calls',
        'On-premise deployment',
        'Advanced compliance',
        'Custom SLAs',
        'Training & onboarding'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      title: 'AI That Thinks Like a Lawyer',
      description: 'Fully explainable AI. Review 100 contracts in an hour. Identifies risks, precedents, and compliance issues.'
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-600" />,
      title: 'Legal-Grade Security',
      description: 'End-to-end encryption. ISO 27001 certified. GDPR compliant. Your data never trains our models.'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: 'Continuous Learning',
      description: 'Weekly updates with latest case law, regulatory changes, and precedent developments.'
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: 'Batch Automation',
      description: 'Process thousands of documents overnight. Perfect for due diligence and contract reviews.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-purple-600">🧠</div>
            <div>
              <p className="font-bold text-slate-900">Base44 AI</p>
              <p className="text-xs text-slate-500">Legal document automation</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-purple-100 text-purple-900">AI-Powered Legal Automation</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          AI that thinks like a lawyer
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Review contracts. Generate memos. Analyze case law. In seconds, not hours. Fully explainable AI, built for legal professionals.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 bg-purple-600 hover:bg-purple-700">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Powered by Legal Intelligence</h2>
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

      {/* Capabilities */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What Base44 AI Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">📄 Contract Analysis</p>
              <p className="text-slate-600 text-sm">Auto-identify risks, precedents, and compliance issues. Flag unusual terms in seconds.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">📋 Case Summaries</p>
              <p className="text-slate-600 text-sm">Generate comprehensive case summaries and litigation briefs from case files in minutes.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">🔍 Legal Research</p>
              <p className="text-slate-600 text-sm">Automated precedent matching. Find relevant case law instantly across UK case database.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Pricing for Every Practice</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">No contracts. Cancel anytime. All plans include 14-day free trial.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-purple-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-purple-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">{tier.cta}</Button>
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
      <section className="bg-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Transform Your Legal Workflow</h2>
          <p className="text-lg mb-8 opacity-90">AI-powered analysis. Human-grade security. Legal-first design.</p>
          <Button size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-slate-100">
            Try Base44 AI Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 Base44 AI. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}