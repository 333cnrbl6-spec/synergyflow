import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter } from 'lucide-react';

const statusColors = {
  lead: 'bg-slate-100 text-slate-800',
  qualified: 'bg-blue-100 text-blue-800',
  engaged: 'bg-green-100 text-green-800',
  demo_scheduled: 'bg-purple-100 text-purple-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiating: 'bg-yellow-100 text-yellow-800',
  won: 'bg-green-600 text-white',
  lost: 'bg-red-100 text-red-800',
};

export default function CRMDashboard() {
  const [prospects, setProspects] = useState([]);
  const [filteredProspects, setFilteredProspects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const data = await base44.entities.Prospect.list('-created_date', 100);
        setProspects(data);
        setFilteredProspects(data);
      } catch (error) {
        console.error('Error fetching prospects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspects();
  }, []);

  useEffect(() => {
    let filtered = prospects;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProspects(filtered);
  }, [searchTerm, statusFilter, prospects]);

  const pipelineStages = ['lead', 'qualified', 'engaged', 'demo_scheduled', 'proposal', 'negotiating', 'won', 'lost'];
  const stageCounts = pipelineStages.map((stage) => ({
    stage,
    count: prospects.filter((p) => p.status === stage).length,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">CRM Dashboard</h1>
          <p className="text-muted-foreground">Manage prospects and sales pipeline</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Prospect
        </Button>
      </div>

      {/* Sales Pipeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {stageCounts.map((item) => (
              <div key={item.stage} className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{item.count}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {item.stage.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, contact, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg bg-background"
            >
              <option value="all">All Statuses</option>
              {pipelineStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Prospects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prospects ({filteredProspects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading prospects...</div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No prospects found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{prospect.company_name}</TableCell>
                      <TableCell>{prospect.contact_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{prospect.email}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[prospect.status] || 'bg-slate-100'}>
                          {prospect.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {prospect.deal_value ? `$${prospect.deal_value.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prospect.assigned_sales_agent || '-'}
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/prospects/${prospect.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
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