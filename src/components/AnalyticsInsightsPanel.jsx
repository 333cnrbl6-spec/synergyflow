import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Lightbulb, RefreshCw, Zap } from 'lucide-react';

const INSIGHT_COLORS = {
  high_churn: 'bg-red-50 border-red-200',
  elevated_churn: 'bg-orange-50 border-orange-200',
  excellent_retention: 'bg-green-50 border-green-200',
  low_arpu: 'bg-yellow-50 border-yellow-200',
  no_active_subs: 'bg-red-50 border-red-200',
  missing_pricing_tiers: 'bg-orange-50 border-orange-200',
  portfolio_churn_risk: 'bg-red-50 border-red-200'
};

const INSIGHT_ICONS = {
  high_churn: AlertCircle,
  elevated_churn: AlertCircle,
  excellent_retention: CheckCircle2,
  low_arpu: Lightbulb,
  no_active_subs: AlertCircle,
  missing_pricing_tiers: AlertCircle,
  portfolio_churn_risk: AlertCircle
};

export default function AnalyticsInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateAnalyticsInsights', {
        action: 'generate_insights'
      });
      setInsights(res.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const toggleExpanded = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const criticalInsights = insights.filter(i => i.severity === 'critical');
  const highInsights = insights.filter(i => i.severity === 'high');
  const positiveInsights = insights.filter(i => i.severity === 'positive');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Actionable Insights
        </h3>
        <Button
          onClick={fetchInsights}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {insights.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-slate-600">No insights to display. Portfolio is healthy!</p>
          </CardContent>
        </Card>
      )}

      {/* Critical Insights */}
      {criticalInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Critical Issues ({criticalInsights.length})
          </h4>
          {criticalInsights.map((insight, idx) => (
            <InsightCard
              key={`critical-${idx}`}
              insight={insight}
              onToggle={() => toggleExpanded(`critical-${idx}`)}
              isExpanded={expanded[`critical-${idx}`]}
            />
          ))}
        </div>
      )}

      {/* High Priority Insights */}
      {highInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            High Priority ({highInsights.length})
          </h4>
          {highInsights.map((insight, idx) => (
            <InsightCard
              key={`high-${idx}`}
              insight={insight}
              onToggle={() => toggleExpanded(`high-${idx}`)}
              isExpanded={expanded[`high-${idx}`]}
            />
          ))}
        </div>
      )}

      {/* Positive Insights */}
      {positiveInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Opportunities ({positiveInsights.length})
          </h4>
          {positiveInsights.map((insight, idx) => (
            <InsightCard
              key={`positive-${idx}`}
              insight={insight}
              onToggle={() => toggleExpanded(`positive-${idx}`)}
              isExpanded={expanded[`positive-${idx}`]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, onToggle, isExpanded }) {
  const Icon = INSIGHT_ICONS[insight.type] || AlertCircle;
  const bgColor = INSIGHT_COLORS[insight.type] || 'bg-slate-50 border-slate-200';
  
  const severityColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    positive: 'bg-green-100 text-green-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3 flex-1">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-slate-900">{insight.product_name}</h5>
            <p className="text-sm text-slate-700 mt-1">{insight.insight}</p>
          </div>
        </div>
        <Badge className={severityColors[insight.severity]}>
          {insight.metric ? insight.metric.toFixed(1) : '—'}
        </Badge>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h6 className="text-xs font-semibold text-slate-700 uppercase mb-3">Recommended Actions</h6>
          <ul className="space-y-2">
            {insight.actions.map((action, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400 flex-shrink-0">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}