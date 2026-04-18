import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Shield, TrendingUp, Zap, Users, Lock, DollarSign, Star, AlertTriangle } from 'lucide-react';

const PRODUCTS = [
  {
    name: 'Premiso',
    sector: 'Property Management',
    description: 'End-to-end property portfolio management for landlords, letting agents and estate managers.',
    targetMarket: 'UK property professionals — 2.65M private landlords, 15,000+ letting agencies',
    monthlyPrice: 49,
    annualPrice: 490,
    buildCostAvoided: 85000,
    assetValue: 120000,
    withRevenueValue: 450000,
  },
  {
    name: 'Species Explorer',
    sector: 'Conservation & Research',
    description: 'Species data management and field research platform for wildlife professionals and conservation bodies.',
    targetMarket: 'UK conservation organisations, zoos, universities, environmental consultancies',
    monthlyPrice: 39,
    annualPrice: 390,
    buildCostAvoided: 70000,
    assetValue: 95000,
    withRevenueValue: 320000,
  },
  {
    name: 'CharityHub',
    sector: 'Third Sector / Charity',
    description: 'Operational management platform for small-to-medium charities — volunteers, donors, campaigns and compliance.',
    targetMarket: '168,000 registered charities in England & Wales, majority without dedicated software',
    monthlyPrice: 29,
    annualPrice: 290,
    buildCostAvoided: 65000,
    assetValue: 85000,
    withRevenueValue: 280000,
  },
  {
    name: 'CaseNarrative',
    sector: 'Legal / Professional Services',
    description: 'AI-assisted case documentation and narrative building for legal practitioners and claims professionals.',
    targetMarket: 'Solicitors, paralegals, insurance claims teams — 200,000+ legal professionals in UK',
    monthlyPrice: 59,
    annualPrice: 590,
    buildCostAvoided: 95000,
    assetValue: 150000,
    withRevenueValue: 580000,
  },
];

const TOTAL_BUILD_AVOIDED = PRODUCTS.reduce((s, p) => s + p.buildCostAvoided, 0);
const TOTAL_ASSET_VALUE = PRODUCTS.reduce((s, p) => s + p.assetValue, 0);
const TOTAL_WITH_REVENUE = PRODUCTS.reduce((s, p) => s + p.withRevenueValue, 0);

const SCENARIOS = [
  {
    id: 'outright',
    label: 'Scenario A — Outright Sale',
    emoji: '💰',
    color: 'blue',
    headline: 'Full asset transfer. Buyer acquires all products, methodology rights, and IP.',
    sellerGets: {
      cash: TOTAL_ASSET_VALUE,
      equity: 0,
      ongoing: 0,
      notes: 'Clean exit. Seller retains no stake or obligation post-completion.',
    },
    buyerGets: {
      description: 'Full ownership of 4 production-ready vertical SaaS products, the proprietary rapid-build methodology, all source code, brand assets, and future revenue rights.',
      immediateValue: TOTAL_BUILD_AVOIDED,
      potentialValue: TOTAL_WITH_REVENUE * 3,
      roi: '8–12x on acquisition cost within 36 months if products are commercialised',
    },
    bestSuited: ['Private Equity (buy-and-build mandate)', 'Strategic acquirer adding vertical SaaS to portfolio', 'SaaS portfolio aggregator (e.g. Tiny Capital, SaaS Group)'],
    risk: 'Seller receives lowest total upside. Suitable if immediate liquidity is the priority.',
  },
  {
    id: 'partnership',
    label: 'Scenario B — Strategic Partnership / IP JV',
    emoji: '🤝',
    color: 'green',
    headline: 'Partner provides IP protection, legal structure & commercialisation capital. Seller retains equity stake.',
    sellerGets: {
      cash: 75000,
      equity: 40,
      ongoing: '% of revenue share for 36 months',
      notes: '£75k immediate consideration + 40% equity in newly formed IP-holding vehicle + revenue participation.',
    },
    buyerGets: {
      description: '60% equity in IP vehicle, exclusive commercialisation rights across all products, ability to license the methodology to third parties, and first option to acquire remaining 40% at agreed multiple.',
      immediateValue: TOTAL_ASSET_VALUE * 0.6,
      potentialValue: TOTAL_WITH_REVENUE * 2,
      roi: '5–8x on deployed capital within 24 months at modest commercialisation',
    },
    bestSuited: ['Technology-focused law firm with investment arm', 'IP licensing specialist', 'Scale-up accelerator with legal and commercial infrastructure', 'VC-backed SaaS operator seeking proprietary pipeline'],
    risk: 'Seller retains upside but remains involved. Requires trust in partner\'s commercialisation capability.',
  },
];

