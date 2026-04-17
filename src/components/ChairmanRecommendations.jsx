import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Zap, AlertCircle, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

export default function ChairmanRecommendations() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('summary');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('synthesizeBoardInsights', {});
      setInsights(res.data.insights);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading && !insights) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-500">Synthesizing board perspectives...</p>
        </div>
      </Card>
    );
  }

  if (!insights) return null;

  const sections = [
    {
      id: 'critical_needs',
      title: 'Critical Needs',
      icon: AlertCircle,
      color: 'bg-red-50 border-red-200',
      items: insights.critical_needs,
      description: 'Must-have features and capabilities'
    },
    {
      id: 'menu_structure',
      title: 'Menu & Structure',
      icon: TrendingUp,
      color: 'bg-blue-50 border-blue-200',
      items: [
        `Primary Sections: ${insights.menu_structure?.primary_sections?.join(', ') || 'N/A'}`,
        `Layout: ${insights.menu_structure?.recommended_layout || 'N/A'}`,
        ...(insights.menu_structure?.user_flows || [])
      ],
      description: 'Recommended information architecture'
    },
    {
      id: 'capability_gaps',
      title: 'Capability Gaps',
      icon: Zap,
      color: 'bg-amber-50 border-amber-200',
      items: insights.capability_gaps,
      description: 'Missing features and integrations'
    },
    {
      id: 'competitive_advantages',
      title: 'Competitive Edge',
      icon: Lightbulb,
      color: 'bg-green-50 border-green-200',
      items: insights.competitive_advantages,
      description: 'Unique positioning opportunities'
    },
    {
      id: 'roadmap',
      title: 'Implementation Roadmap',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200',
      items: [
        `30 Days: ${insights.roadmap?.phase_30_days?.join(', ') || 'N/A'}`,
        `60 Days: ${insights.roadmap?.phase_60_days?.join(', ') || 'N/A'}`,
        `90 Days: ${insights.roadmap?.phase_90_days?.join(', ') || 'N/A'}`
      ],
      description: 'Phased execution plan'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Board Consensus Insights</h3>
          <p className="text-sm text-slate-500 mt-1">Synthesized from board member expertise</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadRecommendations}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {insights.summary && (
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all border ${section.color} ${
                isExpanded ? 'lg:col-span-2' : ''
              }`}
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <p className="text-xs text-slate-600 mt-1">{section.description}</p>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-slate-400 flex-shrink-0">•</span>
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}