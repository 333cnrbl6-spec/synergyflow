import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, ChevronRight, ExternalLink, Play, Lock } from 'lucide-react';
import { toast } from 'sonner';

// The 4 apps — each is an independent product that must remain standalone
const APPS = [
  {
    id: 'species_explorer',
    name: 'Species Explorer',
    priority: 1,
    priorityLabel: '🌟 Priority Sale — First',
    color: 'green',
    description: 'Conservation & field research platform',
    base44Link: 'https://base44.com',
  },
  {
    id: 'premiso',
    name: 'Premiso',
    priority: 2,
    priorityLabel: 'Second',
    color: 'blue',
    description: 'Property portfolio management',
    base44Link: 'https://base44.com',
  },
  {
    id: 'charityhub',
    name: 'CharityHub',
    priority: 3,
    priorityLabel: 'Third',
    color: 'orange',
    description: 'Charity operations management',
    base44Link: 'https://base44.com',
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    priority: 4,
    priorityLabel: 'Fourth',
    color: 'purple',
    description: 'AI-assisted legal case documentation',
    base44Link: 'https://base44.com',
  },
];

// Board-approved improvements — replicated natively into each app (not shared)
// Each improvement is implemented independently in each app that needs it
const APPROVED_IMPROVEMENTS = [
  {
    id: 'ai_document_intelligence',
    title: 'AI Document Intelligence',
    origin: 'CaseNarrative',
    description: 'AI-assisted content generation, summarisation, and smart field completion native to each app\'s document types.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Add AI field report generation — auto-populate observation notes, species descriptions, and conservation recommendations using InvokeLLM natively in the Species Explorer app.',
      premiso: 'Add AI tenancy document drafting — auto-generate inspection reports, tenancy notices, and property summaries natively in Premiso.',
      charityhub: 'Add AI grant application assistant and donor communication drafting natively in CharityHub.',
      casenarrative: 'Already has this — enhance with structured narrative templates and precedent matching.',
    },
    priority: 'critical',
    pattern_source: 'Replicate CaseNarrative AI patterns — adapted per domain. No shared service.',
  },
  {
    id: 'smart_search_filter',
    title: 'Smart Search & Intelligent Filtering',
    origin: 'All apps',
    description: 'Powerful search with filters, saved views, and quick-find across all major data types within each app.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Add species search with taxonomy filters, conservation status, habitat type, and sighting date range — native to SE.',
      premiso: 'Add property search with filters for postcode, tenancy status, rent range, and maintenance alerts — native to Premiso.',
      charityhub: 'Add beneficiary/donor search with campaign and volunteer filters — native to CharityHub.',
      casenarrative: 'Add case search with matter type, status, assigned solicitor, and date filters — native to CaseNarrative.',
    },
    priority: 'high',
    pattern_source: 'Standard pattern — each app implements its own domain-specific version.',
  },
  {
    id: 'dashboard_analytics',
    title: 'Rich Analytics Dashboard',
    origin: 'Portfolio-wide board decision',
    description: 'Each app gets its own analytics home screen showing KPIs, trends, and activity summaries relevant to its domain.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Species sightings over time, conservation status distribution, survey coverage maps, researcher activity — native recharts in SE.',
      premiso: 'MRR per property, vacancy rate, maintenance backlog, rent collection rate — native recharts in Premiso.',
      charityhub: 'Donor retention, volunteer hours, campaign conversion, grant pipeline — native recharts in CharityHub.',
      casenarrative: 'Case load by type, resolution time, outstanding actions, client activity — native recharts in CaseNarrative.',
    },
    priority: 'high',
    pattern_source: 'Use recharts (already installed). Each app owns its own chart components.',
  },
  {
    id: 'export_reporting',
    title: 'PDF / Export & Professional Reporting',
    origin: 'Board decision — acquisition readiness',
    description: 'Each app can export its core data as professional PDF reports for end users — increases perceived value and stickiness.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Export species survey reports, sighting logs, and conservation status reports as PDFs natively using html2canvas + jsPDF.',
      premiso: 'Export tenancy agreements, property inspection reports, and rent statements as PDFs natively in Premiso.',
      charityhub: 'Export annual reports, donor summaries, and campaign results as PDFs natively in CharityHub.',
      casenarrative: 'Export case narratives, evidence bundles, and timeline reports as PDFs natively in CaseNarrative.',
    },
    priority: 'high',
    pattern_source: 'Use html2canvas + jsPDF (already installed in this project — same pattern applies). Each app has its own export logic.',
  },
  {
    id: 'onboarding_flow',
    title: 'User Onboarding & Setup Wizard',
    origin: 'Board go-to-market decision',
    description: 'First-time user onboarding that guides new customers through setup — critical for self-serve conversion.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Onboarding wizard: create first survey → add first species observation → invite team member. 3-step flow native to SE.',
      premiso: 'Onboarding wizard: add first property → add first tenant → set rent collection date. 3-step flow native to Premiso.',
      charityhub: 'Onboarding wizard: create charity profile → add first campaign → invite volunteer. 3-step flow native to CharityHub.',
      casenarrative: 'Onboarding wizard: create first case → add client → assign solicitor. 3-step flow native to CaseNarrative.',
    },
    priority: 'high',
    pattern_source: 'Multi-step wizard pattern. Each app has completely separate onboarding relevant to its domain.',
  },
  {
    id: 'notification_system',
    title: 'In-App Notifications & Alerts',
    origin: 'Board readiness proposal',
    description: 'Smart alerts and notifications native to each app — keeps users engaged and surfaces important actions.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: 'Alert: new species sighting in watched area, survey deadline approaching, conservation status change — native SE notifications.',
      premiso: 'Alert: rent overdue, maintenance request raised, tenancy expiring — native Premiso notifications.',
      charityhub: 'Alert: donor lapsed, volunteer needed, grant deadline — native CharityHub notifications.',
      casenarrative: 'Alert: case deadline, client response needed, document unsigned — native CaseNarrative notifications.',
    },
    priority: 'medium',
    pattern_source: 'Notification entity pattern — each app has its own notification types and triggers.',
  },
  {
    id: 'subscription_paywall',
    title: 'Subscription & Paywall (First Paying Customer)',
    origin: 'Board commercial priority — highest valuation leverage',
    description: 'Stripe subscription integration enabling paid tiers — even 1 paying customer dramatically increases valuation multiples.',
    applies_to: ['species_explorer', 'premiso', 'charityhub', 'casenarrative'],
    how_to_implement: {
      species_explorer: '£39/mo Starter → £99/mo Professional tiers. Gate premium features (AI reports, bulk export, team seats) behind paywall natively in SE.',
      premiso: '£49/mo Starter → £129/mo Professional tiers. Gate unlimited properties and AI documents behind paywall natively in Premiso.',
      charityhub: '£29/mo Starter → £79/mo Professional tiers. Gate unlimited campaigns and reporting behind paywall natively in CharityHub.',
      casenarrative: '£59/mo Starter → £149/mo Professional tiers. Gate AI narrative generation and bulk export behind paywall natively in CaseNarrative.',
    },
    priority: 'critical',
    pattern_source: 'Stripe already installed. Each app implements its own subscription logic independently.',
  },
];

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-amber-100 text-amber-800 border-amber-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
};