const LIKELY_BUYERS = [
  {
    name: 'SaaS Group',
    type: 'Portfolio Aggregator',
    hq: 'Berlin / Remote',
    fit: 'Very High',
    reason: 'Acquires small SaaS products at asset prices, handles commercialisation. No revenue requirement for early-stage assets. Active acquirer of UK products.',
    approach: 'Direct outreach via their acquisition form. Move quickly.',
    dealRange: '£50k–£300k per product',
    url: 'saasgroup.com',
  },
  {
    name: 'Tiny Capital',
    type: 'Portfolio Aggregator',
    hq: 'Canada / Global',
    fit: 'High',
    reason: 'Acquires "boring" niche SaaS with clear markets. No revenue needed. Long-term holders — not flippers. Known for fair founder treatment.',
    approach: 'Apply via their website. Honest, no-BS process.',
    dealRange: '£30k–£200k per product',
    url: 'tinycapital.com',
  },
  {
    name: 'Inflexion Private Equity',
    type: 'UK PE — Mid-Market',
    hq: 'London',
    fit: 'Medium (need revenue)',
    reason: 'Active in UK vertical SaaS. Would want £500k+ ARR but could be interested in methodology rights or a platform play.',
    approach: 'Via M&A advisor introduction only.',
    dealRange: '£2M–£20M (portfolio level)',
    url: 'inflexion.com',
  },
  {
    name: 'FE International',
    type: 'M&A Broker',
    hq: 'London / New York',
    fit: 'High (as broker)',
    reason: 'Will broker the sale to their network of 50,000+ buyers. Handle NDA, due diligence, escrow. Pre-revenue assets are accepted.',
    approach: 'Submit for valuation. They take 5–15% commission.',
    dealRange: 'All sizes',
    url: 'feinternational.com',
  },
  {
    name: 'Acquire.com',
    type: 'Marketplace',
    hq: 'USA / Global',
    fit: 'Medium',
    reason: 'Largest SaaS marketplace. Requires some revenue. Could list once first paying customer acquired.',
    approach: 'Self-serve listing once revenue established.',
    dealRange: '£20k–£2M',
    url: 'acquire.com',
  },
  {
    name: 'LDC (Lloyds Development Capital)',
    type: 'UK PE — Growth',
    hq: 'Multiple UK offices',
    fit: 'Medium-High',
    reason: 'Backed Harper James itself. Active in UK tech. Could structure a novel IP vehicle deal with methodology rights.',
    approach: 'Via corporate finance advisor.',
    dealRange: '£1M–£10M',
    url: 'ldc.co.uk',
  },
];

