import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, generateTicketNumber } from '@/lib/maintenanceUtils';

/**
 * MaintenanceReportForm — tenant reports a maintenance issue
 */
export default function MaintenanceReportForm({ property, tenant, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0); // Prevent duplicate submissions
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTickets'] });
      toast.success('Maintenance request submitted successfully');
      setTitle('');
      setDescription('');
      setCategory('other');
      setPriority('medium');
      setLocation('');
      setNotes('');
      setImageUrl('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(result.file_url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions (debounce)
    const now = Date.now();
    if (now - lastSubmitTime < 1000) {
      toast.error('Please wait before submitting again');
      return;
    }
    setLastSubmitTime(now);

    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    // Validate tenant info exists
    if (!tenant?.id || !tenant?.email) {
      toast.error('Tenant information missing');
      return;
    }

    // Validate property info exists
    if (!property?.id) {
      toast.error('Property information missing');
      return;
    }

    const ticketNumber = generateTicketNumber();

    await createMutation.mutateAsync({
      property_id: property.id,
      property_name: property.name,
      tenant_id: tenant.id,
      tenant_name: tenant.full_name,
      tenant_email: tenant.email,
      tenant_phone: tenant.phone,
      ticket_number: ticketNumber,
      title,
      description,
      category,
      priority,
      location,
      tenant_notes: notes,
      image_url: imageUrl,
      reported_date: new Date().toISOString(),
      status: 'pending'
    });
  };

  const categoryInfo = TICKET_CATEGORIES[category];
  const priorityInfo = TICKET_PRIORITIES[priority];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report a Maintenance Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Issue Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaky tap in kitchen"
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_CATEGORIES).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.icon} {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_PRIORITIES).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location in Property</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Kitchen, Master Bedroom"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={5}
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Details</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other information that might help (e.g., when did it start?)"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photo (optional)</label>
            {imageUrl ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <img src={imageUrl} alt="Issue" className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Photo uploaded</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition">
                <Upload className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-600">Click to upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={createMutation.isPending || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}