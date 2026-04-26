import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Database, MapPin, TrendingDown, Leaf } from 'lucide-react';

export default function SpeciesExplorer() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Research',
      price: '£79',
      period: '/month',
      description: 'Individual researchers & small teams',
      features: [
        '50,000+ species database',
        'Field observation logging',
        'GPS mapping',
        'Mobile-first access',
        'Email support',
        'Basic conservation tracking',
        'Export reports'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Organization',
      price: '£199',
      period: '/month',
      description: 'Zoos, conservation orgs, consultancies',
      features: [
        'Unlimited field observations',
        'Biodiversity impact assessment',
        'Conservation status tracking',
        'IUCN Red List integration',
        'Team collaboration',
        'Advanced reports & analytics',
        'Priority support',
        'Environmental compliance docs',
        'Custom species records'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Large conservation & research networks',
      features: [
        'All Organization features',
        'Multi-site management',
        'Advanced API access',
        'Custom integrations',
        'White-label platform',
        'Dedicated support',
        'Custom training',
        'Extended data retention',
        'Regulatory reporting suite'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: <Database className="w-6 h-6 text-emerald-600" />,
      title: 'Integrated Species Database',
      description: '50,000+ species with behavior, habitat, conservation status, and habitat requirements.'
    },
    {
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      title: 'Field Observation Mapping',
      description: 'Log sightings with GPS. Build maps of species distribution. Identify conservation hotspots.'
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-emerald-600" />,
      title: 'Biodiversity Impact Assessment',
      description: 'Auto-generate environmental impact reports for regulatory compliance and project assessment.'
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-600" />,
      title: 'Conservation Status Tracking',
      description: 'Real-time IUCN Red List integration. Track endangered species and conservation efforts.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-emerald-600">🦁</div>
            <div>
              <p className="font-bold text-slate-900">Species Explorer</p>
              <p className="text-xs text-slate-500">Biodiversity research platform</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4 bg-emerald-100 text-emerald-900">For Conservation & Research</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Conservation data at your fingertips
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Science meets speed. Track species, log observations, generate impact reports. All in one platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Biodiversity Research Simplified</h2>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Who Uses Species Explorer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">🏞️ Conservation Orgs</p>
              <p className="text-slate-600 text-sm">Track endangered species, habitat restoration, and population trends. Document impact.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">🦓 Zoos & Wildlife</p>
              <p className="text-slate-600 text-sm">Manage animal records, breeding programs, and conservation breeding initiatives.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">📊 Environmental Consultants</p>
              <p className="text-slate-600 text-sm">Generate impact assessments, environmental compliance reports, and biodiversity surveys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg border border-emerald-200">
            <p className="text-5xl font-bold text-emerald-600 mb-2">50,000+</p>
            <p className="font-semibold text-slate-900">Species in Database</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg border border-emerald-200">
            <p className="text-5xl font-bold text-emerald-600 mb-2">75%</p>
            <p className="font-semibold text-slate-900">Faster Data Entry</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg border border-emerald-200">
            <p className="text-5xl font-bold text-emerald-600 mb-2">100+</p>
            <p className="font-semibold text-slate-900">Countries Using</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Pricing for Conservation</h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">20% discount on annual billing. Nonprofit discounts available.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? 'ring-2 ring-emerald-600 relative' : ''}>
              {tier.popular && <Badge className="absolute -top-3 left-6 bg-emerald-600">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">{tier.cta}</Button>
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
      <section className="bg-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Protect What We Love</h2>
          <p className="text-lg mb-8 opacity-90">Data-driven conservation. Impact-focused research. Species-focused science.</p>
          <Button size="lg" variant="outline" className="bg-white text-emerald-600 hover:bg-slate-100">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 Species Explorer. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}