import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  past_due: 'bg-orange-100 text-orange-800',
};

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await base44.entities.Subscription.list('-start_date', 100);
        setSubscriptions(data);
        setFilteredSubs(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.customer_company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubs(filtered);
  }, [searchTerm, subscriptions]);

  const totalMRR = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.monthly_price || 0), 0) / 100;

  const stats = {
    totalActive: subscriptions.filter((s) => s.status === 'active').length,
    totalPaused: subscriptions.filter((s) => s.status === 'paused').length,
    totalCancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">Manage all customer subscriptions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">New Subscription</Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPaused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({filteredSubs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No subscriptions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubs.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{sub.customer_company}</TableCell>
                      <TableCell className="text-sm">{sub.customer_email}</TableCell>
                      <TableCell>{sub.product_id}</TableCell>
                      <TableCell className="text-sm">{sub.tier}</TableCell>
                      <TableCell>${(sub.monthly_price / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[sub.status] || 'bg-slate-100'}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(sub.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(sub.renewal_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}