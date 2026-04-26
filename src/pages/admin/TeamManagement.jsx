import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Users2, Package } from 'lucide-react';
import TeamMemberInvite from '@/components/TeamManagement/TeamMemberInvite';
import TeamMembersList from '@/components/TeamManagement/TeamMembersList';
import ProductTeamView from '@/components/TeamManagement/ProductTeamView';

export default function TeamManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, pendingInvites: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('Not authenticated');
      
      setCurrentUser(user);

      // Load products
      const productList = await base44.entities.Product.list();
      setProducts(productList);

      // Load team stats
      const members = await base44.entities.TeamMember.filter({
        organization_email: user.email
      });

      const active = members.filter(m => m.status === 'active').length;
      const pending = members.filter(m => m.status === 'pending').length;

      setStats({
        totalMembers: members.length,
        activeMembers: active,
        pendingInvites: pending
      });
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSent = () => {
    setRefreshKey(prev => prev + 1);
    loadData();
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-600 mt-3">Loading team management...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">Unable to load team management. Please refresh and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Management</h1>
        <p className="text-slate-600">Manage your team, assign roles, and control product access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Total Members"
          value={stats.totalMembers}
          color="bg-blue-600"
        />
        <StatCard
          icon={Users2}
          label="Active Members"
          value={stats.activeMembers}
          color="bg-green-600"
        />
        <StatCard
          icon={Package}
          label="Pending Invites"
          value={stats.pendingInvites}
          color="bg-yellow-600"
        />
      </div>

      {/* Invite Section */}
      <div>
        <TeamMemberInvite
          products={products}
          onInviteSent={handleInviteSent}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-4 border-b-2 font-medium transition ${
              activeTab === 'members'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-4 border-b-2 font-medium transition ${
              activeTab === 'products'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            By Product
          </button>
        </div>
      </div>

      {/* Content */}
      <div key={refreshKey}>
        {activeTab === 'members' && (
          <TeamMembersList
            organizationEmail={currentUser.email}
            onMemberUpdated={loadData}
          />
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              View active team members assigned to each product
            </div>
            <ProductTeamView
              organizationEmail={currentUser.email}
              products={products}
            />
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Team Management Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            <strong>Admin:</strong> Full access to all features, manage team members and billing
          </p>
          <p>
            <strong>Manager:</strong> Can invite and manage team members, assign product access
          </p>
          <p>
            <strong>User:</strong> Access only to assigned products, cannot manage team
          </p>
          <p className="mt-4">
            💡 <strong>Pro Tip:</strong> Assign specific products to users to control what they can access. Admins have access to all products by default.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}