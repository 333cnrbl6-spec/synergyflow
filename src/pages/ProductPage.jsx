import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

const PRODUCTS = {
  'case-tracker': {
    name: 'Case Tracker Pro',
    emoji: '📋',
    tagline: 'Case management built by lawyers, for lawyers',
    heroImage: 'Case Tracker Pro',
    description: 'Less admin. More billable hours. Track cases, deadlines, and team capacity in minutes—not spreadsheets.',
    badge: 'For Solicitors & Law Firms',
    badgeBg: 'bg-blue-100 text-blue-900',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    accentColor: 'text-blue-600',
    features: [
      {
        icon: '⏰',
        title: 'Smart Deadline Tracking',
        description: 'Never miss a limitation period or court date again. Predictive warnings for compliance deadlines.'
      },
      {
        icon: '📄',
        title: 'Document Assembly',
        description: 'Auto-populate contracts and forms from case data. Saves 5+ hours per week per practitioner.'
      },
      {
        icon: '👥',
        title: 'Team Collaboration',
        description: 'Real-time case notes, task assignments, and secure client communication in one place.'
      },
      {
        icon: '📊',
        title: 'Billing Integration',
        description: 'Seamless Xero/FreshBooks sync. Automatic invoice generation from tracked hours.'
      }
    ],
    tiers: [
      {
        name: 'Solo Practitioner',
        price: '£39',
        period: '/month',
        description: 'Perfect for independent solicitors',
        features: ['Single user license', 'Up to 50 active cases', '50+ document templates', 'Basic task & deadline tracking', 'Email integration', 'Mobile app (read-only)', 'Community support'],
        popular: false
      },
      {
        name: 'Small Firm',
        price: '£99',
        period: '/month',
        description: 'Most popular – scales with your team',
        features: ['Up to 5 team members', 'Unlimited active cases', 'Advanced document automation', 'Real-time collaboration', 'Client portal (limited)', 'Time tracking & billing', 'Priority email support', 'Compliance audit trail', 'Custom workflows'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: '£299',
        period: '/month + £25/seat',
        description: 'For larger firms & legal teams',
        features: ['Unlimited team members', 'All Small Firm features', 'Full client portal', 'Custom integrations', 'Advanced analytics', 'White-label options', 'Dedicated account manager', '24/7 phone support', 'Custom SLAs'],
        popular: false
      }
    ],
    cta: 'Join 500+ UK Law Firms',
    ctaSubtitle: 'Stop losing time to spreadsheets. Start managing cases intelligently.'
  },
  'base44-ai': {
    name: 'Base44 AI',
    emoji: '🧠',
    tagline: 'AI that thinks like a lawyer',
    description: 'Review contracts. Generate memos. Analyze case law. In seconds, not hours. Fully explainable AI, built for legal professionals.',
    badge: 'AI-Powered Legal Automation',
    badgeBg: 'bg-purple-100 text-purple-900',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    accentColor: 'text-purple-600',
    features: [
      {
        icon: '🧠',
        title: 'AI That Thinks Like a Lawyer',
        description: 'Fully explainable AI. Review 100 contracts in an hour. Identifies risks, precedents, and compliance issues.'
      },
      {
        icon: '🔒',
        title: 'Legal-Grade Security',
        description: 'End-to-end encryption. ISO 27001 certified. GDPR compliant. Your data never trains our models.'
      },
      {
        icon: '📈',
        title: 'Continuous Learning',
        description: 'Weekly updates with latest case law, regulatory changes, and precedent developments.'
      },
      {
        icon: '⚡',
        title: 'Batch Automation',
        description: 'Process thousands of documents overnight. Perfect for due diligence and contract reviews.'
      }
    ],
    tiers: [
      {
        name: 'Solo Practitioner',
        price: '£49',
        period: '/month',
        description: 'Independent lawyers & barristers',
        features: ['50 AI document analyses/month', 'Contract risk flagging', 'Case summary generation', 'Basic precedent matching', 'Email support', 'Case law database (UK)', 'API access (100 calls/month)'],
        popular: false
      },
      {
        name: 'Team',
        price: '£149',
        period: '/month',
        description: 'Small firms & corporate counsel',
        features: ['Unlimited AI analyses', 'Advanced contract review', 'Litigation brief generation', 'Precedent linking (automated)', 'Priority support', 'Custom training docs', 'Batch processing', 'API access (10k calls/month)', 'Explainable AI results'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'pricing',
        description: 'Large firms & legal tech providers',
        features: ['Unlimited everything', 'White-label integration', 'Custom AI training', '24/7 dedicated support', 'Unlimited API calls', 'On-premise deployment', 'Advanced compliance', 'Custom SLAs', 'Training & onboarding'],
        popular: false
      }
    ],
    cta: 'Transform Your Legal Workflow',
    ctaSubtitle: 'AI-powered analysis. Human-grade security. Legal-first design.'
  },
  'case-narrative': {
    name: 'CaseNarrative',
    emoji: '📖',
    tagline: 'From chaotic notes to court-ready briefs',
    description: 'Generate compelling case narratives, timelines, and litigation briefs in minutes. What used to take days now takes hours.',
    badge: 'For Litigation & Barristers',
    badgeBg: 'bg-amber-100 text-amber-900',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    accentColor: 'text-amber-600',
    features: [
      {
        icon: '📖',
        title: 'Auto-Generate Case Narratives',
        description: 'From chaotic notes to chronological brief. AI creates compelling narratives that judges understand.'
      },
      {
        icon: '👁️',
        title: 'Interactive Timeline Visualization',
        description: 'See your case unfold. Visual timeline shows evidence sequence, key dates, and critical events.'
      },
      {
        icon: '🔄',
        title: 'Automated Precedent Linking',
        description: 'AI suggests relevant case law automatically. Never miss a binding precedent again.'
      },
      {
        icon: '⚡',
        title: '80% Faster Brief Writing',
        description: 'Court-ready briefs in minutes instead of days. Reduces preparation time dramatically.'
      }
    ],
    tiers: [
      {
        name: 'Solo Barrister',
        price: '£59',
        period: '/month',
        description: 'Independent practitioners',
        features: ['10 narratives/month', 'Timeline visualization', 'Brief generation', 'Precedent suggestions', 'Email support', 'Mobile case notes', 'Basic evidence tagging'],
        popular: false
      },
      {
        name: 'Law Firm',
        price: '£179',
        period: '/month',
        description: 'Litigation teams & chambers',
        features: ['Unlimited narratives', 'Interactive timeline builder', 'Court-ready brief formatting', 'Evidence document linking', 'Co-counsel collaboration', 'Precedent cross-referencing', 'Priority support', 'Advanced analytics', 'Custom templates'],
        popular: true
      },
      {
        name: 'Corporate Counsel',
        price: '£299',
        period: '/month',
        description: 'In-house legal teams',
        features: ['All Law Firm features', 'Multi-case management', 'Advanced reporting', 'Litigation support suite', 'Integration with legal systems', '24/7 dedicated support', 'Custom workflows', 'API access', 'White-label options'],
        popular: false
      }
    ],
    cta: 'Stop Writing Briefs Manually',
    ctaSubtitle: 'Get court-ready narratives in minutes. Spend more time on strategy, less time on paperwork.'
  },
  'premiso': {
    name: 'Premiso',
    emoji: '🏠',
    tagline: 'Conveyancing at lightspeed',
    description: 'Zero missed defects. Zero regulatory risk. Automated searches, chain verification, and RICS compliance built in.',
    badge: 'For Conveyancing Solicitors',
    badgeBg: 'bg-green-100 text-green-900',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    accentColor: 'text-green-600',
    features: [
      {
        icon: '🏠',
        title: 'Property Search Automation',
        description: 'Auto-pull searches from multiple providers. No more manual form filling. Save 3+ hours per transaction.'
      },
      {
        icon: '☑️',
        title: 'Chain Verification & Defect Flagging',
        description: 'Automated defect identification. Catch liens, encumbrances, and title issues instantly.'
      },
      {
        icon: '🛡️',
        title: 'RICS Compliance Automation',
        description: 'Built-in RICS checklists and compliance standards. Never miss a regulatory requirement.'
      },
      {
        icon: '⚡',
        title: 'Document Assembly Engine',
        description: 'Auto-populate contracts and completion documents from case data. Completions in minutes.'
      }
    ],
    tiers: [
      {
        name: 'Solo Conveyancer',
        price: '£69',
        period: '/month',
        description: 'Independent conveyancing practitioners',
        features: ['Up to 20 active deals', 'Automated property search', 'Chain verification', 'Basic RICS checklists', 'Email support', 'Mobile access', 'Document templates (20+)'],
        popular: false
      },
      {
        name: 'Conveyancing Firm',
        price: '£199',
        period: '/month',
        description: 'Busy property teams',
        features: ['Unlimited active deals', 'Advanced chain verification', 'RICS compliance automation', 'Automated document assembly', 'Completion milestone tracking', 'Team collaboration', 'Client portal', 'Priority support', 'Integration with Land Registry'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: '£499',
        period: '/month',
        description: 'Large firms & property teams',
        features: ['All Firm features', 'Multi-office management', 'Advanced reporting', 'Custom integrations', 'White-label options', 'Dedicated account manager', '24/7 support', 'Custom workflows', 'API access'],
        popular: false
      }
    ],
    cta: 'Join 300+ Conveyancing Firms',
    ctaSubtitle: 'Cut deal times in half. Eliminate manual work. Guarantee compliance.'
  },
  'charity-hub': {
    name: 'CharityHub',
    emoji: '❤️',
    tagline: 'Board governance and compliance, built for charities',
    description: 'By the charity sector, for the charity sector. Automate compliance. Simplify governance. Protect your mission.',
    badge: 'For Charities & Trustees',
    badgeBg: 'bg-rose-100 text-rose-900',
    buttonColor: 'bg-rose-600 hover:bg-rose-700',
    accentColor: 'text-rose-600',
    features: [
      {
        icon: '👥',
        title: 'Trustee Governance Automation',
        description: 'Board meetings, decision tracking, and trustee conflict-of-interest management all in one system.'
      },
      {
        icon: '📖',
        title: 'Charity Commission Compliance',
        description: 'Auto-complete Annual Returns and CC Form. Never miss a filing deadline or reporting requirement.'
      },
      {
        icon: '✓',
        title: 'Restricted Funds Tracking',
        description: 'Track restricted and unrestricted funds. Ensure compliance with donor restrictions and regulations.'
      },
      {
        icon: '📈',
        title: 'Audit Trail & Governance Records',
        description: 'Complete audit trail of all decisions, changes, and approvals for regulatory inspections.'
      }
    ],
    tiers: [
      {
        name: 'Small Charity',
        price: '£49',
        period: '/month',
        description: 'Charities with £100k-£1m turnover',
        features: ['Basic governance templates', 'Trustee register', 'Meeting minutes management', 'Conflict-of-interest tracking', 'Email support', 'Annual report reminders', 'Funds tracking'],
        popular: false
      },
      {
        name: 'Growing Charity',
        price: '£149',
        period: '/month',
        description: 'Charities with £1m-£10m turnover',
        features: ['Advanced governance framework', 'Board meeting automation', 'Trustee conflict resolution', 'Charity Commission auto-completion', 'Restricted funds management', 'Audit trail & compliance', 'Priority support', 'Custom workflows', 'Annual accounts integration'],
        popular: true
      },
      {
        name: 'Large Charity',
        price: '£299',
        period: '/month',
        description: 'Charities with £10m+ turnover',
        features: ['All Growing Charity features', 'Multi-organization management', 'Advanced reporting & analytics', 'Regulatory compliance suite', '24/7 dedicated support', 'Custom integrations', 'White-label options', 'API access', 'Governance best practices library'],
        popular: false
      }
    ],
    cta: 'Trusted by 800+ UK Charities',
    ctaSubtitle: 'Governance made simple. Compliance made certain. Mission protected.'
  },
  'species-explorer': {
    name: 'Species Explorer',
    emoji: '🦁',
    tagline: 'Conservation data at your fingertips',
    description: 'Science meets speed. Track species, log observations, generate impact reports. All in one platform.',
    badge: 'For Conservation & Research',
    badgeBg: 'bg-emerald-100 text-emerald-900',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    accentColor: 'text-emerald-600',
    features: [
      {
        icon: '🗄️',
        title: 'Integrated Species Database',
        description: '50,000+ species with behavior, habitat, conservation status, and habitat requirements.'
      },
      {
        icon: '📍',
        title: 'Field Observation Mapping',
        description: 'Log sightings with GPS. Build maps of species distribution. Identify conservation hotspots.'
      },
      {
        icon: '📉',
        title: 'Biodiversity Impact Assessment',
        description: 'Auto-generate environmental impact reports for regulatory compliance and project assessment.'
      },
      {
        icon: '🍃',
        title: 'Conservation Status Tracking',
        description: 'Real-time IUCN Red List integration. Track endangered species and conservation efforts.'
      }
    ],
    tiers: [
      {
        name: 'Research',
        price: '£79',
        period: '/month',
        description: 'Individual researchers & small teams',
        features: ['50,000+ species database', 'Field observation logging', 'GPS mapping', 'Mobile-first access', 'Email support', 'Basic conservation tracking', 'Export reports'],
        popular: false
      },
      {
        name: 'Organization',
        price: '£199',
        period: '/month',
        description: 'Zoos, conservation orgs, consultancies',
        features: ['Unlimited field observations', 'Biodiversity impact assessment', 'Conservation status tracking', 'IUCN Red List integration', 'Team collaboration', 'Advanced reports & analytics', 'Priority support', 'Environmental compliance docs', 'Custom species records'],
        popular: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'pricing',
        description: 'Large conservation & research networks',
        features: ['All Organization features', 'Multi-site management', 'Advanced API access', 'Custom integrations', 'White-label platform', 'Dedicated support', 'Custom training', 'Extended data retention', 'Regulatory reporting suite'],
        popular: false
      }
    ],
    cta: 'Protect What We Love',
    ctaSubtitle: 'Data-driven conservation. Impact-focused research. Species-focused science.'
  }
};

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS[slug];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Product Not Found</h1>
          <p className="text-slate-600 mb-8">We couldn't find the product you're looking for.</p>
          <Button onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{product.emoji}</div>
            <div>
              <p className="font-bold text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">{product.badge}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Portfolio</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className={`mb-4 ${product.badgeBg}`}>{product.badge}</Badge>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">{product.tagline}</h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">{product.description}</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className={`gap-2 ${product.buttonColor}`}>
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline">Watch Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {product.features.map((f, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{f.icon}</div>
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
          {product.tiers.map((tier, i) => (
            <Card key={i} className={tier.popular ? `ring-2 ring-offset-1 relative` : ''} style={tier.popular ? { ringColor: product.buttonColor.split(' ')[0].replace('bg-', '#') } : {}}>
              {tier.popular && <Badge className={`absolute -top-3 left-6 ${product.buttonColor.split(' ')[0]} text-white`}>Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-600">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className={`w-full ${product.buttonColor}`}>Get Started</Button>
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
      <section className={`${product.buttonColor.split(' ')[0]} text-white py-16`}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">{product.cta}</h2>
          <p className="text-lg mb-8 opacity-90">{product.ctaSubtitle}</p>
          <Button size="lg" variant="outline" className="bg-white hover:bg-slate-100" style={{ color: product.buttonColor.split(' ')[0].replace('bg-', '#') }}>
            Try {product.name} Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© 2026 {product.name}. Part of the SynergyFlow Portfolio.</p>
        </div>
      </footer>
    </div>
  );
}