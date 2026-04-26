import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, CheckCircle2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import PricingProposalBuilder from '@/components/PricingProposalBuilder';
import PricingProposalVoting from '@/components/PricingProposalVoting';
import UnifiedPricingCard from '@/components/UnifiedPricingCard';

export default function PricingManager() {
  const [products, setProducts] = useState([]);
  const [pricingStructures, setPricingStructures] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productList, pricingList, proposalList] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.PricingStructure.list(),
        base44.entities.BoardProposal.filter({ proposal_type: 'pricing' })
      ]);

      setProducts(productList);
      setPricingStructures(pricingList);
      setProposals(proposalList);

      if (productList.length > 0 && !selectedProduct) {
        setSelectedProduct(productList[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load pricing data');
    } finally {
      setIsLoading(false);
    }
  };

  const getProductPricing = (productId, status = 'active') => {
    return pricingStructures.find(p => p.product_id === productId && p.status === status);
  };

  const getPricingProposal = (pricingId) => {
    const pricing = pricingStructures.find(p => p.id === pricingId);
    return pricing?.board_proposal_id 
      ? proposals.find(p => p.id === pricing.board_proposal_id)
      : null;
  };

  const handleImplementPricing = async (pricingId) => {
    try {
      // Mark as active
      await base44.entities.PricingStructure.update(pricingId, {
        status: 'active'
      });

      // Deactivate previous versions
      const pricing = pricingStructures.find(p => p.id === pricingId);
      const oldPricing = pricingStructures.filter(
        p => p.product_id === pricing.product_id && p.id !== pricingId && p.status === 'active'
      );

      for (const old of oldPricing) {
        await base44.entities.PricingStructure.update(old.id, {
          status: 'archived'
        });
      }

      toast.success('Pricing implemented successfully');
      loadData();
    } catch (err) {
      console.error('Implementation failed:', err);
      toast.error('Failed to implement pricing');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading pricing manager...</div>;
  }

  const filteredPricing = pricingStructures.filter(p => {
    const matchesProduct = !selectedProduct || p.product_id === selectedProduct.id;
    const matchesStatus = activeTab === 'all' || p.status === activeTab;
    return matchesProduct && matchesStatus;
  });

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pricing Manager</h1>
          <p className="text-slate-600 mt-1">Propose, vote, and implement unified pricing across SynergyFlow</p>
        </div>
        {!showBuilder && (
          <Button
            onClick={() => setShowBuilder(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Propose New Pricing
          </Button>
        )}
      </div>

      {/* Builder Modal */}
      {showBuilder && selectedProduct && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Pricing Proposal</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowBuilder(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PricingProposalBuilder
              product={selectedProduct}
              onProposalCreated={() => {
                setShowBuilder(false);
                loadData();
              }}
              onCancel={() => setShowBuilder(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Product Selection */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Product</h3>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <Button
              key={product.id}
              variant={selectedProduct?.id === product.id ? 'default' : 'outline'}
              onClick={() => setSelectedProduct(product)}
              className={selectedProduct?.id === product.id ? 'bg-slate-900' : ''}
            >
              {product.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { label: 'Active Pricing', value: 'active' },
          { label: 'Proposed Pricing', value: 'proposed' },
          { label: 'Pending Vote', value: 'pending_board_approval' },
          { label: 'All Versions', value: 'all' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pricing List */}
      {filteredPricing.length > 0 ? (
        <div className="space-y-6">
          {filteredPricing.map((pricing) => {
            const proposal = getPricingProposal(pricing.id);
            const statusIcon = {
              active: <CheckCircle2 className="w-5 h-5 text-green-600" />,
              proposed: <Clock className="w-5 h-5 text-yellow-600" />,
              pending_board_approval: <Clock className="w-5 h-5 text-yellow-600" />
            }[pricing.status];

            return (
              <div key={pricing.id} className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {pricing.product_name} - V{pricing.version}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Effective: {new Date(pricing.effective_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    pricing.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : pricing.status === 'proposed'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }>
                    {pricing.status.toUpperCase().replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pricing.tiers?.map((tier) => (
                    <UnifiedPricingCard
                      key={tier.tier_id}
                      tier={tier}
                      isPopular={tier.tier_id === 'professional'}
                    />
                  ))}
                </div>

                {/* Rationale */}
                {pricing.rationale && (
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2">Rationale</h4>
                      <p className="text-sm text-slate-700">{pricing.rationale}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Board Voting Section */}
                {proposal && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-slate-900 mb-4">Board Vote Status</h4>
                    <PricingProposalVoting proposal={proposal} />
                  </div>
                )}

                {/* Implementation Button */}
                {pricing.status === 'pending_board_approval' && proposal?.status === 'approved' && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleImplementPricing(pricing.id)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="w-4 h-4" />
                      Implement Pricing
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600">
              No {activeTab === 'all' ? 'pricing' : activeTab.replace(/_/g, ' ')} found
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}