import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Package, Key, FileText, Zap, Users, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

const PRODUCTS_META = {
  'Premiso': {
    emoji: '🛠️',
    tagline: 'No-code AI App Builder Platform',
    vertical: 'Dev Tools / SaaS',
    buildCostAvoided: '£400k–£800k',
    assetPrice: '£150k–£350k',
    timeToMarket: '12–18 months saved',
    buyerProfile: 'Tech entrepreneur, agency, or platform acquirer',
  },
  'Species Explorer': {
    emoji: '⚙️',
    tagline: 'AI Workflow & Operations Automation',
    vertical: 'B2B SaaS / Operations',
    buildCostAvoided: '£200k–£500k',
    assetPrice: '£100k–£250k',
    timeToMarket: '9–15 months saved',
    buyerProfile: 'Operations SaaS company or PE-backed rollup',
  },
  'Age UK Bury': {
    emoji: '⚖️',
    tagline: 'AI Legal Case Management',
    vertical: 'Legal Tech',
    buildCostAvoided: '£300k–£700k',
    assetPrice: '£125k–£300k',
    timeToMarket: '12–18 months saved',
    buyerProfile: 'Legal tech firm, law firm group, or PE investor',
  },
  'CaseNarrative': {
    emoji: '🏠',
    tagline: 'Property Management Platform',
    vertical: 'PropTech',
    buildCostAvoided: '£200k–£450k',
    assetPrice: '£75k–£200k',
    timeToMarket: '9–12 months saved',
    buyerProfile: 'PropTech company, letting agency group, or investor',
  },
};

const INCLUDED_ITEMS = [
  { icon: <Package className="w-4 h-4" />, label: 'Full source code & deployment', status: 'complete' },
  { icon: <Users className="w-4 h-4" />, label: 'Auth & user management system', status: 'complete' },
  { icon: <Zap className="w-4 h-4" />, label: 'Stripe payment integration (wired)', status: 'complete' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'Pricing tiers & subscription logic', status: 'complete' },
  { icon: <FileText className="w-4 h-4" />, label: 'Board-approved strategic roadmap', status: 'complete' },
  { icon: <FileText className="w-4 h-4" />, label: 'Target market & ICP definition', status: 'complete' },
  { icon: <Package className="w-4 h-4" />, label: 'Admin dashboard & CRM', status: 'complete' },
  { icon: <Package className="w-4 h-4" />, label: 'AI integrations & backend functions', status: 'complete' },
];

const BUYER_SETUP_ITEMS = [
  { icon: <Key className="w-4 h-4" />, label: 'Stripe API keys (live)', note: 'Buyer provides their own Stripe account' },
  { icon: <Key className="w-4 h-4" />, label: 'Custom domain configuration', note: 'Point DNS to deployment' },
  { icon: <Key className="w-4 h-4" />, label: 'Email provider (SendGrid / Resend)', note: 'For transactional emails' },
  { icon: <Key className="w-4 h-4" />, label: 'Hosting / deployment platform', note: 'Vercel, AWS, or Base44 hosting' },
];

function StatusBadge({ status }) {
  if (status === 'complete') return <span className="text-green-600"><CheckCircle2 className="w-4 h-4" /></span>;
  if (status === 'partial') return <span className="text-amber-500"><AlertCircle className="w-4 h-4" /></span>;
  return <span className="text-slate-400"><XCircle className="w-4 h-4" /></span>;
}

