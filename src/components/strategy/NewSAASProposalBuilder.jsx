import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const SYNERGYFLOW_PRODUCTS = [
  { id: 'base44-ai', name: 'Base44 AI' },
  { id: 'case-narrative', name: 'CaseNarrative' },
  { id: 'charity-hub', name: 'CharityHub' },
  { id: 'premiso', name: 'Premiso' },
  { id: 'species-explorer', name: 'Species Explorer' }
];

export default function NewSAASProposalBuilder({ gap, onProposalCreated }) {
  const [formData, setFormData] = useState({
    product_name: '',
    tagline: '',
    vision: '',
    core_features: [],
    competitive_advantages: [],
    products_combined: [],
    unique_strength: '',
    y1_mrr: 50000,
    y3_mrr: 500000,
    mvp_months: 6,
    tam: 50
  });
  const [newFeature, setNewFeature] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        core_features: [...formData.core_features, { feature_name: newFeature, description: '', powered_by: [] }]
      });
      setNewFeature('');
    }
  };

  const addAdvantage = () => {
    if (newAdvantage.trim()) {
      setFormData({
        ...formData,
        competitive_advantages: [...formData.competitive_advantages, newAdvantage]
      });
      setNewAdvantage('');
    }
  };

  const toggleProduct = (productId) => {
    setFormData({
      ...formData,
      products_combined: formData.products_combined.includes(productId)
        ? formData.products_combined.filter(p => p !== productId)
        : [...formData.products_combined, productId]
    });
  };

  const handleSubmit = async () => {
    if (!formData.product_name || !formData.vision) {
      toast.error('Fill in product name and vision');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();

      const proposal = await base44.entities.NewSAASProposal.create({
        product_name: formData.product_name,
        tagline: formData.tagline,
        vision: formData.vision,
        gap_analysis_id: gap?.id,
        core_features: formData.core_features,
        competitive_advantages: formData.competitive_advantages,
        target_market: {
          tam_gbp_millions: formData.tam,
          som_gbp_millions: formData.tam * 0.1
        },
        synergyflow_integration: {
          products_combined: formData.products_combined,
          unique_strength: formData.unique_strength,
          integration_strategy: `Combines the strengths of ${formData.products_combined.length} SynergyFlow products`
        },
        build_timeline: {
          mvp_months: formData.mvp_months,
          public_launch_months: formData.mvp_months + 3
        },
        financial_projections: {
          year_1_mrr_target: formData.y1_mrr,
          year_3_mrr_target: formData.y3_mrr
        },
        lead_advocate: user.email,
        status: 'draft'
      });

      // Create board proposal for discussion
      const boardProposal = await base44.entities.BoardProposal.create({
        title: `New Product Proposal: ${formData.product_name}`,
        summary: `${formData.tagline}\n\nMarket Size: £${formData.tam}m TAM\nIntegrates: ${formData.products_combined.length} existing products\n\n${formData.vision.substring(0, 150)}...`,
        raised_by: user.email,
        channel_id: 'strategy',
        channel_name: '#strategy',
        proposal_type: 'build',
        status: 'pending_chairman'
      });

      await base44.entities.NewSAASProposal.update(proposal.id, {
        board_proposal_id: boardProposal.id
      });

      toast.success(`${formData.product_name} proposal created!`);
      onProposalCreated?.(proposal);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      toast.error('Failed to create proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Product Name</label>
            <Input
              placeholder="e.g., LegalSync"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tagline</label>
            <Input
              placeholder="e.g., The integrated legal operations platform"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Vision</label>
            <textarea
              placeholder="What is the vision for this product?"
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              className="w-full p-3 border rounded-lg text-sm mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* SynergyFlow Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SynergyFlow Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-3">Which products combine?</label>
            <div className="flex flex-wrap gap-2">
              {SYNERGYFLOW_PRODUCTS.map((product) => (
                <Button
                  key={product.id}
                  variant={formData.products_combined.includes(product.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleProduct(product.id)}
                  className={formData.products_combined.includes(product.id) ? 'bg-blue-600' : ''}
                >
                  {product.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Unique Strength from Combination</label>
            <textarea
              placeholder="What makes this combination stronger than separate products?"
              value={formData.unique_strength}
              onChange={(e) => setFormData({ ...formData, unique_strength: e.target.value })}
              className="w-full p-3 border rounded-lg text-sm mt-1"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Core Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Feature name"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFeature()}
            />
            <Button onClick={addFeature} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {formData.core_features.map((feature, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">{feature.feature_name}</span>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    core_features: formData.core_features.filter((_, i) => i !== idx)
                  })}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitive Advantages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Advantage"
              value={newAdvantage}
              onChange={(e) => setNewAdvantage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAdvantage()}
            />
            <Button onClick={addAdvantage} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {formData.competitive_advantages.map((adv, idx) => (
              <div key={idx} className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">✓ {adv}</span>
                <button
                  onClick={() => setFormData({
                    ...formData,
                    competitive_advantages: formData.competitive_advantages.filter((_, i) => i !== idx)
                  })}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Market Size & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">TAM (£ millions)</label>
            <Input
              type="number"
              value={formData.tam}
              onChange={(e) => setFormData({ ...formData, tam: parseFloat(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">MVP Timeline (months)</label>
            <Input
              type="number"
              value={formData.mvp_months}
              onChange={(e) => setFormData({ ...formData, mvp_months: parseInt(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Year 1 MRR Target (£)</label>
            <Input
              type="number"
              value={formData.y1_mrr}
              onChange={(e) => setFormData({ ...formData, y1_mrr: parseFloat(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Year 3 MRR Target (£)</label>
            <Input
              type="number"
              value={formData.y3_mrr}
              onChange={(e) => setFormData({ ...formData, y3_mrr: parseFloat(e.target.value) })}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          Submit Proposal to Board
        </Button>
      </div>
    </div>
  );
}