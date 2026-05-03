import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WorkOrderDetail({ workOrder, onClose, onUpdate }) {
  const [status, setStatus] = useState(workOrder.status);
  const [actualCost, setActualCost] = useState(workOrder.actual_cost || '');
  const [notes, setNotes] = useState(workOrder.notes || '');
  const [invoiceUrl, setInvoiceUrl] = useState(workOrder.invoice_url || '');
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkOrder.update(workOrder.id, data),
    onSuccess: () => {
      toast.success('Work order updated');
      onUpdate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    await updateMutation.mutateAsync({
      status: newStatus,
      actual_start_date: newStatus === 'in_progress' && !workOrder.actual_start_date ? new Date().toISOString() : workOrder.actual_start_date,
      actual_completion_date: newStatus === 'completed' ? new Date().toISOString() : workOrder.actual_completion_date
    });
  };

  const handleSaveDetails = async () => {
    if (!actualCost) {
      toast.error('Please enter the actual cost');
      return;
    }

    await updateMutation.mutateAsync({
      actual_cost: parseFloat(actualCost),
      notes,
      invoice_url: invoiceUrl
    });
  };

  const handleUploadInvoice = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept PDF, images, or documents
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, image, or document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Invoice must be under 10MB');
      return;
    }

    try {
      setUploading(true);
      const result = await base44.integrations.Core.UploadFile({ file });
      setInvoiceUrl(result.file_url);
      toast.success('Invoice uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isOverdue = workOrder.scheduled_end_date && 
    new Date(workOrder.scheduled_end_date) < new Date() && 
    !['completed', 'invoiced'].includes(status);

  const canAccept = ['issued', 'assigned'].includes(status);
  const canStartWork = status === 'assigned';
  const canComplete = status === 'in_progress';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white border-b flex items-center justify-between">
          <CardTitle>{workOrder.work_order_number}</CardTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Badge className="text-base px-3 py-1 w-full text-center justify-center">
                {status.replace('_', ' ')}
              </Badge>
              {isOverdue && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  This job is overdue
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <Badge className="text-base px-3 py-1 w-full text-center justify-center">
                {workOrder.priority}
              </Badge>
            </div>
          </div>

          {/* Property & Ticket Info */}
          <div className="space-y-2 p-4 bg-slate-50 rounded">
            <h3 className="font-semibold text-slate-900">Property & Ticket</h3>
            <p className="text-sm"><span className="text-slate-600">Property:</span> {workOrder.property_name}</p>
            <p className="text-sm"><span className="text-slate-600">Address:</span> {workOrder.property_address}</p>
            <p className="text-sm"><span className="text-slate-600">Ticket:</span> {workOrder.ticket_number}</p>
            <p className="text-sm"><span className="text-slate-600">Task:</span> {workOrder.task_description}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Scheduled Start</label>
              <p className="text-sm text-slate-900">
                {workOrder.scheduled_start_date ? format(new Date(workOrder.scheduled_start_date), 'MMM d, yyyy') : 'Not set'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
              <p className="text-sm text-slate-900">
                {workOrder.scheduled_end_date ? format(new Date(workOrder.scheduled_end_date), 'MMM d, yyyy') : 'Not set'}
              </p>
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost</label>
              <p className="text-sm font-semibold text-slate-900">£{workOrder.estimated_cost?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Actual Cost *</label>
              <Input
                type="number"
                step="0.01"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className="font-semibold"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Work Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document what was done, any issues, next steps, etc."
              rows={4}
            />
          </div>

          {/* Invoice Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Document</label>
            {invoiceUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Invoice uploaded</p>
                  <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline">
                    View document
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setInvoiceUrl('')}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition">
                <Upload className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-600">Click to upload invoice (PDF, image, or document)</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleUploadInvoice}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {canAccept && (
              <Button
                onClick={() => handleStatusChange('assigned')}
                disabled={updateMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Accept Job
              </Button>
            )}

            {canStartWork && (
              <Button
                onClick={() => handleStatusChange('in_progress')}
                disabled={updateMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Start Work
              </Button>
            )}

            {canComplete && (
              <Button
                onClick={() => handleStatusChange('completed')}
                disabled={updateMutation.isPending || !actualCost}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mark Complete
              </Button>
            )}

            <Button
              onClick={handleSaveDetails}
              disabled={updateMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              Save Details
            </Button>

            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}