function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  const meta = PRODUCTS_META[product.name] || {};
  const tiers = product.pricing_tiers || [];
  const minPrice = tiers.length ? Math.min(...tiers.map(t => t.price)) : 0;
  const maxPrice = tiers.length ? Math.max(...tiers.map(t => t.price)) : 0;

  return (
    <Card className="border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <h3 className="text-lg font-black">{product.name}</h3>
                <p className="text-slate-300 text-xs">{meta.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-blue-600 text-white text-xs">{meta.vertical}</Badge>
              <Badge className="bg-slate-600 text-slate-100 text-xs">{product.target_market?.split(',')[0]}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Asset Sale Price</p>
            <p className="text-xl font-black text-green-400">{meta.assetPrice}</p>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500">Pricing Range</p>
          <p className="text-sm font-bold text-slate-900">£{minPrice}–£{maxPrice}<span className="text-xs font-normal text-slate-500">/mo</span></p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500">Build Cost Avoided</p>
          <p className="text-sm font-bold text-emerald-700">{meta.buildCostAvoided}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500">Time-to-Market</p>
          <p className="text-sm font-bold text-blue-700">{meta.timeToMarket}</p>
        </div>
      </div>

      {/* Buyer profile */}
      <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Users className="w-3 h-3 text-amber-700" />
        <p className="text-xs text-amber-800"><span className="font-semibold">Ideal buyer:</span> {meta.buyerProfile}</p>
      </div>

      {/* What's included */}
      <div className="p-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-800 mb-3"
        >
          <span>📦 What's Included in the Sale</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="space-y-4">
            <div className="space-y-2">
              {INCLUDED_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <StatusBadge status={item.status} />
                  <span className="text-slate-700 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Core Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.features.map((f, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing tiers */}
            {tiers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Pricing Tiers (Pre-configured)</p>
                <div className="grid grid-cols-3 gap-2">
                  {tiers.map((t, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-2 text-center">
                      <p className="text-xs font-semibold text-slate-700">{t.name}</p>
                      <p className="text-sm font-black text-slate-900">£{t.price}<span className="text-xs font-normal text-slate-500">/mo</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer setup */}
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">🔑 Buyer Configures Post-Sale</p>
              <div className="space-y-1.5">
                {BUYER_SETUP_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm bg-amber-50 rounded-lg px-3 py-2">
                    <span className="text-amber-600 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-amber-900 font-semibold text-xs">{item.label}</p>
                      <p className="text-amber-700 text-xs">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!expanded && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />{INCLUDED_ITEMS.length} items included</span>
            <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" />{BUYER_SETUP_ITEMS.length} buyer-configured</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3 text-blue-500" />{product.features?.length || 0} features</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function BuyerHandoverPack() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.list().then(p => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center p-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const totalMin = products.reduce((sum, p) => {
    const meta = PRODUCTS_META[p.name];
    if (!meta) return sum;
    return sum + parseInt(meta.assetPrice.replace(/[^0-9]/g, '').slice(0, 3)) * 1000;
  }, 0);

  const totalMax = products.reduce((sum, p) => {
    const meta = PRODUCTS_META[p.name];
    if (!meta) return sum;
    const nums = meta.assetPrice.match(/\d+/g);
    return sum + parseInt(nums[nums.length - 1]) * 1000;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Confidential — Board Use Only</p>
            <h1 className="text-3xl font-black mb-2">Buyer Handover Pack</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Per-product acquisition overview. Each product is a fully built, deployment-ready SaaS asset.
              Stripe and payment infrastructure is wired — buyers configure their own API keys post-sale.
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">Combined Portfolio Value</p>
            <p className="text-3xl font-black text-green-400">
              £{Math.round(totalMin / 1000)}k–£{Math.round(totalMax / 1000)}k
            </p>
            <p className="text-slate-400 text-xs mt-1">asset sale (no MRR required)</p>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div>
            <p className="text-slate-400 text-xs">Products</p>
            <p className="text-2xl font-black">{products.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Payment Infrastructure</p>
            <p className="text-lg font-bold text-green-400">Stripe ✓</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Buyer Setup Required</p>
            <p className="text-lg font-bold text-amber-400">API Keys Only</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Time-to-Revenue (Buyer)</p>
            <p className="text-lg font-bold text-blue-400">Days, not months</p>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Footer note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Note:</span> All products include full source code, deployment infrastructure, and strategic documentation. 
          Stripe integration is architecturally complete — no development work required by the buyer. 
          Price estimates reflect asset value, not revenue multiples.
        </p>
      </div>
    </div>
  );
}