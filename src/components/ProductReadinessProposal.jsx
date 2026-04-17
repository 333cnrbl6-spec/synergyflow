import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const productData = [
  { name: 'Premiso', readiness: 80, monthly_mrr: 627, sell_now_value: 0.1, multiple: 11.2, status: 'needs_work' },
  { name: 'Species Explorer', readiness: 100, monthly_mrr: 797, sell_now_value: 0.1, multiple: 12.0, status: 'ready' },
  { name: 'Age UK Bury', readiness: 100, monthly_mrr: 1227, sell_now_value: 0.2, multiple: 12.0, status: 'ready' },
  { name: 'CaseNarrative', readiness: 100, monthly_mrr: 607, sell_now_value: 0.1, multiple: 12.0, status: 'ready' }
];

export default function ProductReadinessProposal() {
  const [submitting, setSubmitting] = useState(null);

  const handleCreateReadinessProposal = async (product) => {
    setSubmitting(product.name);
    try {
      const res = await base44.functions.invoke('createProductReadinessProposal', {
        product_name: product.name,
        current_readiness: product.readiness,
        target_readiness: 100,
        metrics: {
          monthly_mrr: product.monthly_mrr,
          sell_now_value: product.sell_now_value
        }
      });

      if (res.data.success) {
        toast.success(
          `${product.name} readiness proposal created! ${res.data.action_items_created} action items generated.`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to create proposal for ${product.name}`);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <CardTitle>Product Readiness Gap Analysis</CardTitle>
              <p className="text-xs text-amber-700 mt-1">Proposal: Bring Premiso to 100% Market Readiness</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Individual Product Valuations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {productData.map(product => (
              <div key={product.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${
                            product.readiness === 100 ? 'bg-green-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${product.readiness}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{product.readiness}% ready</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {product.readiness === 100 ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {100 - product.readiness}% Gap
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3 bg-slate-50 p-3 rounded">
                  <div>
                    <p className="text-slate-600">Monthly MRR</p>
                    <p className="font-bold text-slate-900">£{product.monthly_mrr}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Multiple</p>
                    <p className="font-bold text-slate-900">{product.multiple}x</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Sell Now Value</p>
                    <p className="font-bold text-slate-900">£{product.sell_now_value}M</p>
                  </div>
                </div>

                {/* Action */}
                {product.readiness < 100 && (
                  <Button
                    onClick={() => handleCreateReadinessProposal(product)}
                    disabled={submitting === product.name}
                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    {submitting === product.name ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Creating Proposal...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Create 100% Readiness Proposal
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Portfolio Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-xs text-slate-600 mt-1">Products at 100%</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">1</p>
              <p className="text-xs text-slate-600 mt-1">Needs Work</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">£3.7M</p>
              <p className="text-xs text-slate-600 mt-1">Total Portfolio Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">£0.5M+</p>
              <p className="text-xs text-slate-600 mt-1">at Stake (Premiso)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insight */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Strategic Priority:</span> Bringing Premiso to 100% readiness will unlock £0.5M+ in additional valuation and ensure parity across the portfolio. Closing the 20% gap is critical for unified enterprise launch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}