import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, FileText, Headphones, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalProspects: 0,
    openTickets: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subscriptions, prospects, tickets] = await Promise.all([
          base44.entities.Subscription.list(),
          base44.entities.Prospect.list(),
          base44.entities.SupportTicket.list(),
        ]);

        const activeCount = subscriptions.filter(s => s.status === 'active').length;
        const totalRev = subscriptions.reduce((sum, s) => sum + (s.monthly_price || 0), 0);
        const openCount = tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;

        setStats({
          totalRevenue: totalRev / 100, // Convert from cents
          activeSubscriptions: activeCount,
          totalProspects: prospects.length,
          openTickets: openCount,
        });

        // Mock revenue chart data
        setRevenueData([
          { month: 'Jan', revenue: 4500 },
          { month: 'Feb', revenue: 5200 },
          { month: 'Mar', revenue: 6100 },
          { month: 'Apr', revenue: 6800 },
          { month: 'May', revenue: 7200 },
          { month: 'Jun', revenue: 8100 },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-sm mt-1">
            {trend > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>{Math.abs(trend)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={DollarSign}
              label="Monthly Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              trend={12}
              color="bg-green-600"
            />
            <StatCard
              icon={Users}
              label="Active Subscriptions"
              value={stats.activeSubscriptions}
              trend={8}
              color="bg-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Prospects"
              value={stats.totalProspects}
              trend={15}
              color="bg-purple-600"
            />
            <StatCard
              icon={Headphones}
              label="Open Support Tickets"
              value={stats.openTickets}
              trend={-3}
              color="bg-orange-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0a0a0a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Active', value: stats.activeSubscriptions },
                      { name: 'Paused', value: 2 },
                      { name: 'Cancelled', value: 1 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0a0a0a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90">New Prospect</Button>
                <Button variant="outline">View All Subscriptions</Button>
                <Button variant="outline">Manage Invoices</Button>
                <Button variant="outline">View Support Queue</Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}