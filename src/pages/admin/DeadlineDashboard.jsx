import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, AlertCircle, CheckCircle2, Clock, TrendingUp, Filter, 
  Plus, Trash2, Edit, Bell, CalendarDays, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300'
};

const DOMAIN_COLORS = {
  property: 'bg-blue-100 text-blue-800',
  legal: 'bg-purple-100 text-purple-800',
  charity: 'bg-pink-100 text-pink-800',
  conservation: 'bg-green-100 text-green-800',
  general: 'bg-slate-100 text-slate-800'
};

export default function DeadlineDashboard() {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    deadline_type: 'custom',
    entity_name: '',
    entity_id: '',
    deadline_date: '',
    domain: 'general',
    priority: 'medium',
    description: '',
    assigned_to: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch deadlines
  const { data: deadlines, isLoading } = useQuery({
    queryKey: ['compliance-deadlines'],
    queryFn: () => base44.entities.ComplianceDeadline.list('-deadline_date')
  });

  // Mutation to create deadline
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const notificationSchedule = [
        { days_before: 30, sent: false },
        { days_before: 14, sent: false },
        { days_before: 7, sent: false }
      ];
      return base44.entities.ComplianceDeadline.create({
        ...data,
        notification_schedule: notificationSchedule
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-deadlines'] });
      setShowAddDialog(false);
      toast.success('Deadline created successfully');
      setNewDeadline({
        deadline_type: 'custom',
        entity_name: '',
        entity_id: '',
        deadline_date: '',
        domain: 'general',
        priority: 'medium',
        description: '',
        assigned_to: '',
        notes: ''
      });
    }
  });

  // Mutation to update deadline
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ComplianceDeadline.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-deadlines'] });
      toast.success('Deadline updated');
    }
  });

  // Mutation to delete deadline
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ComplianceDeadline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-deadlines'] });
      toast.success('Deadline deleted');
    }
  });

  // Calculate metrics
  const metrics = calculateMetrics(deadlines);

  const filteredDeadlines = (deadlines || []).filter(d => {
    const domainMatch = selectedDomain === 'all' || d.domain === selectedDomain;
    const statusMatch = selectedStatus === 'all' || d.status === selectedStatus;
    return domainMatch && statusMatch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newDeadline);
  };

  const handleMarkComplete = (deadline) => {
    updateMutation.mutate({
      id: deadline.id,
      data: {
        status: 'completed',
        completed_date: new Date().toISOString()
      }
    });
  };

  const handleDismiss = (deadline) => {
    updateMutation.mutate({
      id: deadline.id,
      data: { status: 'dismissed' }
    });
  };

  const getDaysRemaining = (deadlineDate) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-6 h-6 text-indigo-300" />
              <h1 className="text-2xl font-bold">Proactive Deadline Tracker</h1>
            </div>
            <p className="text-indigo-200 text-sm max-w-2xl">
              Track critical compliance deadlines across all domains. Automated notifications sent 30, 14, and 7 days before each deadline.
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white text-indigo-900 hover:bg-indigo-50 gap-2">
                <Plus className="w-4 h-4" />
                Add Deadline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Compliance Deadline</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Deadline Type</Label>
                    <Select value={newDeadline.deadline_type} onValueChange={(v) => setNewDeadline({...newDeadline, deadline_type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="limitation_date">Limitation Date</SelectItem>
                        <SelectItem value="tenancy_expiry">Tenancy Expiry</SelectItem>
                        <SelectItem value="grant_deadline">Grant Deadline</SelectItem>
                        <SelectItem value="report_due">Report Due</SelectItem>
                        <SelectItem value="audit_due">Audit Due</SelectItem>
                        <SelectItem value="renewal_date">Renewal Date</SelectItem>
                        <SelectItem value="review_date">Review Date</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Domain</Label>
                    <Select value={newDeadline.domain} onValueChange={(v) => setNewDeadline({...newDeadline, domain: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="charity">Charity</SelectItem>
                        <SelectItem value="conservation">Conservation</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Entity Type</Label>
                    <Input 
                      value={newDeadline.entity_name}
                      onChange={(e) => setNewDeadline({...newDeadline, entity_name: e.target.value})}
                      placeholder="e.g., Case, TenancyAgreement"
                    />
                  </div>
                  <div>
                    <Label>Entity ID</Label>
                    <Input 
                      value={newDeadline.entity_id}
                      onChange={(e) => setNewDeadline({...newDeadline, entity_id: e.target.value})}
                      placeholder="Record ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Deadline Date</Label>
                    <Input 
                      type="date"
                      value={newDeadline.deadline_date}
                      onChange={(e) => setNewDeadline({...newDeadline, deadline_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newDeadline.priority} onValueChange={(v) => setNewDeadline({...newDeadline, priority: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={newDeadline.description}
                    onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                    placeholder="What needs to be done?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Assigned To (Email)</Label>
                  <Input 
                    type="email"
                    value={newDeadline.assigned_to}
                    onChange={(e) => setNewDeadline({...newDeadline, assigned_to: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={newDeadline.notes}
                    onChange={(e) => setNewDeadline({...newDeadline, notes: e.target.value})}
                    placeholder="Additional context or requirements"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Create Deadline
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Deadlines This Month"
          value={metrics.thisMonth}
          icon={CalendarDays}
          color="blue"
        />
        <KPICard
          title="Critical (7 Days)"
          value={metrics.critical}
          icon={AlertCircle}
          color="red"
        />
        <KPICard
          title="Completed"
          value={metrics.completed}
          icon={CheckCircle2}
          color="green"
        />
        <KPICard
          title="Overdue"
          value={metrics.overdue}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="charity">Charity</SelectItem>
            <SelectItem value="conservation">Conservation</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deadlines List */}
      <div className="grid gap-4">
        {filteredDeadlines.map((deadline) => {
          const daysRemaining = getDaysRemaining(deadline.deadline_date);
          const isUrgent = daysRemaining <= 7 && deadline.status === 'pending';
          
          return (
            <Card key={deadline.id} className={`border-2 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">
                        {deadline.description || deadline.deadline_type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <Badge className={PRIORITY_COLORS[deadline.priority]}>
                        {deadline.priority.toUpperCase()}
                      </Badge>
                      <Badge className={DOMAIN_COLORS[deadline.domain]}>
                        {deadline.domain.toUpperCase()}
                      </Badge>
                      {deadline.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800">COMPLETED</Badge>
                      )}
                      {deadline.status === 'missed' && (
                        <Badge className="bg-red-100 text-red-800">MISSED</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(deadline.deadline_date).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className={daysRemaining < 0 ? 'text-red-600 font-semibold' : ''}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : 
                           daysRemaining === 0 ? 'Due today' : 
                           `${daysRemaining} days remaining`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{deadline.entity_name}</span>
                      </div>
                      {deadline.assigned_to && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Bell className="w-4 h-4" />
                          <span>{deadline.assigned_to}</span>
                        </div>
                      )}
                    </div>

                    {/* Notification Schedule */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Notifications:</span>
                      {[30, 14, 7].map(days => {
                        const notification = deadline.notification_schedule?.find(n => n.days_before === days);
                        const isSent = notification?.sent;
                        const isDue = daysRemaining === days && !isSent;
                        
                        return (
                          <div key={days} className="flex items-center gap-1">
                            <Badge variant="outline" className={`text-xs ${
                              isSent ? 'bg-green-100 text-green-800 border-green-300' :
                              isDue ? 'bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {days}d {isSent ? '✓' : isDue ? '⏰' : '○'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>

                    {deadline.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2 rounded">
                        {deadline.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {deadline.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleMarkComplete(deadline)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(deadline)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredDeadlines.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No deadlines found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <Icon className={`w-5 h-5 opacity-70`} />
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function calculateMetrics(deadlines) {
  if (!deadlines) return { thisMonth: 0, critical: 0, completed: 0, overdue: 0 };

  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    thisMonth: deadlines.filter(d => {
      const deadlineDate = new Date(d.deadline_date);
      return deadlineDate <= endOfMonth && d.status !== 'completed';
    }).length,
    critical: deadlines.filter(d => {
      const daysRemaining = Math.ceil((new Date(d.deadline_date) - today) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 7 && d.status === 'pending';
    }).length,
    completed: deadlines.filter(d => d.status === 'completed').length,
    overdue: deadlines.filter(d => {
      const daysRemaining = Math.ceil((new Date(d.deadline_date) - today) / (1000 * 60 * 60 * 24));
      return daysRemaining < 0 && d.status === 'pending';
    }).length
  };
}