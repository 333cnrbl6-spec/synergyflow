import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_GROUPS = [
  {
    label: 'Overview',
    icon: '📊',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '📊' },
      { label: 'Portfolio', href: '/admin/portfolio', icon: '💼' },
      { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
    ],
  },
  {
    label: 'Sales & Revenue',
    icon: '💰',
    items: [
      { label: 'CRM', href: '/admin/crm', icon: '👥' },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: '💳' },
      { label: 'Support', href: '/admin/support', icon: '🆘' },
      { label: 'Reports', href: '/admin/reports', icon: '📄' },
    ],
  },
  {
    label: 'Board',
    icon: '🏛️',
    items: [
      { label: 'Board Room', href: '/admin/board', icon: '🏛️' },
      { label: 'Communication', href: '/admin/board-communication', icon: '💬' },
      { label: 'Chairman Zone', href: '/admin/chairman-zone', icon: '👑' },
      { label: 'Board Impact', href: '/admin/board-impact', icon: '📈' },
      { label: 'Board Insights', href: '/admin/board-insights', icon: '🔍' },
      { label: 'Board Consensus', href: '/admin/consensus', icon: '🗳️' },
      { label: 'Next Series Vote', href: '/admin/next-series', icon: '📋' },
      { label: 'Post-Execution Strategy', href: '/admin/post-execution', icon: '📊' },
      { label: 'Reporting', href: '/admin/reporting', icon: '📋' },
    ],
  },
  {
    label: 'Strategy & Launch',
    icon: '🚀',
    items: [
      { label: 'Strategy', href: '/admin/strategy', icon: '📋' },
      { label: 'Unified Launch', href: '/admin/launch', icon: '🚀' },
      { label: 'Joint Ventures', href: '/admin/joint-ventures', icon: '🤝' },
      { label: 'Buyer Handover Pack', href: '/admin/buyer-handover', icon: '📦' },
      { label: 'Confidential Teaser', href: '/admin/teaser', icon: '🔒' },
      { label: 'Architecture Principles', href: '/admin/architecture', icon: '🏗️' },
      { label: 'App Rollout Workbench', href: '/admin/rollout', icon: '🚀' },
      { label: 'App Implementation Briefs', href: '/admin/app-briefs', icon: '📋' },
      { label: 'Compliance Monitor', href: '/admin/compliance', icon: '🛡️' },
      { label: 'Deadline Tracker', href: '/admin/deadlines', icon: '📅' },
    ],
  },
  {
    label: 'Implementation',
    icon: '⚙️',
    items: [
      { label: 'Implementation', href: '/admin/implementation', icon: '🔧' },
      { label: 'Backlog', href: '/admin/backlog', icon: '🗂️' },
      { label: 'Verification', href: '/admin/verification', icon: '✅' },
    ],
  },
  {
    label: 'Settings',
    icon: '⚙️',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  },
];

function NavGroup({ group, sidebarOpen, location, navigate, defaultOpen }) {
  const isGroupActive = group.items.some(item => location.pathname === item.href);
  const [open, setOpen] = useState(defaultOpen || isGroupActive);

  return (
    <div>
      {sidebarOpen ? (
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
            isGroupActive ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>{group.icon}</span>
            {group.label}
          </span>
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition ${
            isGroupActive ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'
          }`}
          title={group.label}
        >
          <span className="text-lg">{group.icon}</span>
        </button>
      )}

      {open && (
        <div className={`mt-1 space-y-0.5 ${sidebarOpen ? 'ml-2' : ''}`}>
          {group.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition text-sm ${
                location.pathname === item.href
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-base">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  // Find current page label for top bar
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentPage = allItems.find(item => item.href === location.pathname);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-60' : 'w-16'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        {/* Toggle */}
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen && <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">Admin</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <NavGroup
              key={group.label}
              group={group}
              sidebarOpen={sidebarOpen}
              location={location}
              navigate={navigate}
              defaultOpen={group.items.some(i => location.pathname === i.href)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200">
          <Button
            onClick={() => base44.auth.logout()}
            variant="outline"
            size="sm"
            className="w-full gap-2 text-slate-700"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{currentPage?.label || 'Admin'}</h1>
          {user && <span className="text-sm text-slate-600">{user.full_name}</span>}
        </div>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}