import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Clock, FileText, Users, BarChart3 } from 'lucide-react';

export default function CaseTrackerPro() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Solo Practitioner',
      price: '£39',
      period: '/month',
      description: 'Perfect for independent solicitors',
      features: [
        'Single user license',
        'Up to 50 active cases',
        '50+ document templates',
        'Basic task & deadline tracking',
        'Email integration',
        'Mobile app (read-only)',
        'Community support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Small Firm',
      price: '£99',
      period: '/month',
      description: 'Most popular – scales with your team',
      features: [
        'Up to 5 team members',
        'Unlimited active cases',
        'Advanced document automation',
        'Real-time collaboration',
        'Client portal (limited)',
        'Time tracking & billing',
        'Priority email support',
        'Compliance audit trail',
        'Custom workflows'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '£299',
      period: '/month + £25/seat',
      description: 'For larger firms & legal teams',
      features: [
        'Unlimited team members',
        'All Small Firm features',
        'Full client portal',
        'Custom integrations',
        'Advanced analytics',
        'White-label options',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom SLAs'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: 'Smart Deadline Tracking',
      description: 'Never miss a limitation period or court date again. Predictive warnings for compliance deadlines.'
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: 'Document Assembly',
      description: 'Auto-populate contracts and forms from case data. Saves 5+ hours per week per practitioner.'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: 'Team Collaboration',
      description: 'Real-time case notes, task assignments, and secure client communication in one place.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: 'Billing Integration',
      description: 'Seamless Xero/FreshBooks sync. Automatic invoice generation from tracked hours.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">📋</div>
            <div>
              <p className="font-bold text-slate-900">Case Tracker Pro</p>
              <p className="text-xs text-slate-500">Legal case management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-900">For Solicitors & Law Firms</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Case management built by lawyers, for lawyers
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Less admin. More billable hours. Track cases, deadlines, and team capacity in minutes—not spreadsheets.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Designed for Legal Practice</h2>
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

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Simple, Transparent Pricing</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">20% discount on annual billing</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-blue-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-blue-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full">{tier.cta}</Button>
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
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Join 500+ UK Law Firms</h2>
          <p className="text-lg mb-8 opacity-90">Stop losing time to spreadsheets. Start managing cases intelligently.</p>
          <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-slate-100">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 Case Tracker Pro. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}