function fmt(n) {
  if (n >= 1000000) return `£${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
  return `£${n}`;
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

export default function ConfidentialTeaserDocument() {
  const [activeScenario, setActiveScenario] = useState('outright');

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Strictly Confidential — NDA Required</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Acquisition Teaser</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              This document describes a portfolio of production-ready vertical SaaS products available for acquisition or strategic partnership. 
              It does not disclose the proprietary development methodology or technical architecture. 
              Full disclosure is subject to executed mutual NDA and proof of funds.
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>April 2026</div>
            <div className="mt-1">England & Wales</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{fmt(TOTAL_ASSET_VALUE)}</div>
            <div className="text-xs text-slate-400 mt-1">Indicative asset value (pre-revenue)</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{fmt(TOTAL_BUILD_AVOIDED)}</div>
            <div className="text-xs text-slate-400 mt-1">Traditional dev cost avoided</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">{fmt(TOTAL_WITH_REVENUE)}</div>
            <div className="text-xs text-slate-400 mt-1">Projected value at 50 customers/product</div>
          </div>
        </div>
      </div>

      {/* What We Have — Safe Description */}
      <Section title="📋 What Is Being Offered" defaultOpen={true}>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>Note to Buyer:</strong> The following describes the <em>output and market position</em> of this portfolio. The underlying creation methodology is a protected trade secret and will not be disclosed prior to completion of legal agreements.
          </div>
          <p className="text-slate-700 leading-relaxed">
            We are offering a portfolio of <strong>four independently viable, production-ready vertical SaaS applications</strong>, each targeting a distinct specialist UK market with established demand and limited incumbent software provision.
          </p>
          <p className="text-slate-700 leading-relaxed">
            The products were developed using a <strong>proprietary accelerated development process</strong> that compresses typical SaaS build timelines from 12–18 months to a matter of weeks. This methodology is the core intellectual property of this business and is not limited to the four products described — it represents a <strong>repeatable competitive advantage</strong> that can be applied to any number of further verticals.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Each product is independently commercialisable via SaaS subscription, and all four can be operated as a <strong>unified software suite</strong> with shared infrastructure, commanding a premium valuation over individual product sales.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: '✅', text: '4 production-ready applications' },
              { icon: '✅', text: 'Subscription pricing established' },
              { icon: '✅', text: 'UK regulatory compliance built in' },
              { icon: '✅', text: 'Scalable cloud infrastructure' },
              { icon: '✅', text: 'Proprietary rapid-build methodology' },
              { icon: '✅', text: 'Transferable to any vertical' },
              { icon: '✅', text: 'No technical debt' },
              { icon: '✅', text: 'Full IP owned by vendor' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Products */}
      <Section title="📦 Product Portfolio" defaultOpen={true}>
        <div className="grid gap-4">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="border border-slate-200 rounded-xl p-5 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                    <Badge variant="outline" className="text-xs">{p.sector}</Badge>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{p.description}</p>
                  <p className="text-slate-500 text-xs mt-1">🎯 {p.targetMarket}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-xl font-bold text-green-700">{fmt(p.assetValue)}</div>
                  <div className="text-xs text-slate-500">asset value</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-900">£{p.monthlyPrice}/mo</div>
                  <div className="text-xs text-slate-500">SaaS price</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-700">{fmt(p.buildCostAvoided)}</div>
                  <div className="text-xs text-slate-500">dev cost avoided</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-amber-700">{fmt(p.withRevenueValue)}</div>
                  <div className="text-xs text-slate-500">value at 50 customers</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Scenarios */}
      <Section title="⚖️ Deal Scenarios — What You Get, What They Get" defaultOpen={true}>
        <div className="flex gap-3 mb-6">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeScenario === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.emoji} {s.label.split('—')[0].trim()}
            </button>
          ))}
        </div>

        {SCENARIOS.filter(s => s.id === activeScenario).map(s => (
          <div key={s.id} className="space-y-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg mb-1">{s.label}</h3>
              <p className="text-slate-600 text-sm">{s.headline}</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Seller Gets */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-700" />
                  <span className="font-bold text-green-900">Seller Receives</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-green-800">{fmt(s.sellerGets.cash)}</div>
                    <div className="text-xs text-green-700">immediate cash consideration</div>
                  </div>
                  {s.sellerGets.equity > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-green-800">{s.sellerGets.equity}% equity</div>
                      <div className="text-xs text-green-700">retained in IP vehicle</div>
                    </div>
                  )}
                  {s.sellerGets.ongoing && (
                    <div>
                      <div className="text-sm font-semibold text-green-800">+ {s.sellerGets.ongoing}</div>
                    </div>
                  )}
                  <p className="text-xs text-green-700 border-t border-green-200 pt-3">{s.sellerGets.notes}</p>
                </div>
              </div>

              {/* Buyer Gets */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-blue-900">Buyer Receives</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-blue-800">{s.buyerGets.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <div className="text-xl font-bold text-blue-800">{fmt(s.buyerGets.immediateValue)}</div>
                      <div className="text-xs text-blue-600">immediate tangible value</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-800">{fmt(s.buyerGets.potentialValue)}</div>
                      <div className="text-xs text-blue-600">3-year upside potential</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-blue-900 bg-blue-100 rounded-lg px-3 py-2">
                    📈 {s.buyerGets.roi}
                  </div>
                </div>
              </div>
            </div>

            {/* Best Suited For */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="font-semibold text-amber-900 mb-2 text-sm">Best Suited For:</div>
              <div className="flex flex-wrap gap-2">
                {s.bestSuited.map((b, i) => (
                  <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-300 text-xs">{b}</Badge>
                ))}
              </div>
            </div>

            {/* Risk note */}
            <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{s.risk}</span>
            </div>
          </div>
        ))}
      </Section>

      {/* Likely Buyers */}
      <Section title="🎯 Who to Approach — Ranked by Fit" defaultOpen={true}>
        <div className="space-y-3">
          {LIKELY_BUYERS.map((b, i) => (
            <div key={b.name} className="border border-slate-200 rounded-xl p-5 bg-white flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="font-bold text-slate-900">{b.name}</span>
                  <Badge variant="outline" className="text-xs">{b.type}</Badge>
                  <Badge className={`text-xs ${
                    b.fit === 'Very High' ? 'bg-green-100 text-green-800' :
                    b.fit === 'High' ? 'bg-blue-100 text-blue-800' :
                    b.fit.includes('High') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>{b.fit} Fit</Badge>
                  <span className="text-xs text-slate-500">{b.hq}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{b.reason}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500">💼 {b.dealRange}</span>
                  <span className="text-blue-600 font-medium">→ {b.approach}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Recommended First Move */}
      <Section title="🚦 Recommended Sequence of Actions" defaultOpen={true}>
        <div className="space-y-3">
          {[
            {
              step: 1,
              action: 'Get a robust mutual NDA drafted',
              detail: 'Use SeedLegals (seedlegals.com) — approximately £99–£299. This is your gate before any conversation.',
              urgency: 'Do this first',
              color: 'red',
            },
            {
              step: 2,
              action: 'Document your methodology as a trade secret internally',
              detail: 'Write a dated, witnessed internal memo describing the process in detail. Store it securely. This establishes prior art.',
              urgency: 'This week',
              color: 'orange',
            },
            {
              step: 3,
              action: 'Contact SaaS Group and Tiny Capital directly',
              detail: 'Both accept pre-revenue assets. Use the teaser text from this document (without the methodology). Apply under NDA.',
              urgency: 'Within 2 weeks',
              color: 'yellow',
            },
            {
              step: 4,
              action: 'Engage FE International as broker if direct approach stalls',
              detail: 'They access 50,000+ buyers. Takes 5–15% commission but handles due diligence, NDA, and escrow.',
              urgency: 'Parallel track',
              color: 'blue',
            },
            {
              step: 5,
              action: 'Get one paying customer on each product',
              detail: 'Even £1 MRR per product unlocks Acquire.com and dramatically improves valuation multiples. Target 30–90 days.',
              urgency: 'Highest leverage action',
              color: 'green',
            },
            {
              step: 6,
              action: 'Engage Harper James for IP formalisation once LOI received',
              detail: 'Do not pay for full legal until a buyer has issued a Letter of Intent. Then use deal proceeds to fund proper IP assignment and transfer docs.',
              urgency: 'After LOI only',
              color: 'purple',
            },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{item.step}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-slate-900">{item.action}</span>
                  <Badge className={`text-xs ${
                    item.color === 'red' ? 'bg-red-100 text-red-800' :
                    item.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    item.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>{item.urgency}</Badge>
                </div>
                <p className="text-sm text-slate-600">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer Disclaimer */}
      <div className="bg-slate-900 text-slate-400 rounded-xl p-6 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-3">
          <Shield className="w-4 h-4" />
          <span>Legal Disclaimer</span>
        </div>
        <p>This document is strictly confidential and intended solely for the named recipient under a duly executed mutual non-disclosure agreement. It does not constitute an offer to sell, a solicitation of an offer to buy, or a binding commitment of any kind.</p>
        <p>Valuations presented are indicative and based on market comparable data as at April 2026. Final valuations are subject to due diligence, legal review, and negotiation. The vendor makes no warranty as to future revenue or commercial performance.</p>
        <p>The proprietary development methodology referenced herein is a protected trade secret under the Trade Secrets (Enforcement, etc.) Regulations 2018. Unauthorised disclosure constitutes a civil and potentially criminal matter.</p>
        <p className="text-slate-500">© 2026 — All rights reserved. Reproduction or distribution without written consent is prohibited.</p>
      </div>
    </div>
  );
}