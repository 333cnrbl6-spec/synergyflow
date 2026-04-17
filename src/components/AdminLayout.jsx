import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FileText, Headphones, Settings, LogOut, Menu, X, Gavel, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [user, setUser] = useState(null);

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { label: 'CRM', icon: Users, path: '/admin/crm' },
    { label: 'Subscriptions', icon: FileText, path: '/admin/subscriptions' },
    { label: 'Support', icon: Headphones, path: '/admin/support' },
    { label: 'Board', icon: Gavel, path: '/admin/board' },
    { label: 'Boardroom', icon: Gavel, path: '/admin/board-communication' },
    { label: "Chairman's Zone", icon: Crown, path: '/admin/chairman-zone' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r bg-card transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-primary">Admin Hub</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={`w-full justify-start ${!sidebarOpen && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-destructive hover:text-destructive ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b bg-card p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {menuItems.find((m) => isActive(m.path))?.label || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Help
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}