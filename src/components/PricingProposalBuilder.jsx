import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_TIERS = [
  { tier_id: 'starter', tier_name: 'Starter', monthly_price_gbp: 29, annual_price_gbp: 290 },
  { tier_id: 'professional', tier_name: 'Professional', monthly_price_gbp: 99, annual_price_gbp: 990 },
  { tier_id: 'enterprise', tier_name: 'Enterprise', monthly_price_gbp: 299, annual_price_gbp: 2990 }
];

export default function PricingProposalBuilder({ product, onProposalCreated, onCancel }) {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [rationale, setRationale] = useState('');
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTier = (index, field, value) => {
    const updated = [...tiers];
    updated[index][field] = field.includes('price') ? parseFloat(value) : value;
    setTiers(updated);
  };

  const addFeature = (tierIndex, feature) => {
    const updated = [...tiers];
    if (!updated[tierIndex].features) updated[tierIndex].features = [];
    if (feature && !updated[tierIndex].features.includes(feature)) {
      updated[tierIndex].features.push(feature);
    }
    setTiers(updated);
  };

  const removeFeature = (tierIndex, feature) => {
    const updated = [...tiers];
    updated[tierIndex].features = updated[tierIndex].features.filter(f => f !== feature);
    setTiers(updated);
  };

  const handleSubmit = async () => {
    if (!rationale.trim()) {
      toast.error('Please provide a rationale for this pricing');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();

      // Create pricing structure
      const pricingStructure = await base44.entities.PricingStructure.create({
        product_id: product.id,
        product_name: product.name,
        status: 'proposed',
        tiers: tiers,
        currency: 'GBP',
        effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        proposed_by: user.email,
        rationale,
        competitive_analysis: competitiveAnalysis || 'Not provided'
      });

      // Create board proposal for voting
      const boardProposal = await base44.entities.BoardProposal.create({
        title: `Pricing Update: ${product.name}`,
        summary: `Proposed new pricing structure with ${tiers.length} tiers. ${rationale.substring(0, 100)}...`,
        raised_by: user.email,
        channel_id: 'pricing-proposals',
        channel_name: '#pricing-proposals',
        proposal_type: 'pricing',
        products_involved: [product.id],
        status: 'pending_chairman'
      });

      // Link pricing to proposal
      await base44.entities.PricingStructure.update(pricingStructure.id, {
        board_proposal_id: boardProposal.id
      });

      toast.success(`Pricing proposal created! Awaiting board vote.`);
      onProposalCreated?.(pricingStructure, boardProposal);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      toast.error('Failed to create pricing proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing Tiers for {product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tiers.map((tier, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Tier Name</label>
                  <Input
                    value={tier.tier_name}
                    onChange={(e) => updateTier(idx, 'tier_name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Monthly Price (£)</label>
                  <Input
                    type="number"
                    value={tier.monthly_price_gbp}
                    onChange={(e) => updateTier(idx, 'monthly_price_gbp', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Input
                  value={tier.description || ''}
                  onChange={(e) => updateTier(idx, 'description', e.target.value)}
                  placeholder="e.g., Best for small teams"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Features</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add feature"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addFeature(idx, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.features?.map((feature) => (
                    <Badge key={feature} variant="secondary" className="gap-1">
                      {feature}
                      <button
                        onClick={() => removeFeature(idx, feature)}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rationale</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain why you're proposing this pricing structure..."
            className="w-full p-3 border rounded-lg text-sm"
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competitive Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={competitiveAnalysis}
            onChange={(e) => setCompetitiveAnalysis(e.target.value)}
            placeholder="How does this compare to competitors? Market research findings?"
            className="w-full p-3 border rounded-lg text-sm"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          Submit for Board Vote
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}