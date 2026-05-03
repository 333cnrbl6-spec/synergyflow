import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Filter, Plus, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  generateWorkOrderNumber,
  calculateSLAStatus,
  formatSLAStatus
} from '@/lib/maintenanceUtils';

/**
 * MaintenanceDashboard — landlords manage tickets and create work orders
 */
export default function MaintenanceDashboard() {
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['maintenanceTickets'],
    queryFn: () => base44.entities.MaintenanceTicket.list()
  });

  const updateTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTicket.update(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTickets'] });
      setSelectedTicket(null);
      toast.success('Ticket updated');
    }
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTickets'] });
      setShowWorkOrderForm(false);
      setSelectedTicket(null);
      toast.success('Work order created');
    }
  });

  const handleStatusChange = (ticket, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_date = new Date().toISOString();
    }
    updateTicketMutation.mutate({ id: ticket.id, updates });
  };

  const handleCreateWorkOrder = async (formData) => {
    const workOrderNumber = generateWorkOrderNumber();
    await createWorkOrderMutation.mutateAsync({
      work_order_number: workOrderNumber,
      maintenance_ticket_id: selectedTicket.id,
      ticket_number: selectedTicket.ticket_number,
      property_id: selectedTicket.property_id,
      property_name: selectedTicket.property_name,
      ...formData,
      issued_date: new Date().toISOString(),
      status: 'issued'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.includes(searchTerm);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Summary stats
  const stats = {
    pending: tickets.filter(t => t.status === 'pending').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    overdue: tickets.filter(t => calculateSLAStatus(t.priority, t.reported_date) === 'overdue').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance Management</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold">{stats.in_progress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Completed</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Overdue</p>
              <p className="text-3xl font-bold">{stats.overdue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search by ticket or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-48"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(TICKET_STATUSES).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.icon} {info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(TICKET_PRIORITIES).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => {
            const categoryInfo = TICKET_CATEGORIES[ticket.category];
            const priorityInfo = TICKET_PRIORITIES[ticket.priority];
            const statusInfo = TICKET_STATUSES[ticket.status];
            const slaStatus = calculateSLAStatus(ticket.priority, ticket.reported_date);

            return (
              <Card key={ticket.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{categoryInfo?.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{ticket.title}</h3>
                            <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                              {ticket.ticket_number}
                            </code>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                        <Badge className={priorityInfo?.color}>{priorityInfo?.label}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">
                          {categoryInfo?.label}
                        </Badge>
                        {ticket.location && (
                          <Badge variant="outline">{ticket.location}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-600">
                        <span>🏠 {ticket.property_name}</span>
                        <span>👤 {ticket.tenant_name}</span>
                        {slaStatus && <span>{formatSLAStatus(slaStatus)}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Status</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {Object.entries(TICKET_STATUSES).map(([key, info]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleStatusChange(ticket, key)}
                            >
                              {info.icon} {info.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowWorkOrderForm(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Work Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Work Order Form Modal */}
      {showWorkOrderForm && selectedTicket && (
        <WorkOrderForm
          ticket={selectedTicket}
          onSubmit={handleCreateWorkOrder}
          onCancel={() => {
            setShowWorkOrderForm(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * WorkOrderForm — create work order for a ticket
 */
function WorkOrderForm({ ticket, onSubmit, onCancel }) {
  const [contractorName, setContractorName] = useState('');
  const [contractorEmail, setContractorEmail] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [taskDescription, setTaskDescription] = useState(ticket.description);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [scheduledStartDate, setScheduledStartDate] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contractorName.trim() || !taskDescription.trim()) {
      toast.error('Contractor name and task description required');
      return;
    }

    onSubmit({
      contractor_name: contractorName,
      contractor_email: contractorEmail,
      contractor_phone: contractorPhone,
      task_description: taskDescription,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : 0,
      scheduled_start_date: scheduledStartDate,
      tenant_access_instructions: accessInstructions
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Work Order - {ticket.ticket_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contractor Name"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="Company or name"
                required
              />
              <Input
                label="Contractor Email"
                type="email"
                value={contractorEmail}
                onChange={(e) => setContractorEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <Input
              label="Contractor Phone"
              value={contractorPhone}
              onChange={(e) => setContractorPhone(e.target.value)}
              placeholder="Phone number"
            />

            <Textarea
              label="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated Cost (£)"
                type="number"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Scheduled Start Date"
                type="date"
                value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
              />
            </div>

            <Textarea
              label="Access Instructions for Contractor"
              value={accessInstructions}
              onChange={(e) => setAccessInstructions(e.target.value)}
              placeholder="E.g., key location, alarm code, etc."
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Create Work Order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}