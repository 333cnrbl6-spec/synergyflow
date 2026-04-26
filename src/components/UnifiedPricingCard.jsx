import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UnifiedPricingCard({ tier, isPopular = false, onSelect }) {
  return (
    <Card className={cn(
      'transition-all duration-300',
      isPopular && 'ring-2 ring-blue-600 shadow-lg scale-105'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{tier.tier_name}</h3>
            {tier.description && (
              <p className="text-xs text-slate-600 mt-1">{tier.description}</p>
            )}
          </div>
          {isPopular && (
            <Badge className="bg-blue-600 text-white">Most Popular</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">£{tier.monthly_price_gbp}</span>
            <span className="text-slate-600">/month</span>
          </div>
          {tier.annual_price_gbp && (
            <p className="text-xs text-slate-600 mt-2">
              or £{tier.annual_price_gbp}/year (save 17%)
            </p>
          )}
        </div>

        {/* Features */}
        {tier.features && tier.features.length > 0 && (
          <ul className="space-y-2.5">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Specs */}
        <div className="space-y-2 text-sm border-t pt-4">
          {tier.api_calls_monthly && (
            <div className="flex justify-between">
              <span className="text-slate-600">API Calls</span>
              <span className="font-semibold text-slate-900">{tier.api_calls_monthly.toLocaleString()}/mo</span>
            </div>
          )}
          {tier.storage_gb && (
            <div className="flex justify-between">
              <span className="text-slate-600">Storage</span>
              <span className="font-semibold text-slate-900">{tier.storage_gb} GB</span>
            </div>
          )}
          {tier.team_members && (
            <div className="flex justify-between">
              <span className="text-slate-600">Team Members</span>
              <span className="font-semibold text-slate-900">{tier.team_members}</span>
            </div>
          )}
          {tier.support_level && (
            <div className="flex justify-between">
              <span className="text-slate-600">Support</span>
              <span className="font-semibold text-slate-900 capitalize">{tier.support_level}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={() => onSelect?.(tier)}
          className={cn(
            'w-full',
            isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'border border-slate-300 hover:bg-slate-50'
          )}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}