const APP_COLORS = {
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500', header: 'bg-green-900' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', header: 'bg-blue-900' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', header: 'bg-orange-900' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500', header: 'bg-purple-900' },
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'built', 'testing', 'passed'];
const STATUS_ICONS = {
  pending: <Circle className="w-4 h-4 text-slate-400" />,
  in_progress: <Play className="w-4 h-4 text-amber-500" />,
  built: <Clock className="w-4 h-4 text-blue-500" />,
  testing: <AlertCircle className="w-4 h-4 text-orange-500" />,
  passed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
};
const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  built: 'Built — Needs Test',
  testing: 'Testing',
  passed: '✅ Passed',
};

function getStorageKey(appId, improvementId) {
  return `rollout_${appId}_${improvementId}`;
}

function loadStatus(appId, improvementId) {
  return localStorage.getItem(getStorageKey(appId, improvementId)) || 'pending';
}

function saveStatus(appId, improvementId, status) {
  localStorage.setItem(getStorageKey(appId, improvementId), status);
}

function ImprovementRow({ improvement, appId, isLocked }) {
  const [status, setStatus] = useState(() => loadStatus(appId, improvement.id));
  const [open, setOpen] = useState(false);

  const handleStatusChange = (newStatus) => {
    if (isLocked) return;
    setStatus(newStatus);
    saveStatus(appId, improvement.id, newStatus);
    if (newStatus === 'passed') toast.success(`✅ ${improvement.title} passed in this app!`);
    if (newStatus === 'in_progress') toast.info(`🔨 ${improvement.title} marked as in progress`);
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${status === 'passed' ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-white'} ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-shrink-0">{STATUS_ICONS[status]}</div>
        <button onClick={() => setOpen(!open)} className="flex-1 text-left flex items-center gap-2">
          <span className={`text-sm font-semibold ${status === 'passed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {improvement.title}
          </span>
          <Badge className={`text-xs ${PRIORITY_STYLES[improvement.priority]}`}>{improvement.priority}</Badge>
          {open ? <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" /> : <ChevronRight className="w-3 h-3 text-slate-400 ml-auto" />}
        </button>
        {!isLocked && (
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        )}
        {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-600">{improvement.description}</p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
            <strong>🔨 How to implement in this app:</strong><br />
            {improvement.how_to_implement[appId]}
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
            <strong>⚠️ Architecture rule:</strong> {improvement.pattern_source}
          </div>
          <div className="text-xs text-slate-500">Pattern originated from: <strong>{improvement.origin}</strong></div>
        </div>
      )}
    </div>
  );
}

function AppColumn({ app, activeAppId, onSetActive }) {
  const colors = APP_COLORS[app.color];
  const isActive = activeAppId === app.id;
  const isPreviousComplete = app.priority === 1 || (() => {
    const prevApp = APPS.find(a => a.priority === app.priority - 1);
    if (!prevApp) return true;
    return APPROVED_IMPROVEMENTS.every(imp =>
      imp.applies_to.includes(prevApp.id)
        ? loadStatus(prevApp.id, imp.id) === 'passed'
        : true
    );
  })();

  const completedCount = APPROVED_IMPROVEMENTS.filter(imp =>
    imp.applies_to.includes(app.id) && loadStatus(app.id, imp.id) === 'passed'
  ).length;
  const totalCount = APPROVED_IMPROVEMENTS.filter(imp => imp.applies_to.includes(app.id)).length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const isLocked = !isPreviousComplete && !isActive;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isActive ? `border-${app.color}-400` : 'border-slate-200'}`}>
      {/* Header */}
      <div className={`px-4 py-4 ${isActive ? `bg-${app.color}-900` : 'bg-slate-800'} text-white`}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? colors.dot : 'bg-slate-500'}`} />
              <span className="font-bold text-sm">{app.name}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{app.priorityLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{completedCount}/{totalCount}</div>
            <div className="text-xs text-slate-400">passed</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${completedCount === totalCount ? 'bg-green-400' : isActive ? `bg-${app.color}-400` : 'bg-slate-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {!isActive && isPreviousComplete && (
          <Button
            size="sm"
            onClick={() => onSetActive(app.id)}
            className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white text-xs h-7"
          >
            <Play className="w-3 h-3 mr-1" /> Start This App
          </Button>
        )}
        {isActive && (
          <div className="mt-2 text-xs font-semibold text-green-400 text-center">▶ CURRENTLY IN FLIGHT</div>
        )}
        {isLocked && (
          <div className="mt-2 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Complete previous app first
          </div>
        )}
      </div>

      {/* Improvements */}
      <div className="p-3 space-y-2 bg-slate-50">
        {APPROVED_IMPROVEMENTS.filter(imp => imp.applies_to.includes(app.id)).map(imp => (
          <ImprovementRow
            key={imp.id}
            improvement={imp}
            appId={app.id}
            isLocked={isLocked}
          />
        ))}
      </div>
    </div>
  );
}

export default function AppRolloutWorkbench() {
  const [activeAppId, setActiveAppId] = useState('species_explorer');
  const [, forceUpdate] = useState(0);

  const handleSetActive = (appId) => {
    setActiveAppId(appId);
    forceUpdate(n => n + 1);
    toast.success(`Now working on ${APPS.find(a => a.id === appId)?.name}`);
  };

  const totalPassed = APPS.reduce((sum, app) =>
    sum + APPROVED_IMPROVEMENTS.filter(imp =>
      imp.applies_to.includes(app.id) && loadStatus(app.id, imp.id) === 'passed'
    ).length, 0
  );
  const totalItems = APPS.reduce((sum, app) =>
    sum + APPROVED_IMPROVEMENTS.filter(imp => imp.applies_to.includes(app.id)).length, 0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">App-by-App Rollout Workbench</h1>
        <p className="text-slate-300 text-sm mb-4">
          Board-approved improvements implemented natively into each app — one at a time, in sequence.
          Each app remains fully independent and individually saleable throughout.
        </p>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xl font-bold text-green-400">{totalPassed}/{totalItems}</div>
            <div className="text-xs text-slate-400">improvements passed</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xl font-bold text-amber-400">{APPROVED_IMPROVEMENTS.length}</div>
            <div className="text-xs text-slate-400">approved improvements</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xl font-bold text-blue-400">{APPS.length}</div>
            <div className="text-xs text-slate-400">apps to upgrade</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xl font-bold text-purple-400">{APPS.find(a => a.id === activeAppId)?.name}</div>
            <div className="text-xs text-slate-400">currently in flight</div>
          </div>
        </div>
      </div>

      {/* Architecture Reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <strong>⚠️ Architecture Principle (Board Ratified):</strong> Each improvement below must be implemented
        <em> natively inside each app's own codebase</em>. Open each app in a separate Base44 session and build the
        feature directly into that app. No shared services, no central dependencies. Each app must work completely
        standalone after every improvement.
      </div>

      {/* The 4 app columns — desktop: 4 col, mobile: 1 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {APPS.map(app => (
          <AppColumn
            key={app.id}
            app={app}
            activeAppId={activeAppId}
            onSetActive={handleSetActive}
          />
        ))}
      </div>

      {/* Status Legend */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Status Legend</div>
        <div className="flex flex-wrap gap-4">
          {STATUS_OPTIONS.map(s => (
            <div key={s} className="flex items-center gap-2 text-xs text-slate-600">
              {STATUS_ICONS[s]}
              <span>{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}