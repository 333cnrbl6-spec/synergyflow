import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, X, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function UpsellRecommendation({ recommendation, onDismiss, onUpgrade }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = async (reason = 'user_dismissed') => {
    setIsDismissing(true);
    try {
      await base44.entities.UpsellRecommendation.update(recommendation.id, {
        status: 'dismissed',
        dismissal_reason: reason
      });
      onDismiss?.();
    } catch (err) {
      console.error('Failed to dismiss:', err);
      toast.error('Failed to dismiss recommendation');
    } finally {
      setIsDismissing(false);
    }
  };

  const tierIcons = {
    starter: '🚀',
    professional: '⭐',
    enterprise: '👑'
  };

  const tierLabels = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };

  const growth = recommendation.usage_analysis?.growth_rate || 0;
  const daysLeft = recommendation.usage_analysis?.days_until_limit || 0;
  const urgency = daysLeft < 7 ? 'critical' : daysLeft < 14 ? 'high' : 'medium';

  const urgencyColor = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-yellow-50 border-yellow-200'
  }[urgency];

  const urgencyBadge = {
    critical: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
    high: { label: 'Soon', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Recommended', color: 'bg-yellow-100 text-yellow-800' }
  }[urgency];

  return (
    <Card className={`${urgencyColor} border-2 transition-all`}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Smart Recommendation</span>
            <Badge className={urgencyBadge.color}>
              {urgencyBadge.label}
            </Badge>
          </div>
          <CardTitle className="text-lg">
            Time to Upgrade to {tierLabels[recommendation.recommended_tier]} Plan
          </CardTitle>
        </div>
        <button
          onClick={() => handleDismiss()}
          disabled={isDismissing}
          className="p-1.5 hover:bg-white/50 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Usage Alert */}
        <div className="p-4 bg-white/70 rounded-lg space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              You're using {recommendation.current_usage_percent}% of your {recommendation.current_tier} plan
            </p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
                style={{ width: `${Math.min(recommendation.current_usage_percent, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            {recommendation.usage_analysis?.days_until_limit ? (
              <>
                <strong>{recommendation.usage_analysis.days_until_limit} days</strong> until you hit your limit
              </>
            ) : (
              'Growing rapidly - upgrade soon'
            )}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/70 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Metric Hitting Limit</p>
            <p className="font-semibold text-slate-900 capitalize">
              {recommendation.trigger_metric.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="p-3 bg-white/70 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Growth Rate</p>
            <p className="font-semibold text-slate-900">
              +{growth}% monthly
            </p>
          </div>
        </div>

        {/* Upgrade Benefits */}
        <div className="p-4 bg-white/70 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-slate-700 uppercase">Why Upgrade</p>
          <p className="text-sm text-slate-700">
            {recommendation.projected_upgrade_benefit}
          </p>
          {recommendation.roi_months && (
            <p className="text-xs text-slate-600 mt-2">
              ROI payback period: <strong>{recommendation.roi_months} months</strong>
            </p>
          )}
        </div>

        {/* Pricing Comparison */}
        {recommendation.monthly_price_increase && (
          <div className="p-3 bg-white/70 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Price Increase</p>
              <p className="font-semibold text-slate-900">
                +£{recommendation.monthly_price_increase}/month
              </p>
            </div>
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
        )}

        {/* Usage Insights */}
        {recommendation.usage_analysis?.most_used_feature && (
          <div className="p-3 bg-white/70 rounded-lg text-sm">
            <p className="text-xs text-slate-600 mb-1">Your Top Feature</p>
            <p className="text-slate-800 capitalize">
              {recommendation.usage_analysis.most_used_feature}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onUpgrade?.()}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowRight className="w-4 h-4" />
            Upgrade Now
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDismiss('maybe_later')}
            disabled={isDismissing}
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-600 text-center">
          This recommendation expires {new Date(recommendation.expires_date).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}