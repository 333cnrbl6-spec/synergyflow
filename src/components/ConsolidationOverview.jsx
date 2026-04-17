import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Check, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function ConsolidationOverview() {
  const [proposal, setProposal] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsolidationData();
  }, []);

  const fetchConsolidationData = async () => {
    try {
      const props = await base44.entities.BoardProposal.filter({
        title: { $regex: 'Cross-Product Consolidation' }
      });
      if (props.length > 0) {
        setProposal(props[0]);
        
        const actions = await base44.entities.ActionItem.filter({
          trigger_entity_id: props[0].id
        });
        setActionItems(actions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <Zap className="w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Announcement */}
      <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl text-purple-900">
                <Zap className="w-7 h-7" />
                Cross-Product Consolidation
              </CardTitle>
              <p className="text-sm text-purple-800">Chairman-Authorized Autonomous Implementation</p>
            </div>
            <div className="space-y-1">
              <Badge className="bg-green-600 text-white">Approved</Badge>
              <Badge className="bg-purple-600 text-white block">In Execution</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <p className="text-slate-900 leading-relaxed">
              <span className="font-semibold">"The Board is committed to consolidating our cross-product capabilities into a unified infrastructure that bridges asset management with legal oversight for institutional landlords. We will now move to integrate CaseNarrative data and Species Explorer logic directly into the Premiso environment to deliver bespoke, automated command centers for large-scale property investors."</span>
            </p>
            <p className="text-xs text-slate-600 mt-3 flex items-center gap-2">
              <Users className="w-3 h-3" />
              Chairman Statement • Autonomous Implementation Authorized
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Integration Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 p-3 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="font-semibold text-blue-900 text-sm">CaseNarrative</p>
                <p className="text-xs text-blue-700 mt-1">Legal Data Layer</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 p-3 bg-purple-50 border-2 border-purple-300 rounded text-center">
                <p className="font-semibold text-purple-900 text-sm">Premiso Command Center</p>
                <p className="text-xs text-purple-700 mt-1">Unified Infrastructure</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="w-32 p-3 bg-green-50 border border-green-200 rounded text-center">
                <p className="font-semibold text-green-900 text-sm">Species Explorer</p>
                <p className="text-xs text-green-700 mt-1">Asset Logic Layer</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">Target Customer:</p>
              <p className="text-sm text-slate-700">Large-scale institutional landlords with bespoke, automated command centers for unified property & legal management</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Workstreams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Implementation Workstreams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionItems.map((item, idx) => (
              <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-amber-600 text-xs">{item.issue_severity || 'critical'}</Badge>
                    <Badge variant="outline" className="text-xs">{item.implementation_status || 'in_progress'}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Consolidation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <div className="text-slate-500 font-mono">Phase 1</div>
              <div>Data Integration (CaseNarrative → Premiso)</div>
            </div>
            <div className="flex gap-4">
              <div className="text-slate-500 font-mono">Phase 2</div>
              <div>Logic Integration (Species Explorer → Premiso)</div>
            </div>
            <div className="flex gap-4">
              <div className="text-slate-500 font-mono">Phase 3</div>
              <div>Command Center Configuration</div>
            </div>
            <div className="flex gap-4">
              <div className="text-slate-500 font-mono">Phase 4</div>
              <div>Institutional Landlord Launch</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}