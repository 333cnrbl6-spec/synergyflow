import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function BenchmarkForm({ onSave, products = [] }) {
  const [formData, setFormData] = useState({
    benchmark_name: '',
    industry: '',
    metric_type: '',
    product_id: '',
    product_name: '',
    value: '',
    source: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('manual');

  const metricTypes = [
    { value: 'churn_rate', label: 'Churn Rate (%)', unit: '%' },
    { value: 'retention_rate', label: 'Retention Rate (%)', unit: '%' },
    { value: 'mrr', label: 'Monthly Recurring Revenue ($)', unit: '$' },
    { value: 'arpu', label: 'Average Revenue Per User ($)', unit: '$' },
    { value: 'cltv', label: 'Customer Lifetime Value ($)', unit: '$' }
  ];

  const sources = [
    'Stripe',
    'SaaStr',
    'Capterra',
    'G2 Research',
    'Internal Research',
    'Industry Report',
    'Competitor Analysis',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (productId) => {
    const selected = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      product_id: productId,
      product_name: selected?.name || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.benchmark_name || !formData.metric_type || !formData.value || !formData.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Benchmark.create({
        benchmark_name: formData.benchmark_name,
        industry: formData.industry || null,
        metric_type: formData.metric_type,
        product_id: formData.product_id || null,
        product_name: formData.product_name || null,
        value: parseFloat(formData.value),
        source: formData.source,
        notes: formData.notes || null
      });
      
      toast.success('Benchmark added successfully');
      setFormData({
        benchmark_name: '',
        industry: '',
        metric_type: '',
        product_id: '',
        product_name: '',
        value: '',
        source: '',
        notes: ''
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving benchmark:', error);
      toast.error('Failed to save benchmark');
    } finally {
      setSaving(false);
    }
  };

  const getMetricUnit = () => {
    const metric = metricTypes.find(m => m.value === formData.metric_type);
    return metric?.unit || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Add Industry Benchmark</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="text-xs"
            >
              Manual Entry
            </Button>
            <Button
              size="sm"
              variant={mode === 'upload' ? 'default' : 'outline'}
              onClick={() => setMode('upload')}
              className="text-xs gap-1"
            >
              <Upload className="w-3 h-3" />
              CSV Upload
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {mode === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Benchmark Name *
                </label>
                <Input
                  placeholder="e.g., SaaS Industry Average Q1 2026"
                  value={formData.benchmark_name}
                  onChange={(e) => handleInputChange('benchmark_name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Industry / Segment
                </label>
                <Input
                  placeholder="e.g., SaaS, Enterprise, SMB"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Metric Type *
                </label>
                <Select value={formData.metric_type} onValueChange={(val) => handleInputChange('metric_type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Value * {getMetricUnit() && `(${getMetricUnit()})`}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5.2"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Product (Optional)
                </label>
                <Select value={formData.product_id} onValueChange={handleProductSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Portfolio-wide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Portfolio-wide Benchmark</SelectItem>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Source *
                </label>
                <Select value={formData.source} onValueChange={(val) => handleInputChange('source', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(s => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Notes
              </label>
              <Textarea
                placeholder="e.g., Based on 2025 State of SaaS report, applies to B2B products only"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="resize-none h-20"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Benchmark
            </Button>
          </form>
        ) : (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-3">CSV upload feature coming soon</p>
            <p className="text-xs text-slate-500">Format: benchmark_name, industry, metric_type, value, source</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}