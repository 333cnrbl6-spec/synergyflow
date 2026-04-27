import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Clock, AlertTriangle, Search, Filter, ChevronDown, ChevronRight, Layers, ListTodo, Wrench, Copy } from 'lucide-react';
import { toast } from 'sonner';

// Standalone product profiles for separate buyer/marketing identity
const APP_PROFILES = {
  'CaseNarrative': {
    emoji: '⚖️',
    tagline: 'AI-powered legal case management',
    market: 'Legal Tech',
    buyer: 'Law firms, legal departments, barristers',
    standalone_url: 'casenarrative.com',
  },
  'Species Explorer': {
    emoji: '🦁',
    tagline: 'Conservation & biodiversity intelligence platform',
    market: 'Conservation Tech',
    buyer: 'Zoos, wildlife trusts, conservation NGOs',
    standalone_url: 'speciesexplorer.io',
  },
  'CharityHub': {
    emoji: '❤️',
    tagline: 'End-to-end charity operations platform',
    market: 'Non-Profit Tech',
    buyer: 'Charities, foundations, grant-making bodies',
    standalone_url: 'charityhub.org',
  },
  'Premiso': {
    emoji: '🏠',
    tagline: 'Intelligent property management suite',
    market: 'PropTech',
    buyer: 'Property managers, letting agents, landlords',
    standalone_url: 'premiso.co.uk',
  },
  'Base44 AI': {
    emoji: '🤖',
    tagline: 'No-code AI app builder platform',
    market: 'Dev Tools / SaaS Infrastructure',
    buyer: 'SMEs, solopreneurs, digital agencies',
    standalone_url: 'base44.com',
  },
};

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low:      { label: 'Low',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const TYPE_CONFIG = {
  build:        { label: 'Build',        icon: '🏗️' },
  pricing:      { label: 'Pricing',      icon: '💰' },
  go_to_market: { label: 'Go-to-Market', icon: '🚀' },
  partnership:  { label: 'Partnership',  icon: '🤝' },
  governance:   { label: 'Governance',   icon: '⚖️' },
  readiness:    { label: 'Readiness',    icon: '✅' },
};

const STATUS_STEPS = ['Approved', 'In Build', 'Testing', 'Deployed'];

function StatusStepper({ currentStatus, onAdvance, id }) {
  const stepIndex = {
    passed: 0,
    in_progress: 1,
    testing: 2,
    completed: 3,
  }[currentStatus] ?? 0;

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => i === stepIndex + 1 && onAdvance(id, Object.keys({ passed: 0, in_progress: 1, testing: 2, completed: 3 })[i])}
            className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${
              i < stepIndex ? 'bg-green-100 text-green-700 border-green-200'
              : i === stepIndex ? 'bg-blue-600 text-white border-blue-600'
              : i === stepIndex + 1 ? 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 cursor-pointer'
              : 'bg-white text-slate-300 border-slate-200 cursor-default'
            }`}
          >
            {step}
          </button>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`w-4 h-px mx-0.5 ${i < stepIndex ? 'bg-green-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ProposalRow({ proposal, onStatusAdvance, expanded, onToggle }) {
  const typeConf = TYPE_CONFIG[proposal.proposal_type] || { label: proposal.proposal_type, icon: '📋' };
  const voteCount = (proposal.yes_votes || []).length;

  const copyToClipboard = (e) => {
    e.stopPropagation();
    const text = `**${proposal.title}**\n\n${proposal.summary}\n\nType: ${typeConf.label} | Status: ${proposal.approval_stage || 'pending'}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="border border-slate-200 rounded-lg mb-2 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 p-4">
        <button onClick={onToggle} className="mt-0.5 text-slate-400 cursor-pointer">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 truncate">{proposal.title}</span>
            <Badge className="text-xs border bg-transparent">{typeConf.icon} {typeConf.label}</Badge>
            {proposal.is_unanimous && (
              <Badge className="bg-green-100 text-green-700 text-xs border-green-200 border">Unanimous</Badge>
            )}
            {voteCount > 0 && (
              <span className="text-xs text-slate-500">👍 {voteCount} votes</span>
            )}
          </div>
          <StatusStepper currentStatus={proposal.approval_stage} onAdvance={onStatusAdvance} id={proposal.id} />
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition shrink-0"
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-10 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
          <p>{proposal.summary}</p>
          {proposal.products_involved?.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">Products: {proposal.products_involved.join(', ')}</p>
          )}
          {proposal.chairman_notes && (
            <p className="mt-2 text-xs italic text-amber-700 bg-amber-50 px-2 py-1 rounded">Chairman: {proposal.chairman_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImplementationBacklog() {
  const [proposals, setProposals] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [activeTab, setActiveTab] = useState('proposals');
  const [expandedIds, setExpandedIds] = useState({});
  const [autoExecuted, setAutoExecuted] = useState(false);

  useEffect(() => {
    loadAll();
    const unsub = base44.entities.BoardProposal.subscribe(() => loadAll());
    const unsub2 = base44.entities.ActionItem.subscribe(() => loadAll());
    return () => { unsub(); unsub2(); };
  }, []);

  // Auto-execute once data is loaded — consent granted by board
  useEffect(() => {
    if (!loading && (proposals.length > 0 || actionItems.length > 0 || tasks.length > 0) && !autoExecuted) {
      setAutoExecuted(true);
      // Derive products inline to avoid referencing variables declared later
      const groups = {};
      [...proposals, ...actionItems, ...tasks].forEach(item => {
        const product = item.product_name || item.products_involved?.[0] || 'General';
        if (!groups[product]) groups[product] = true;
      });
      const productList = Object.keys(groups).sort();
      (async () => {
        toast.success('🚀 Auto-executing build briefs for all apps...');
        for (const appName of productList) {
          await postAppBuildToBoard(appName);
          await new Promise(r => setTimeout(r, 1000));
        }
        toast.success('✅ All apps posted to board — autonomous buildouts initiated!');
      })();
    }
  }, [loading, proposals.length, actionItems.length, tasks.length]);

  const loadAll = async () => {
    try {
      const [propsData, actionsData, tasksData] = await Promise.all([
        base44.entities.BoardProposal.filter({ status: 'approved' }).catch(() => []),
        base44.entities.ActionItem.list().catch(() => []),
        base44.entities.ImplementationTask.list().catch(() => []),
      ]);
      setProposals(propsData);
      setActionItems(actionsData);
      setTasks(tasksData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAdvance = async (proposalId, newStage) => {
    try {
      await base44.entities.BoardProposal.update(proposalId, { approval_stage: newStage });
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, approval_stage: newStage } : p));
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleActionStatusToggle = async (item) => {
    const newStatus = item.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await base44.entities.ActionItem.update(item.id, { status: newStatus });
      setActionItems(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
      toast.success(`Marked as ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const handleTaskStatusToggle = async (task) => {
    const newStatus = task.implementation_status === 'deployed' ? 'in_progress' : 'deployed';
    try {
      await base44.entities.ImplementationTask.update(task.id, { implementation_status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, implementation_status: newStatus } : t));
      toast.success(`Marked as ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const toggleExpand = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredProposals = proposals.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.summary?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.proposal_type === filterType;
    const matchStage = filterStage === 'all' || p.approval_stage === filterStage;
    return matchSearch && matchType && matchStage;
  });

  const passedCount = proposals.filter(p => p.approval_stage === 'passed').length;
  const inProgressCount = proposals.filter(p => p.approval_stage === 'in_progress').length;
  const completedCount = proposals.filter(p => p.approval_stage === 'completed').length;
  const actionDone = actionItems.filter(a => a.status === 'completed').length;
  const tasksDone = tasks.filter(t => t.implementation_status === 'deployed').length;

  // Group by product/app
  const groupByProduct = () => {
    const groups = {};
    
    [...proposals, ...actionItems, ...tasks].forEach(item => {
      const product = item.product_name || item.products_involved?.[0] || 'General';
      if (!groups[product]) groups[product] = { proposals: [], actions: [], tasks: [] };
      
      if (item.title && item.summary) groups[product].proposals.push(item);
      else if (item.title && item.description) groups[product].actions.push(item);
      else if (item.issue_description) groups[product].tasks.push(item);
    });
    
    return groups;
  };

  const productGroups = groupByProduct();
  const products = Object.keys(productGroups).sort();

  const buildText = (appName) => {
    const group = productGroups[appName];
    const profile = APP_PROFILES[appName];

    let text = `🚀 **${appName} — Build Brief**\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Standalone identity block
    if (profile) {
      text += `## 🏷️ Standalone Product Identity\n`;
      text += `**Market:** ${profile.market}\n`;
      text += `**Tagline:** ${profile.tagline}\n`;
      text += `**Target Buyer:** ${profile.buyer}\n`;
      text += `**Brand URL:** ${profile.standalone_url}\n`;
      text += `> Build this app as a fully self-contained product — its own landing page, own pricing, own brand — marketable and sellable independently.\n\n`;
    }

    // SynergyFlow suite context
    text += `## 🔗 SynergyFlow Suite Context\n`;
    text += `> This app is also part of the SynergyFlow portfolio. Build with integration hooks so it can plug into the wider suite. Shared buyer = enterprise/portfolio acquirer or operator.\n\n`;

    // Build items
    if (group.proposals.length > 0) {
      text += `## 📋 Proposals (${group.proposals.length})\n`;
      group.proposals.forEach(p => {
        text += `• **${p.title}**: ${(p.summary || '').substring(0, 100)}${(p.summary || '').length > 100 ? '...' : ''}\n`;
      });
      text += '\n';
    }

    if (group.actions.length > 0) {
      text += `## ✅ Action Items (${group.actions.length})\n`;
      group.actions.forEach(a => {
        text += `• ${a.title} [${a.priority || 'medium'}]: ${(a.description || '').substring(0, 80)}${(a.description || '').length > 80 ? '...' : ''}\n`;
      });
      text += '\n';
    }

    if (group.tasks.length > 0) {
      text += `## 🔧 Tasks (${group.tasks.length})\n`;
      group.tasks.forEach(t => {
        text += `• ${t.issue_description} [${t.issue_severity}] — ${t.fix_type}\n`;
      });
    }

    return text;
  };

  const copyAppBuild = (appName) => {
    navigator.clipboard.writeText(buildText(appName));
    toast.success(`Copied ${appName} build backlog`);
  };

  const postAllAppsToBoard = async () => {
    toast.success('🚀 Posting all apps to board...');
    for (const appName of products) {
      await postAppBuildToBoard(appName);
      await new Promise(r => setTimeout(r, 1000));
    }
    toast.success('✅ All apps posted to board — autonomous buildouts initiated!');
  };

  const postAppBuildToBoard = async (appName) => {
    const group = productGroups[appName];
    try {
      // Find a matching channel or use general
      const channels = await base44.entities.BoardChannel.list().catch(() => []);
      const match = channels.find(c =>
        c.name?.toLowerCase().includes(appName.toLowerCase()) ||
        appName.toLowerCase().includes(c.name?.toLowerCase())
      );
      const channelId = match?.id || channels[0]?.id || 'general';
      const channelName = match?.name || channels[0]?.name || 'General';

      // Build a short summary (safe size for content field)
      const summary = [
        `🚀 **${appName} Build Brief**`,
        `📋 Proposals: ${group.proposals.length} | ✅ Actions: ${group.actions.length} | 🔧 Tasks: ${group.tasks.length}`,
        '',
        group.proposals.slice(0, 5).map(p => `• ${p.title}`).join('\n'),
        group.proposals.length > 5 ? `...and ${group.proposals.length - 5} more proposals` : '',
      ].filter(Boolean).join('\n').substring(0, 2000);

      await base44.entities.BoardMessage.create({
        channel_id: channelId,
        channel_name: channelName,
        content: summary,
        message_type: 'announcement',
        sender_name: 'Implementation Backlog',
        sender_role: 'system',
      });

      // Build task objects (proposals + actions), cap at 50 to avoid rate limits
      const allTaskData = [
        ...group.proposals.map(p => ({
          product_name: appName,
          product_id: p.products_involved?.[0] || appName.toLowerCase().replace(/\s/g, '_'),
          board_member_app: appName,
          issue_description: p.title?.substring(0, 200) || 'Untitled',
          implementation_notes: (p.summary || '').substring(0, 500),
          fix_type: 'feature_enhancement',
          issue_severity: 'high',
          implementation_status: 'pending',
        })),
        ...group.actions.map(a => ({
          product_name: appName,
          product_id: appName.toLowerCase().replace(/\s/g, '_'),
          board_member_app: appName,
          issue_description: a.title?.substring(0, 200) || 'Untitled',
          implementation_notes: (a.description || '').substring(0, 500),
          fix_type: 'feature_enhancement',
          issue_severity: a.priority === 'critical' ? 'critical' : a.priority === 'high' ? 'high' : 'medium',
          implementation_status: 'pending',
        })),
      ].slice(0, 50);

      // Create in batches of 10 to stay within rate limits
      for (let i = 0; i < allTaskData.length; i += 10) {
        const batch = allTaskData.slice(i, i + 10);
        await Promise.all(batch.map(t => base44.entities.ImplementationTask.create(t)));
        if (i + 10 < allTaskData.length) await new Promise(r => setTimeout(r, 500));
      }

      await loadAll();
      toast.success(`Posted to #${channelName} & queued ${allTaskData.length} build tasks for ${appName}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Implementation Backlog</h1>
            <p className="text-slate-500 text-sm mt-1">All board-approved proposals, action items and tasks — centralised here for execution tracking.</p>
          </div>
          <Button
            onClick={postAllAppsToBoard}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white shrink-0"
          >
            🚀 Post All Apps to Board
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700">{proposals.length}</div>
              <div className="text-xs text-blue-600">Total Approved</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-700">{passedCount}</div>
              <div className="text-xs text-slate-500">Awaiting Build</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-700">{inProgressCount}</div>
              <div className="text-xs text-orange-600">In Build</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">{completedCount}</div>
              <div className="text-xs text-green-600">Deployed</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-700">{actionDone + tasksDone}</div>
              <div className="text-xs text-purple-600">Tasks Done</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'by-app', label: 'App Builds', icon: '📦', count: products.length },
            { key: 'proposals', label: 'Board Proposals', icon: <Layers className="w-4 h-4" />, count: proposals.length },
            { key: 'actions', label: 'Action Items', icon: <ListTodo className="w-4 h-4" />, count: actionItems.length },
            { key: 'tasks', label: 'Implementation Tasks', icon: <Wrench className="w-4 h-4" />, count: tasks.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon} {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters (proposals tab only) */}
        {activeTab === 'proposals' && (
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search proposals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All Stages</option>
              <option value="passed">Awaiting Build</option>
              <option value="in_progress">In Build</option>
              <option value="testing">Testing</option>
              <option value="completed">Deployed</option>
            </select>
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div>
            {filteredProposals.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No proposals match your filters.</p>
              </div>
            ) : (
              filteredProposals.map(proposal => (
                <ProposalRow
                  key={proposal.id}
                  proposal={proposal}
                  onStatusAdvance={handleStatusAdvance}
                  expanded={!!expandedIds[proposal.id]}
                  onToggle={() => toggleExpand(proposal.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Action Items Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-2">
            {actionItems.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No action items yet.</p>
              </div>
            ) : (
              actionItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                  <button onClick={() => handleActionStatusToggle(item)} className="mt-0.5 shrink-0">
                    {item.status === 'completed'
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <Clock className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`**${item.title}**\n\n${item.description}\n\nCategory: ${item.category} | Priority: ${item.priority}`);
                        toast.success('Copied to clipboard');
                      }}
                      className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      {item.priority && (
                        <Badge className={`text-xs border ${PRIORITY_CONFIG[item.priority]?.color}`}>
                          {PRIORITY_CONFIG[item.priority]?.label || item.priority}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* App-Specific Builds Tab */}
        {activeTab === 'by-app' && (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No backlog items yet.</p>
              </div>
            ) : (
              products.map(product => {
                const group = productGroups[product];
                const totalItems = group.proposals.length + group.actions.length + group.tasks.length;
                
                const profile = APP_PROFILES[product];
                return (
                  <Card key={product} className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {profile && <span className="text-xl">{profile.emoji}</span>}
                          <CardTitle className="text-lg">{product}</CardTitle>
                        </div>
                        {profile && (
                          <p className="text-xs text-slate-600 mt-0.5 italic">{profile.tagline}</p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {profile && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                              🏷️ Standalone: {profile.market}
                            </span>
                          )}
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            🔗 SynergyFlow Suite
                          </span>
                          <span className="text-xs text-slate-400">{totalItems} items</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyAppBuild(product)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => postAppBuildToBoard(product)}
                          size="sm"
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          💬 Post to Board
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {group.proposals.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Proposals ({group.proposals.length})
                          </h4>
                          <div className="space-y-2">
                            {group.proposals.map(p => (
                              <div key={p.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{p.title}</p>
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{p.summary}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`**${p.title}**\n\n${p.summary}`);
                                    toast.success('Copied');
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {group.actions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <ListTodo className="w-4 h-4" /> Actions ({group.actions.length})
                          </h4>
                          <div className="space-y-2">
                            {group.actions.map(a => (
                              <div key={a.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{a.title}</p>
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{a.description}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`**${a.title}**\n\n${a.description}`);
                                    toast.success('Copied');
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {group.tasks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Tasks ({group.tasks.length})
                          </h4>
                          <div className="space-y-2">
                            {group.tasks.map(t => (
                              <div key={t.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{t.issue_description}</p>
                                  <p className="text-xs text-slate-600 mt-1">{t.fix_type} • {t.issue_severity}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`**${t.issue_description}**\n\nType: ${t.fix_type}\nSeverity: ${t.issue_severity}`);
                                    toast.success('Copied');
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Implementation Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No implementation tasks yet.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                  <button onClick={() => handleTaskStatusToggle(task)} className="mt-0.5 shrink-0">
                    {task.implementation_status === 'deployed'
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : task.implementation_status === 'in_progress'
                      ? <Clock className="w-5 h-5 text-blue-500" />
                      : <AlertTriangle className="w-5 h-5 text-slate-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.implementation_status === 'deployed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.issue_description}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{task.product_name} · {task.board_member_app}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`**${task.issue_description}**\n\nProduct: ${task.product_name}\nAssigned: ${task.board_member_app}\nType: ${task.fix_type} | Severity: ${task.issue_severity}`);
                        toast.success('Copied to clipboard');
                      }}
                      className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-xs border ${PRIORITY_CONFIG[task.issue_severity]?.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {task.issue_severity || 'medium'}
                      </Badge>
                      <span className="text-xs text-slate-400">{task.fix_type}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}