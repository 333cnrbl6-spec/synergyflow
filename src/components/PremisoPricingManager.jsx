import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle2 } from 'lucide-react';

/**
 * PremisoPricingManager — lightweight tier configuration for rent collection
 * Used in onboarding to set up basic payment acceptance
 */
export default function PremisoPricingManager({ onSave, initialTiers = [] }) {
  const [tiers, setTiers] = useState(initialTiers.length > 0 ? initialTiers : [
    { name: 'Standard', monthly_price: 0, features: ['Rent collection', 'Tenant portal'] }
  ]);

  const handleUpdatePrice = (idx, price) => {
    const updated = [...tiers];
    updated[idx].monthly_price = parseFloat(price) || 0;
    setTiers(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Rent Collection Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Configure how you'd like to charge tenants for rent collection through Stripe Connect (optional for trial).
        </p>

        {tiers.map((tier, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{tier.name}</p>
                <p className="text-xs text-slate-500 mt-1">{tier.features.join(' • ')}</p>
              </div>
              <Badge variant="outline">Monthly</Badge>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Charge</label>
                <Input
                  type="number"
                  value={tier.monthly_price}
                  onChange={(e) => handleUpdatePrice(idx, e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full"
                />
              </div>
              <span className="text-slate-600 font-semibold">£/month</span>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-blue-900">
            <p className="font-medium">Stripe Connect ready</p>
            <p className="text-xs mt-1">Your payment settings are configured. Connect your Stripe account in Settings whenever you're ready to go live.</p>
          </div>
        </div>

        <Button onClick={() => onSave(tiers)} className="w-full bg-slate-900 hover:bg-slate-800">
          Continue to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}