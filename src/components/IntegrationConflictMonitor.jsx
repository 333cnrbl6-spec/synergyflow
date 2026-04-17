import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationConflictMonitor() {
  const [conflicts, setConflicts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scanForConflicts();
  }, []);

  const scanForConflicts = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('monitorIntegrationConflicts', {});
      setConflicts(response.conflicts);
    } catch (error) {
      console.error(error);
      toast.error('Failed to scan for integration conflicts');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 border-red-300 text-red-900',
      high: 'bg-orange-100 border-orange-300 text-orange-900',
      medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
      low: 'bg-blue-100 border-blue-300 text-blue-900'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <AlertTriangle className="w-5 h-5 text-red-600" />,
      high: <AlertCircle className="w-5 h-5 text-orange-600" />,
      medium: <Zap className="w-5 h-5 text-yellow-600" />,
      low: <CheckCircle2 className="w-5 h-5 text-blue-600" />
    };
    return icons[severity] || icons.low;
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

  if (!conflicts) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-6 h-6" />
            Integration Conflict Monitoring Report
          </CardTitle>
          <p className="text-sm text-red-800 mt-2">
            Automated scan of active board integration tasks for conflicts, overlaps, and bottlenecks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {conflicts.resourceBottlenecks.length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Critical Bottlenecks</div>
            </div>
            <div className="p-4 bg-white rounded border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {conflicts.dataConflicts.length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Data Conflicts</div>
            </div>
            <div className="p-4 bg-white rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {conflicts.overlappingLogic.length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Logic Overlaps</div>
            </div>
            <div className="p-4 bg-white rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-600">
                {conflicts.dataConflicts.length + conflicts.overlappingLogic.length + conflicts.resourceBottlenecks.length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Total Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Bottlenecks */}
      {conflicts.resourceBottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              🔴 Critical: Resource Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflicts.resourceBottlenecks.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded border-l-4 border-red-500 ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="font-semibold">{issue.issue}</div>
                    <div className="text-sm mt-2">{issue.recommendation}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Data Conflicts */}
      {conflicts.dataConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              🟠 High: Data Schema Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflicts.dataConflicts.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded border-l-4 border-orange-500 ${getSeverityColor(issue.severity)}`}>
                <div className="font-semibold mb-2">
                  {issue.product}: {issue.count} concurrent integrations
                </div>
                <div className="text-sm mb-2">{issue.issue}</div>
                <div className="text-xs mb-2">
                  <strong>Affected tasks:</strong> {issue.items.join(', ')}
                </div>
                <div className="text-sm text-slate-700">{issue.recommendation}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Overlapping Logic */}
      {conflicts.overlappingLogic.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Zap className="w-5 h-5" />
              🟡 Medium: Overlapping Logic Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflicts.overlappingLogic.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded border-l-4 border-yellow-500 ${getSeverityColor(issue.severity)}`}>
                <div className="font-semibold mb-2">
                  "{issue.pattern}": {issue.count} implementations
                </div>
                <div className="text-sm mb-2">{issue.issue}</div>
                <div className="text-sm text-slate-700">{issue.recommendation}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prioritized Resolution Strategies */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Prioritized Resolution Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conflicts.priorityResolutions.map((resolution, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-slate-200 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-slate-600">{resolution.priority}</Badge>
                    <div className="font-semibold text-slate-900">{resolution.title}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${
                    resolution.severity === 'critical' ? 'bg-red-100 text-red-900' :
                    resolution.severity === 'high' ? 'bg-orange-100 text-orange-900' :
                    'bg-yellow-100 text-yellow-900'
                  }`}>
                    {resolution.severity.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-slate-700 mb-2">{resolution.strategy}</div>
                <div className="text-xs text-slate-600 italic">
                  Impact: {resolution.estimatedImpact}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Footer */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-900 space-y-2">
            <p className="font-semibold">✓ Monitoring Recommendations:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Address critical resource bottlenecks immediately via task prioritization and load-balancing</li>
              <li>Establish shared data schema governance across conflicting product integrations</li>
              <li>Consolidate duplicated logic patterns into reusable utility libraries</li>
              <li>Schedule weekly conflict scans during active integration phases</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}