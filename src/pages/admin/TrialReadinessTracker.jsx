import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Plus, Trash2, Users, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const APPS = [
  {
    id: 'datawinder',
    name: 'DataWinder',
    subtitle: 'Species Explorer',
    emoji: '🦁',
    color: 'green',
    targetMarket: 'Wildlife trusts, zoos, conservation NGOs, universities',
    outreachChannels: ['LinkedIn ecology/conservation groups', 'UK wildlife trust contacts', 'CIEEM members'],
  },
  {
    id: 'premiso',
    name: 'Premiso',
    subtitle: 'Property Management',
    emoji: '🏠',
    color: 'blue',
    targetMarket: 'Landlords, letting agents, property managers',
    outreachChannels: ['Facebook landlord groups', 'NRLA community', 'LinkedIn property professionals'],
  },
  {
    id: 'charityhub',
    name: 'CharityHub',
    subtitle: 'Charity Operations',
    emoji: '❤️',
    color: 'orange',
    targetMarket: 'UK charities, CICs, voluntary organisations',
    outreachChannels: ['NCVO network', 'Local charity CEO contacts', 'CharityJob forums'],
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    subtitle: 'Legal Case Management',
    emoji: '⚖️',
    color: 'purple',
    targetMarket: 'Solicitors, paralegals, PI firms, barristers',
    outreachChannels: ['Law Society forums', 'LinkedIn legal professionals', 'APIL members'],
  },
];

const CHECKLIST_ITEMS = [
  { key: 'built', label: 'App Built & Deployed' },
  { key: 'ip_clean', label: 'IP/Permissions Checked' },
  { key: 'url_live', label: 'Live URL Published' },
  { key: 'stripe_connected', label: 'Stripe Connect Integrated' },
  { key: 'onboarding_tested', label: 'Onboarding Flow Tested' },
  { key: 'first_trial_user', label: 'First Trial User Onboarded' },
  { key: 'first_paying', label: 'First Paying Customer' },
];

