import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Users, BarChart3, Settings, Mail, Lock, Download, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPricingComparison, setShowPricingComparison] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await base44.entities.Product.list();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
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
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">SaaS Hub</div>
          <div className="flex gap-4">
            <Link to="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
            <Button className="bg-primary hover:bg-primary/90">Contact Sales</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          All Your Software Solutions in One Place
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Powerful tools for property management, research, charity operations, and legal case management.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Request Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Products</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {product.icon_url && (
                    <img src={product.icon_url} alt={product.name} className="w-12 h-12 mb-2" />
                  )}
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  <p className="text-xs text-primary font-semibold mb-4">{product.target_market}</p>
                  {product.features && (
                    <ul className="space-y-2 mb-4">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button className="w-full" variant="outline" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-secondary/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integrated Solutions</h3>
              <p className="text-muted-foreground">All tools work seamlessly together</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
              <p className="text-muted-foreground">Track performance and growth instantly</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">Your data is safe and secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 py-16">
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
              price: '£149',
              period: '/month',
              description: 'Perfect for teams getting started',
              features: [
                'Single product access',
                'Up to 5 team members',
                'Email support',
                'Basic reporting',
                'Community forum'
              ],
              highlighted: false,
            },
            {
              name: 'Professional',
              price: '£449',
              period: '/month',
              description: 'Ideal for growing teams',
              features: [
                '2-3 product bundle',
                'Up to 25 team members',
                'Priority email support',
                'Advanced analytics',
                'API access (50K req/mo)',
                'Custom workflows',
                'Real-time collaboration'
              ],
              highlighted: true,
            },
            {
              name: 'Enterprise',
              price: '£1,299',
              period: '/month',
              description: 'Complete suite for large orgs',
              features: [
                'All 4 products included',
                'Unlimited team members',
                '24/7 support',
                'Custom dashboards',
                'Unlimited API requests',
                'Advanced security',
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
                <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
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
                      { feature: 'Products Included', starter: '1', pro: '2-3', ent: 'All 4' },
                      { feature: 'Team Members', starter: '5', pro: '25', ent: 'Unlimited' },
                      { feature: 'Real-time Collaboration', starter: '✗', pro: '✓', ent: '✓' },
                      { feature: 'Advanced Analytics', starter: '✗', pro: '✓', ent: '✓' },
                      { feature: 'API Access', starter: '✗', pro: '✓', ent: '✓' },
                      { feature: 'Custom Workflows', starter: '✗', pro: '✓', ent: '✓' },
                      { feature: '24/7 Support', starter: '✗', pro: '✗', ent: '✓' },
                      { feature: 'SLA Guarantee', starter: '✗', pro: '✗', ent: '99.9%' },
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

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join hundreds of organizations using our platform.
          </p>
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Property Management</a></li>
                <li><a href="#" className="hover:text-foreground">Research Tools</a></li>
                <li><a href="#" className="hover:text-foreground">Charity Management</a></li>
                <li><a href="#" className="hover:text-foreground">Legal Case Builder</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 SaaS Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}