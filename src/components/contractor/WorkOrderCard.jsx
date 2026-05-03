import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  issued: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-slate-100 text-slate-800'
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800'
};

const statusIcons = {
  issued: <Clock className="w-4 h-4" />,
  assigned: <Clock className="w-4 h-4" />,
  in_progress: <AlertCircle className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />
};

export default function WorkOrderCard({ workOrder, onSelect }) {
  const isOverdue = workOrder.scheduled_end_date && 
    new Date(workOrder.scheduled_end_date) < new Date() && 
    !['completed', 'invoiced'].includes(workOrder.status);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(workOrder)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{workOrder.work_order_number}</CardTitle>
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-slate-600 text-sm">{workOrder.task_description}</p>
          </div>
          <Badge className={statusColors[workOrder.status]} variant="secondary">
            <span className="flex items-center gap-1">
              {statusIcons[workOrder.status]}
              {workOrder.status.replace('_', ' ')}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Property & Ticket Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 font-medium uppercase">Property</p>
            <p className="text-sm font-medium text-slate-900">{workOrder.property_name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {workOrder.property_address}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium uppercase">Ticket</p>
            <p className="text-sm font-medium text-slate-900">{workOrder.ticket_number}</p>
            <Badge className={priorityColors[workOrder.priority]} variant="secondary" className="mt-1">
              {workOrder.priority} priority
            </Badge>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 font-medium uppercase">Scheduled Start</p>
            <p className="text-sm text-slate-900 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {workOrder.scheduled_start_date ? format(new Date(workOrder.scheduled_start_date), 'MMM d, yyyy') : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium uppercase">Due Date</p>
            <p className={`text-sm flex items-center gap-1 mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
              <Calendar className="w-3 h-3" />
              {workOrder.scheduled_end_date ? format(new Date(workOrder.scheduled_end_date), 'MMM d, yyyy') : 'Not set'}
            </p>
          </div>
        </div>

        {/* Cost Info */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-600 font-medium uppercase">Estimated Cost</p>
            <p className="text-sm font-semibold text-slate-900">£{workOrder.estimated_cost?.toFixed(2) || '0.00'}</p>
          </div>
          {workOrder.actual_cost && (
            <div>
              <p className="text-xs text-slate-600 font-medium uppercase">Actual Cost</p>
              <p className="text-sm font-semibold text-green-600">£{workOrder.actual_cost.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Click to Open */}
        <p className="text-xs text-slate-500 text-center pt-2">Click to view details & manage</p>
      </CardContent>
    </Card>
  );
}