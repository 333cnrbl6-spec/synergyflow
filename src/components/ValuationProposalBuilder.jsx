import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ValuationProposalBuilder() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [proposalTitle, setProposalTitle] = useState('');
  const [productInputs, setProductInputs] = useState([]);
  const [suitePremium, setSuitePremium] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const prods = await base44.entities.Product.list();
      setProducts(prods);
      setProductInputs(prods.map(p => ({
        product_id: p.id,
        product_name: p.name,
        annual_revenue_potential: 0,
        valuation_multiple: 10,
        rationale: ''
      })));
    };
    init();
  }, []);

  const updateProductInput = (index, field, value) => {
    const updated = [...productInputs];
    updated[index][field] = value;
    setProductInputs(updated);
  };

  const submitProposal = async () => {
    if (!proposalTitle.trim()) {
      toast.error('Enter proposal title');
      return;
    }
    if (!productInputs.some(p => p.annual_revenue_potential > 0)) {
      toast.error('Add revenue potential for at least one product');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ValuationProposal.create({
        title: proposalTitle,
        proposed_by: user.full_name,
        status: 'proposed',
        products: productInputs.filter(p => p.annual_revenue_potential > 0),
        suite_premium_percentage: suitePremium
      });

      toast.success('Valuation proposal submitted for board review');
      setProposalTitle('');
      setProductInputs(productInputs.map(p => ({ ...p, annual_revenue_potential: 0, rationale: '' })));
    } catch (e) {
      toast.error('Failed to create proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">📊 Create Valuation Proposal</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">Proposal Title</label>
          <Input
            placeholder="e.g., Q2 2026 Portfolio Valuation Assessment"
            value={proposalTitle}
            onChange={(e) => setProposalTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">Suite Integration Premium (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={suitePremium}
            onChange={(e) => setSuitePremium(parseFloat(e.target.value))}
            className="mt-1"
          />
          <p className="text-xs text-slate-600 mt-1">Premium added when selling products as integrated suite</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Product Valuations</label>
          {productInputs.map((input, idx) => (
            <div key={input.product_id} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="font-semibold text-slate-900">{input.product_name}</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Annual Revenue Potential (£)</label>
                  <Input
                    type="number"
                    min="0"
                    step="10000"
                    value={input.annual_revenue_potential}
                    onChange={(e) => updateProductInput(idx, 'annual_revenue_potential', parseFloat(e.target.value))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Valuation Multiple</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={input.valuation_multiple}
                    onChange={(e) => updateProductInput(idx, 'valuation_multiple', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Rationale</label>
                <Textarea
                  placeholder="Why this valuation? Market position, tech differentiation, competitive moat..."
                  value={input.rationale}
                  onChange={(e) => updateProductInput(idx, 'rationale', e.target.value)}
                  className="mt-1 h-20"
                />
              </div>

              {input.annual_revenue_potential > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <div className="text-blue-900 font-semibold">
                    Individual Value: £{(input.annual_revenue_potential * input.valuation_multiple).toLocaleString()}M
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={submitProposal}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {submitting ? 'Submitting...' : 'Submit for Board Review'}
        </Button>
      </div>
    </Card>
  );
}