const COLOR_STYLES = {
  green:  { header: 'bg-green-700',  badge: 'bg-green-100 text-green-800',  dot: 'bg-green-500',  light: 'bg-green-50 border-green-200' },
  blue:   { header: 'bg-blue-700',   badge: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500',   light: 'bg-blue-50 border-blue-200' },
  orange: { header: 'bg-orange-700', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', light: 'bg-orange-50 border-orange-200' },
  purple: { header: 'bg-purple-700', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500', light: 'bg-purple-50 border-purple-200' },
};

const STORAGE_KEY = 'trial_readiness_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function AppCard({ app }) {
  const colors = COLOR_STYLES[app.color];
  const [state, setState] = useState(() => {
    const all = loadState();
    return all[app.id] || { checklist: {}, trialUsers: [], url: '', notes: '' };
  });
  const [expanded, setExpanded] = useState(false);
  const [newUser, setNewUser] = useState('');

  const persist = (newState) => {
    setState(newState);
    const all = loadState();
    all[app.id] = newState;
    saveState(all);
  };

  const toggleCheck = (key) => {
    const updated = { ...state, checklist: { ...state.checklist, [key]: !state.checklist[key] } };
    persist(updated);
  };

  const addUser = () => {
    if (!newUser.trim()) return;
    const updated = { ...state, trialUsers: [...(state.trialUsers || []), { name: newUser.trim(), date: new Date().toLocaleDateString('en-GB') }] };
    persist(updated);
    setNewUser('');
    toast.success(`Trial user added to ${app.name}`);
  };

  const removeUser = (i) => {
    const updated = { ...state, trialUsers: state.trialUsers.filter((_, idx) => idx !== i) };
    persist(updated);
  };

  const completedCount = CHECKLIST_ITEMS.filter(item => state.checklist[item.key]).length;
  const pct = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  const statusColor = pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-slate-400';
  const barColor = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-slate-300';

  return (
    <Card className={`border-2 ${colors.light} overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.header} text-white px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{app.emoji}</span>
            <div>
              <div className="font-bold text-lg">{app.name}</div>
              <div className="text-xs text-white/70">{app.subtitle}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${statusColor} bg-white rounded-lg px-3 py-1`}>{pct}%</div>
            <div className="text-xs text-white/70 mt-1">{completedCount}/{CHECKLIST_ITEMS.length} done</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Checklist */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Launch Checklist</div>
          <div className="space-y-1.5">
            {CHECKLIST_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className="flex items-center gap-2 w-full text-left hover:bg-slate-50 rounded px-1 py-0.5 transition"
              >
                {state.checklist[item.key]
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                <span className={`text-sm ${state.checklist[item.key] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live URL */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Live URL</div>
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={state.url || ''}
              onChange={e => persist({ ...state, url: e.target.value })}
              className="text-sm h-8"
            />
            {state.url && (
              <a href={state.url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-8 px-2"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            )}
          </div>
        </div>

        {/* Trial Users */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 w-full"
          >
            <Users className="w-3 h-3" />
            Trial Users ({(state.trialUsers || []).length})
            {expanded ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
          </button>

          {expanded && (
            <div className="space-y-2">
              {(state.trialUsers || []).map((u, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded px-3 py-1.5">
                  <div>
                    <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    <span className="text-xs text-slate-400 ml-2">{u.date}</span>
                  </div>
                  <button onClick={() => removeUser(i)} className="text-slate-300 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Organisation or contact name..."
                  value={newUser}
                  onChange={e => setNewUser(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addUser()}
                  className="text-sm h-8"
                />
                <Button onClick={addUser} size="sm" className="h-8 px-2 shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Target market */}
        <div className={`rounded-lg p-3 border ${colors.light}`}>
          <div className="text-xs font-bold text-slate-500 mb-1">Target Market</div>
          <p className="text-xs text-slate-600">{app.targetMarket}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {app.outreachChannels.map((ch, i) => (
              <Badge key={i} className={`text-xs ${colors.badge}`}>{ch}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrialReadinessTracker() {
  const allStates = loadState();
  const totalChecked = APPS.reduce((sum, app) => {
    const s = allStates[app.id] || {};
    return sum + CHECKLIST_ITEMS.filter(i => s.checklist?.[i.key]).length;
  }, 0);
  const totalPossible = APPS.length * CHECKLIST_ITEMS.length;
  const overallPct = Math.round((totalChecked / totalPossible) * 100);

  const totalTrialUsers = APPS.reduce((sum, app) => {
    const s = allStates[app.id] || {};
    return sum + (s.trialUsers?.length || 0);
  }, 0);

  const appsLive = APPS.filter(app => allStates[app.id]?.url).length;
  const appsWithUsers = APPS.filter(app => (allStates[app.id]?.trialUsers?.length || 0) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Trial Readiness Tracker</h1>
        <p className="text-slate-300 text-sm mb-4">Track the launch status of each app — from build to first paying customer.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Overall Progress', value: `${overallPct}%`, sub: `${totalChecked}/${totalPossible} items` },
            { label: 'Apps with Live URL', value: `${appsLive}/4`, sub: 'published' },
            { label: 'Trial Users', value: totalTrialUsers, sub: 'across all apps' },
            { label: 'Apps with Users', value: `${appsWithUsers}/4`, sub: 'have trialists' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
              <div className="text-xs text-white/50">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* App Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {APPS.map(app => <AppCard key={app.id} app={app} />)}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <strong>💡 Strategy:</strong> Focus on getting 2–3 trial subscribers per app before worrying about Stripe.
        Once a subscriber is actively using the app, they will naturally ask about connecting their own payment processing — that's the right moment to walk them through Stripe Connect.
        Progress is saved locally in your browser.
      </div>
    </div>
  );
}