import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Home, CheckSquare, Shield, Zap } from 'lucide-react';

export default function Premiso() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Solo Conveyancer',
      price: '£69',
      period: '/month',
      description: 'Independent conveyancing practitioners',
      features: [
        'Up to 20 active deals',
        'Automated property search',
        'Chain verification',
        'Basic RICS checklists',
        'Email support',
        'Mobile access',
        'Document templates (20+)'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Conveyancing Firm',
      price: '£199',
      period: '/month',
      description: 'Busy property teams',
      features: [
        'Unlimited active deals',
        'Advanced chain verification',
        'RICS compliance automation',
        'Automated document assembly',
        'Completion milestone tracking',
        'Team collaboration',
        'Client portal',
        'Priority support',
        'Integration with Land Registry'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '£499',
      period: '/month',
      description: 'Large firms & property teams',
      features: [
        'All Firm features',
        'Multi-office management',
        'Advanced reporting',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        '24/7 support',
        'Custom workflows',
        'API access'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <Home className="w-6 h-6 text-green-600" />,
      title: 'Property Search Automation',
      description: 'Auto-pull searches from multiple providers. No more manual form filling. Save 3+ hours per transaction.'
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-green-600" />,
      title: 'Chain Verification & Defect Flagging',
      description: 'Automated defect identification. Catch liens, encumbrances, and title issues instantly.'
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: 'RICS Compliance Automation',
      description: 'Built-in RICS checklists and compliance standards. Never miss a regulatory requirement.'
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600" />,
      title: 'Document Assembly Engine',
      description: 'Auto-populate contracts and completion documents from case data. Completions in minutes.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-green-600">🏠</div>
            <div>
              <p className="font-bold text-slate-900">Premiso</p>
              <p className="text-xs text-slate-500">Conveyancing intelligence</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-green-100 text-green-900">For Conveyancing Solicitors</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Conveyancing at lightspeed
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Zero missed defects. Zero regulatory risk. Automated searches, chain verification, and RICS compliance built in.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 bg-green-600 hover:bg-green-700">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Purpose-Built for Property Law</h2>
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

      {/* Benefits */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Property Teams Choose Premiso</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-4xl font-bold text-green-600 mb-2">90%</p>
              <p className="font-semibold text-slate-900 mb-2">Fewer Defects Missed</p>
              <p className="text-sm text-slate-600">Automated flagging catches issues that manual review misses.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-4xl font-bold text-green-600 mb-2">3hrs</p>
              <p className="font-semibold text-slate-900 mb-2">Saved Per Deal</p>
              <p className="text-sm text-slate-600">Automated searches and document assembly eliminate repetitive work.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
              <p className="font-semibold text-slate-900 mb-2">RICS Compliant</p>
              <p className="text-sm text-slate-600">Built-in compliance ensures every deal meets regulatory standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Simple Pricing</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">20% discount on annual billing. No setup fees.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-green-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-green-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full bg-green-600 hover:bg-green-700">{tier.cta}</Button>
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
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Join 300+ Conveyancing Firms</h2>
          <p className="text-lg mb-8 opacity-90">Cut deal times in half. Eliminate manual work. Guarantee compliance.</p>
          <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-slate-100">
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 Premiso. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}