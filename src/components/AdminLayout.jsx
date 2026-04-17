import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        console.error(e);
      }
    };
    getUser();
  }, []);

  const navItems = [
    { label: 'Admin', href: '/admin', icon: '📊' },
    { label: 'Portfolio', href: '/admin/portfolio', icon: '💼' },
    { label: 'CRM', href: '/admin/crm', icon: '👥' },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: '💳' },
    { label: 'Support', href: '/admin/support', icon: '🆘' },
    { label: 'Board Room', href: '/admin/board', icon: '🏛️' },
    { label: 'Board Communication', href: '/admin/board-communication', icon: '💬' },
    { label: 'Strategy', href: '/admin/strategy', icon: '📋' },
    { label: 'Unified Launch', href: '/admin/launch', icon: '🚀' },
    { label: 'Board Impact', href: '/admin/board-impact', icon: '📈' },
    { label: 'Chairman Zone', href: '/admin/chairman-zone', icon: '👑' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  const currentPage = navItems.find(item => item.href === location.pathname);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                location.pathname === item.href
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
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
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{currentPage?.label || 'Admin'}</h1>
            </div>
            {user && <span className="text-sm text-slate-600">{user.full_name}</span>}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}