import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Users, BarChart3, Settings, Mail, Lock, Download, X, Play, Zap, Globe, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LandingTour from '@/components/LandingTour';

const PRODUCT_CARDS = [
  { slug: 'case-tracker', name: 'Case Tracker Pro', emoji: '📋', color: 'blue', market: 'Solicitors & Law Firms' },
  { slug: 'base44-ai', name: 'Base44 AI', emoji: '🧠', color: 'purple', market: 'Legal Automation' },
  { slug: 'case-narrative', name: 'CaseNarrative', emoji: '📖', color: 'amber', market: 'Litigation Briefs' },
  { slug: 'premiso', name: 'Premiso', emoji: '🏠', color: 'green', market: 'Conveyancing' },
  { slug: 'charity-hub', name: 'CharityHub', emoji: '❤️', color: 'rose', market: 'Charity Governance' },
  { slug: 'species-explorer', name: 'Species Explorer', emoji: '🦁', color: 'emerald', market: 'Conservation' }
];

export default function Landing() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPricingComparison, setShowPricingComparison] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const generatePricingPDF = async () => {
    setGeneratingPDF(true);
    try {
      const response = await base44.functions.invoke('generatePricingPDF', {
        portfolio_name: 'SynergyFlow Suite'
      });
      
      // Create and download HTML
      const html = response.data.html;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      
      // For PDF, we'll create a printable HTML that users can save as PDF
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'SynergyFlow_Pricing.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Pricing document ready - open in browser and print to PDF');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate pricing document');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-900">SynergyFlow</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setTourStep(0)}>Take Tour</Button>
            <Link to="/admin">
              <Button variant="outline" size="sm">Admin</Button>
            </Link>
            <Button onClick={() => navigate('/onboarding')} className="bg-slate-900 hover:bg-slate-800" size="sm">Sign Up</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-slate-700/50 rounded-full text-sm font-semibold">
            🚀 6 Industry-Specific SaaS Products in One Platform
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Your Industry's Complete Software Suite
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            From legal case management to conservation research. Choose the products you need, add more as you grow. All powered by SynergyFlow's unified intelligence backbone.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-slate-900 hover:bg-slate-100 font-semibold">
              Explore All Products
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => setTourStep(0)}>
              <Play className="w-4 h-4 mr-2" /> Take a Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Products Showcase Grid */}
      <section id="products-section" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-4 text-center">Six Powerful Products</h2>
        <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
          Each built for a specific industry. Each packed with specialized features. All working together seamlessly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCT_CARDS.map((prod) => (
            <Card key={prod.slug} className="hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer overflow-hidden group" onClick={() => navigate(`/products/${prod.slug}`)}>
              <div className={`h-1 bg-gradient-to-r from-${prod.color}-400 to-${prod.color}-600`} />
              <CardHeader>
                <div className="text-5xl mb-3">{prod.emoji}</div>
                <CardTitle className="text-xl group-hover:text-slate-900">{prod.name}</CardTitle>
                <p className="text-sm text-slate-600 mt-2">{prod.market}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 line-clamp-2">Industry-specific features designed for maximum impact and ease of use.</p>
                  <Button variant="outline" className="w-full group-hover:bg-slate-50">
                    Explore <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section id="value-props-section" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Why SynergyFlow Wins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Industry-Specific Design</h3>
                <p className="text-slate-600">Each product is purpose-built for its industry—no compromises, no bloat.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Scale As You Grow</h3>
                <p className="text-slate-600">Start with one product. Add more as your business evolves. Pay only for what you use.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Unified Data Intelligence</h3>
                <p className="text-slate-600">All products share a unified analytics backend—see the bigger picture instantly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Enterprise-Grade Security</h3>
                <p className="text-slate-600">ISO 27001 certified. GDPR compliant. Your data, completely protected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing-section" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Transparent, Flexible Pricing</h2>
          <Button onClick={generatePricingPDF} disabled={generatingPDF} className="gap-2" variant="outline">
            <Download className="w-4 h-4" />
            {generatingPDF ? 'Generating...' : 'Download Pricing PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {[
            {
              name: 'Starter',
              price: '£49',
              period: '/month/per user',
              description: 'Perfect for getting started',
              features: [
                'Single product access',
                'Basic features only',
                'Email support',
                'Community forum',
                'Standard storage'
              ],
              highlighted: false,
            },
            {
              name: 'Professional',
              price: '£99-£199',
              period: '/month',
              description: 'Most popular – scale with your business',
              features: [
                'Full product features',
                'Up to 5-20 properties/resources',
                'Team collaboration',
                'Priority email support',
                'Advanced analytics',
                'Custom workflows',
                'API access',
                'Compliance automation'
              ],
              highlighted: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'pricing',
              description: 'Complete solution for large organizations',
              features: [
                'All features included',
                'Unlimited resources',
                'Multi-user access',
                '24/7 phone support',
                'Custom dashboards',
                'Unlimited API calls',
                'Dedicated account manager',
                '99.9% SLA guarantee'
              ],
              highlighted: false,
            },
          ].map((plan, idx) => (
            <Card key={idx} className={plan.highlighted ? 'border-blue-600 border-2 relative shadow-xl' : 'border'}>
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                <div className="text-4xl font-bold mt-4">{plan.price}</div>
                <div className="text-muted-foreground text-sm">{plan.period}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 mb-6">
                   {plan.features.map((feature, fidx) => (
                     <li key={fidx} className="flex items-start gap-2 text-sm">
                       <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                       <span>{feature}</span>
                     </li>
                   ))}
                 </ul>
                 <Button onClick={() => navigate('/onboarding')} className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                   Get Started
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Competitive Advantages */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Why SynergyFlow Stands Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                '✦ Unified platform: All tools work seamlessly together',
                '✦ Real-time synergy: Data flows between products automatically',
                '✦ Integrated analytics: Single dashboard for all metrics',
                '✦ Lower TCO: Bundle savings vs. buying separately',
                '✦ Enterprise security: SOC 2 Type II certified',
                '✦ Expert onboarding: Dedicated setup support'
              ].map((adv, i) => (
                <div key={i} className="text-sm text-slate-700 p-3 bg-white rounded border border-blue-100">
                  {adv}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison Table */}
        <Button onClick={() => setShowPricingComparison(!showPricingComparison)} variant="outline" className="mb-4 gap-2">
          {showPricingComparison ? <X className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          {showPricingComparison ? 'Hide' : 'Show'} Detailed Comparison
        </Button>

        {showPricingComparison && (
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold">Starter</th>
                      <th className="text-center py-3 px-4 font-semibold">Professional</th>
                      <th className="text-center py-3 px-4 font-semibold">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                       { feature: 'Full Feature Access', starter: 'Limited', pro: 'Full', ent: 'Full' },
                       { feature: 'Team Members', starter: '1', pro: '2-5', ent: 'Unlimited' },
                       { feature: 'Automation & Workflows', starter: 'Basic', pro: 'Advanced', ent: 'Unlimited' },
                       { feature: 'Advanced Analytics', starter: '✗', pro: '✓', ent: '✓' },
                       { feature: 'API Access', starter: '✗', pro: '✓', ent: '✓' },
                       { feature: 'Custom Integrations', starter: '✗', pro: 'Limited', ent: 'Yes' },
                       { feature: 'Support Level', starter: 'Email', pro: 'Priority Email', ent: '24/7 Phone' },
                       { feature: 'SLA Guarantee', starter: 'None', pro: 'None', ent: '99.9%' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{row.feature}</td>
                        <td className="py-3 px-4 text-center">{row.starter}</td>
                        <td className="py-3 px-4 text-center">{row.pro}</td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600">{row.ent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Social Proof */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-lg font-semibold text-slate-600 mb-8">Trusted by leading organizations worldwide</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {['TechCorp', 'LegalPlus', 'ConserveLabs', 'CharityNet', 'PropViz', 'ScienceHub'].map((org) => (
              <div key={org} className="font-semibold text-slate-400">{org}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="final-cta-section" className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Industry?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Join companies already using SynergyFlow to streamline operations and scale faster.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate('/onboarding')} size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold">
              Start Free Trial Now
            </Button>
            <Button onClick={() => setTourStep(0)} size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-6">No credit card required. 14-day free trial on all plans.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                {PRODUCT_CARDS.map((p) => (
                  <li key={p.slug}><button onClick={() => navigate(`/products/${p.slug}`)} className="hover:text-white">{p.name}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Docs</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SynergyFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Tour Modal */}
      {tourStep >= 0 && (
        <LandingTour
          currentStep={tourStep}
          onClose={() => setTourStep(-1)}
          onNext={() => setTourStep(tourStep + 1)}
          onPrev={() => setTourStep(tourStep - 1)}
        />
      )}
    </div>
  );
}