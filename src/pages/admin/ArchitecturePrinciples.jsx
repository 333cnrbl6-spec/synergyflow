import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Copy, Shield, Layers, Package } from 'lucide-react';

const PRINCIPLES = [
  {
    id: 'standalone',
    rule: 'Every product must be independently saleable',
    description: 'At any point in time, any single product (Premiso, Species Explorer, CharityHub, CaseNarrative) must be able to be sold, transferred, and operated by a new owner without requiring any other product in the portfolio to function.',
    status: 'mandatory',
    examples: {
      correct: [
        'Species Explorer has its own AI field report generation built natively into the app',
        'Premiso has its own tenant communication module — no external dependency',
        'CharityHub has its own compliance tracking — standalone',
      ],
      wrong: [
        'Species Explorer calls a SynergyFlow API to generate reports',
        'Premiso depends on a central shared service layer for document generation',
        'Any app requires another portfolio app to be running to function',
      ],
    },
  },
  {
    id: 'replication',
    rule: 'Board-approved improvements are replicated, not shared',
    description: 'When the board approves a cross-product improvement (e.g. "add AI-assisted document summaries to all products"), the implementation is replicated natively into each product\'s own codebase. The logic is copied and adapted — not centralised. Think franchise model: same standards, separate kitchens.',
    status: 'mandatory',
    examples: {
      correct: [
        'CaseNarrative AI structure pattern → replicated into Species Explorer as native field report AI',
        'Premiso\'s property inspection checklist logic → adapted and embedded into CharityHub\'s compliance audit flow',
        'Each app gets its own copy of shared UI patterns, adapted to its domain',
      ],
      wrong: [
        'A shared npm package owned by SynergyFlow that all apps import',
        'A central "intelligence API" that all apps call',
        'Logic that only lives in one app and others "borrow" via API call',
      ],
    },
  },
  {
    id: 'architecture',
    rule: 'No central orchestration dependency',
    description: 'SynergyFlow and the board management system are internal operational tools — not infrastructure for the portfolio products. The portfolio products have no awareness of or dependency on SynergyFlow, the board system, or each other.',
    status: 'mandatory',
    examples: {
      correct: [
        'SynergyFlow is used by the founder to manage strategy — it is not a runtime dependency of any product',
        'Each product connects directly to its own data, AI, and integrations',
        'Board decisions are implemented at the individual app level',
      ],
      wrong: [
        'Species Explorer imports components from a "shared SynergyFlow component library"',
        'Products check in with a central board API at runtime',
        'Any product has SynergyFlow listed as a dependency in its package.json',
      ],
    },
  },
  {
    id: 'species_explorer',
    rule: 'Species Explorer — Priority standalone sale candidate',
    description: 'Species Explorer has been identified by the board as the most likely first individual sale. All board-approved improvements must be implemented at the Species Explorer app level directly. This product must be the most polished, self-contained, and feature-complete of the portfolio.',
    status: 'priority',
    examples: {
      correct: [
        'AI-assisted species identification built natively into Species Explorer',
        'Field data export, reporting, and analytics all within the SE app itself',
        'Pricing, onboarding, and subscription all self-managed within SE',
        'Any board-approved "intelligence" feature replicated into SE first',
      ],
      wrong: [
        'Waiting on central infrastructure before improving SE',
        'SE improvements deferred because they\'re "part of a suite plan"',
        'SE relying on portfolio-level shared services to function',
      ],
    },
  },
  {
    id: 'exchange',
    rule: 'Cross-product idea exchange is a development practice, not a runtime architecture',
    description: 'The "joint exchange" of ideas, code patterns, and logic approved by the board refers to how the development team works — sharing learnings and replicating patterns across apps. It does not create technical dependencies at runtime. Apps are peers, not modules of a monolith.',
    status: 'mandatory',
    examples: {
      correct: [
        'A developer studies how CaseNarrative handles document AI, then builds equivalent logic natively in Premiso',
        'UI patterns, UX flows, and data models are shared as knowledge and replicated',
        'Board proposals reference which apps a pattern originated from and should be adapted into',
      ],
      wrong: [
        'Runtime API calls between portfolio apps',
        'Shared databases or auth systems across products',
        'One product\'s features being "powered by" another product\'s backend',
      ],
    },
  },
];

const STATUS_STYLES = {
  mandatory: { badge: 'bg-red-100 text-red-800 border-red-200', icon: Shield, label: 'Mandatory' },
  priority: { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle, label: 'Priority' },
  recommended: { badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: Copy, label: 'Recommended' },
};

function PrincipleCard({ principle }) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLES[principle.status];
  const Icon = style.icon;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-start gap-4 hover:bg-slate-50 transition"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          principle.status === 'mandatory' ? 'bg-red-100' :
          principle.status === 'priority' ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <Icon className={`w-4 h-4 ${
            principle.status === 'mandatory' ? 'text-red-600' :
            principle.status === 'priority' ? 'text-amber-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-900">{principle.rule}</span>
            <Badge className={`text-xs ${style.badge}`}>{style.label}</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{principle.description}</p>
        </div>
        <span className="text-slate-400 text-sm mt-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-6 pb-5 border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Correct Implementation</span>
            </div>
            <ul className="space-y-2">
              {principle.examples.correct.map((ex, i) => (
                <li key={i} className="text-xs text-slate-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 leading-relaxed">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">Violates This Principle</span>
            </div>
            <ul className="space-y-2">
              {principle.examples.wrong.map((ex, i) => (
                <li key={i} className="text-xs text-slate-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-relaxed">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePrinciples() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Board Ratified — April 2026</div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Architecture Principles</h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              These principles govern how board-approved improvements are implemented across the portfolio.
              They ensure every product remains independently saleable, self-contained, and fully featured —
              with no runtime dependency on other portfolio products or central infrastructure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold text-green-400 uppercase">Each App</span>
            </div>
            <div className="text-sm text-white">Self-contained. Independently deployable. Individually saleable at any time.</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Copy className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase">Ideas Shared As</span>
            </div>
            <div className="text-sm text-white">Replicated patterns and adapted logic — not shared services or imports.</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase">Priority Sale</span>
            </div>
            <div className="text-sm text-white">Species Explorer — first individual product to be brought to market.</div>
          </div>
        </div>
      </div>

      {/* Summary Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900 leading-relaxed">
        <strong>Board Decision Summary:</strong> The portfolio operates as a "franchise model" — shared standards, separate implementations.
        Board-approved improvements are <em>replicated natively</em> into each product, not centralised.
        SynergyFlow is an <em>internal management tool</em>, not a dependency of any portfolio product.
        Any product can be sold individually at any time without impacting the others.
      </div>

      {/* Principles */}
      <div className="space-y-3">
        {PRINCIPLES.map(p => (
          <PrincipleCard key={p.id} principle={p} />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 rounded-xl p-5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
          <Shield className="w-4 h-4" />
          Ratified by the Board — April 2026
        </div>
        <p>These principles supersede any prior technical proposals that implied shared runtime dependencies between portfolio products. All implementation work must be validated against these principles before deployment.</p>
      </div>
    </div>
  );
}