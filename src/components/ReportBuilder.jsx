import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportBuilder({ onSave, onCancel, initialReport = null }) {
  const [formData, setFormData] = useState(initialReport || {
    report_name: '',
    description: '',
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: 1,
    send_time: '09:00',
    recipients: [],
    include_portfolio_metrics: true,
    include_churn_analysis: true,
    include_benchmark_comparison: true,
    include_product_breakdown: false,
    include_action_items: true,
    status: 'active'
  });
  const [recipientInput, setRecipientInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRecipient = () => {
    if (!recipientInput.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientInput)) {
      toast.error('Invalid email address');
      return;
    }
    if (formData.recipients.includes(recipientInput)) {
      toast.error('Email already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, recipientInput]
    }));
    setRecipientInput('');
  };

  const removeRecipient = (email) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.report_name || formData.recipients.length === 0) {
      toast.error('Report name and at least one recipient required');
      return;
    }

    setSaving(true);
    try {
      if (initialReport?.id) {
        await base44.entities.Report.update(initialReport.id, formData);
        toast.success('Report updated successfully');
      } else {
        await base44.entities.Report.create(formData);
        toast.success('Report created successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialReport ? 'Edit Report' : 'Create New Report'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Report Details</h3>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Report Name *</label>
            <Input
              placeholder="e.g., Weekly Executive Summary"
              value={formData.report_name}
              onChange={(e) => handleInputChange('report_name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Description</label>
            <Input
              placeholder="Optional description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Frequency</label>
              <Select value={formData.frequency} onValueChange={(val) => handleInputChange('frequency', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequency === 'weekly' ? (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Day of Week</label>
                <Select value={String(formData.day_of_week)} onValueChange={(val) => handleInputChange('day_of_week', parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                      <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Day of Month</label>
                <Select value={String(formData.day_of_month)} onValueChange={(val) => handleInputChange('day_of_month', parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Send Time (24h)</label>
              <Input
                type="time"
                value={formData.send_time}
                onChange={(e) => handleInputChange('send_time', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Recipients *</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Email address"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
            />
            <Button onClick={addRecipient} variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.recipients.map(email => (
              <div key={email} className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {email}
                <button onClick={() => removeRecipient(email)} className="hover:text-blue-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Report Sections</h3>
          <div className="space-y-3">
            {[
              { key: 'include_portfolio_metrics', label: 'Portfolio Metrics (MRR, subscriptions, products)' },
              { key: 'include_churn_analysis', label: 'Churn Analysis (rates, retention, trends)' },
              { key: 'include_benchmark_comparison', label: 'Benchmark Comparisons (vs industry)' },
              { key: 'include_product_breakdown', label: 'Product Breakdown (per-product metrics)' },
              { key: 'include_action_items', label: 'Open Action Items' }
            ].map(section => (
              <label key={section.key} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData[section.key]}
                  onChange={(e) => handleInputChange(section.key, e.target.checked)}
                />
                <span className="text-sm text-slate-700">{section.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {initialReport ? 'Update Report' : 'Create Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}