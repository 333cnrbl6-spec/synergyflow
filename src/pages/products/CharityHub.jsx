import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

export default function CharityHub() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Small Charity',
      price: '£49',
      period: '/month',
      description: 'Charities with £100k-£1m turnover',
      features: [
        'Basic governance templates',
        'Trustee register',
        'Meeting minutes management',
        'Conflict-of-interest tracking',
        'Email support',
        'Annual report reminders',
        'Funds tracking'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Growing Charity',
      price: '£149',
      period: '/month',
      description: 'Charities with £1m-£10m turnover',
      features: [
        'Advanced governance framework',
        'Board meeting automation',
        'Trustee conflict resolution',
        'Charity Commission auto-completion',
        'Restricted funds management',
        'Audit trail & compliance',
        'Priority support',
        'Custom workflows',
        'Annual accounts integration'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Large Charity',
      price: '£299',
      period: '/month',
      description: 'Charities with £10m+ turnover',
      features: [
        'All Growing Charity features',
        'Multi-organization management',
        'Advanced reporting & analytics',
        'Regulatory compliance suite',
        '24/7 dedicated support',
        'Custom integrations',
        'White-label options',
        'API access',
        'Governance best practices library'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6 text-rose-600" />,
      title: 'Trustee Governance Automation',
      description: 'Board meetings, decision tracking, and trustee conflict-of-interest management all in one system.'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-rose-600" />,
      title: 'Charity Commission Compliance',
      description: 'Auto-complete Annual Returns and CC Form. Never miss a filing deadline or reporting requirement.'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-rose-600" />,
      title: 'Restricted Funds Tracking',
      description: 'Track restricted and unrestricted funds. Ensure compliance with donor restrictions and regulations.'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-rose-600" />,
      title: 'Audit Trail & Governance Records',
      description: 'Complete audit trail of all decisions, changes, and approvals for regulatory inspections.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-rose-600">❤️</div>
            <div>
              <p className="font-bold text-slate-900">CharityHub</p>
              <p className="text-xs text-slate-500">Governance & compliance</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-rose-100 text-rose-900">For Charities & Trustees</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Board governance and compliance, built for charities
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          By the charity sector, for the charity sector. Automate compliance. Simplify governance. Protect your mission.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 bg-rose-600 hover:bg-rose-700">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Designed by Charity Leaders</h2>
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

      {/* Use Cases */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What CharityHub Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">🏛️ Governance Framework</p>
              <p className="text-slate-600 text-sm">Trustee register, meeting minutes, board resolutions, and conflict-of-interest tracking.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">📋 Charity Commission Forms</p>
              <p className="text-slate-600 text-sm">Auto-populate Annual Returns and CC Forms. No more manual paperwork.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">💰 Funds Management</p>
              <p className="text-slate-600 text-sm">Track restricted/unrestricted funds, donor requirements, and accounting compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Pricing for Every Charity Size</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">Transparent pricing. No hidden costs. All plans include support.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-rose-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-rose-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">{tier.cta}</Button>
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
      <section className="bg-rose-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Trusted by 800+ UK Charities</h2>
          <p className="text-lg mb-8 opacity-90">Governance made simple. Compliance made certain. Mission protected.</p>
          <Button size="lg" variant="outline" className="bg-white text-rose-600 hover:bg-slate-100">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 CharityHub. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}