import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, Bell, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ChairmanDashboardMonitor() {
  const [monitorData, setMonitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('critical');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadChairmanData();
    
    if (autoRefresh) {
      const interval = setInterval(loadChairmanData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadChairmanData = async () => {
    try {
      const response = await base44.functions.invoke('chairmanRealTimeMonitor', {});
      setMonitorData(response.data);
      
      // Toast notification for critical alerts
      if (response.data?.chairman_focus?.requires_attention) {
        const criticalCount = response.data.chairman_focus.critical_alerts.length;
        if (criticalCount > 0) {
          toast.error(`${criticalCount} critical alert(s) require your attention`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !monitorData) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  const chairmanFocus = monitorData.chairman_focus;
  const hasCritical = chairmanFocus.critical_alerts.length > 0;
  const hasImprovements = chairmanFocus.improvements_detected.length > 0;

  return (
    <div className="space-y-4">
      {/* Chairman Status Header */}
      <Card className={`p-6 border-l-4 ${hasCritical ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {hasCritical ? (
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            )}
            <div>
              <h2 className={`text-lg font-bold ${hasCritical ? 'text-red-900' : 'text-green-900'}`}>
                Real-Time Execution Status
              </h2>
              <p className={`text-sm mt-1 ${hasCritical ? 'text-red-800' : 'text-green-800'}`}>
                {chairmanFocus.execution_status === 'nominal' 
                  ? 'All systems operational — board decisions executing smoothly'
                  : 'CAUTION: Issues detected requiring immediate review'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge 
              className={`${autoRefresh ? 'bg-green-600' : 'bg-slate-400'} text-white cursor-pointer`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Badge>
            <Badge className={hasCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}>
              {hasCritical ? `${chairmanFocus.critical_alerts.length} Critical` : 'Healthy'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Critical Alerts Section */}
      {chairmanFocus.critical_alerts.length > 0 && (
        <Card className="p-4 border border-red-300">
          <button
            onClick={() => setExpandedSection(expandedSection === 'critical' ? null : 'critical')}
            className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Critical Alerts</span>
              <Badge className="bg-red-600 text-white">{chairmanFocus.critical_alerts.length}</Badge>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'critical' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'critical' && (
            <div className="mt-3 space-y-3 border-t border-red-200 pt-3">
              {chairmanFocus.critical_alerts.map((alert, i) => (
                <div key={i} className="p-3 bg-red-50 rounded border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-red-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      {alert.message}
                    </div>
                    <Badge className="bg-red-600 text-white text-xs">{alert.priority.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-red-800 mt-2 p-2 bg-white rounded border border-red-100">
                    <strong>Action Required:</strong> {alert.action}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Improvements Detected Section */}
      {hasImprovements && (
        <Card className="p-4 border border-emerald-300">
          <button
            onClick={() => setExpandedSection(expandedSection === 'improvements' ? null : 'improvements')}
            className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Improvements Detected</span>
              <Badge className="bg-emerald-600 text-white">{chairmanFocus.improvements_detected.length}</Badge>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'improvements' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'improvements' && (
            <div className="mt-3 space-y-3 border-t border-emerald-200 pt-3">
              {chairmanFocus.improvements_detected.map((improvement, i) => (
                <div key={i} className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {improvement.message}
                    </div>
                    <Badge className="bg-emerald-600 text-white text-xs">{improvement.priority.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-emerald-800 mt-2 p-2 bg-white rounded border border-emerald-100">
                    <strong>Next Step:</strong> {improvement.action}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Execution Summary */}
      <Card className="p-6">
        <CardTitle className="mb-4">Execution Summary (Last 24 Hours)</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-700 font-semibold mb-1">Proposals Approved</div>
            <div className="text-2xl font-black text-blue-600">{monitorData.execution_summary.approved_proposals}</div>
            <div className="text-xs text-blue-600 mt-1">Queued for execution</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <div className="text-xs text-emerald-700 font-semibold mb-1">Completed</div>
            <div className="text-2xl font-black text-emerald-600">{monitorData.execution_summary.completed_proposals}</div>
            <div className="text-xs text-emerald-600 mt-1">Successfully deployed</div>
          </div>

          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <div className="text-xs text-amber-700 font-semibold mb-1">In Progress</div>
            <div className="text-2xl font-black text-amber-600">{monitorData.execution_summary.in_progress_proposals}</div>
            <div className="text-xs text-amber-600 mt-1">Currently executing</div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="text-xs text-slate-700 font-semibold mb-1">Overall Health</div>
            <div className={`text-xl font-black ${
              monitorData.execution_summary.overall_health === 'excellent' ? 'text-green-600' :
              monitorData.execution_summary.overall_health === 'caution' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {monitorData.execution_summary.overall_health.toUpperCase()}
            </div>
          </div>
        </div>
      </Card>

      {/* SynergyFlow Focus */}
      <Card className="p-6 border-l-4 border-cyan-500 bg-cyan-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-cyan-900 flex items-center gap-2">
              <span className="text-xl">⚡</span>
              SynergyFlow Initiative Status
            </h3>
            <p className="text-xs text-cyan-800 mt-1">Unified Premiso + CharityHub platform</p>
          </div>
          <Badge className={`text-white ${monitorData.synergy_flow_status.status === 'healthy' ? 'bg-green-600' : 'bg-amber-600'}`}>
            {monitorData.synergy_flow_status.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded border border-cyan-200">
            <div className="text-xs text-slate-600 font-semibold mb-1">Active Organizations</div>
            <div className="text-2xl font-black text-cyan-600">{monitorData.synergy_flow_status.organizations}</div>
            <div className="text-xs text-slate-600 mt-1">Using shared platform</div>
          </div>

          <div className="p-3 bg-white rounded border border-cyan-200">
            <div className="text-xs text-slate-600 font-semibold mb-1">Product Readiness</div>
            <div className="text-2xl font-black text-emerald-600">{monitorData.synergy_flow_status.avg_readiness}%</div>
            <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${monitorData.synergy_flow_status.avg_readiness}%` }} />
            </div>
          </div>

          <div className="p-3 bg-white rounded border border-cyan-200">
            <div className="text-xs text-slate-600 font-semibold mb-1">Valuation Uplift</div>
            <div className="text-2xl font-black text-purple-600">+{monitorData.synergy_flow_status.valuation_increase}%</div>
            <div className="text-xs text-slate-600 mt-1">Since initiative started</div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <CardTitle className="mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Activity Feed (Last 24 Hours)
        </CardTitle>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
            <span className="text-slate-700">{monitorData.recent_activity.proposals_in_last_24h} new proposals submitted</span>
            <Badge variant="outline">{monitorData.recent_activity.proposals_in_last_24h > 0 ? '✓ Active' : '—'}</Badge>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border-t border-slate-200">
            <span className="text-slate-700">{monitorData.recent_activity.readiness_updates_in_last_24h} readiness updates</span>
            <Badge variant="outline">{monitorData.recent_activity.readiness_updates_in_last_24h > 0 ? '✓ Updated' : '—'}</Badge>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border-t border-slate-200">
            <span className="text-slate-700">{monitorData.recent_activity.audit_events_in_last_24h} audit/compliance events</span>
            <Badge variant="outline">{monitorData.recent_activity.audit_events_in_last_24h > 0 ? '⚠' : '✓'}</Badge>
          </div>
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-slate-500 text-center pt-2">
        Last updated: {new Date(monitorData.timestamp).toLocaleTimeString()} 
        {autoRefresh && ' • Auto-refreshing every 30 seconds'}
      </div>
    </div>
  );
}