import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function CapacityManagementTool() {
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);

  useEffect(() => {
    analyzeCapacity();
  }, []);

  const analyzeCapacity = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeCapacityAllocation', {});
      setCapacityData(response);
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze capacity allocation');
    } finally {
      setLoading(false);
    }
  };

  const executeRebalance = async (recommendation) => {
    setRebalancing(true);
    try {
      // Move tasks to new owner
      for (const taskId of recommendation.taskIds) {
        await base44.asServiceRole.functions.invoke('updateActionItemOwner', {
          taskId,
          newOwner: recommendation.toOwner
        });
      }
      
      await base44.asServiceRole.functions.invoke('boardCommunications', {
        action: 'send_message',
        channel_id: 'strategy',
        message_content: `✅ CAPACITY REBALANCING EXECUTED: Moved ${recommendation.tasksToMove} tasks from ${recommendation.fromOwner} to ${recommendation.toOwner}. ${recommendation.impact}`,
        message_type: 'decision',
        from_member: '⚖️ Capacity Manager'
      });

      toast.success('Tasks rebalanced successfully');
      analyzeCapacity();
    } catch (error) {
      console.error(error);
      toast.error('Failed to rebalance tasks');
    } finally {
      setRebalancing(false);
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

  if (!capacityData) {
    return null;
  }

  const maxLoad = Math.max(...capacityData.capacityAnalysis.map(o => o.totalWeightedLoad));
  const threshold = parseFloat(capacityData.metrics.threshold);

  return (
    <div className="space-y-6">
      {/* Capacity Metrics */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Team Capacity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 bg-white rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{capacityData.metrics.totalTasks}</div>
              <div className="text-xs text-slate-600 mt-1">Total Active Tasks</div>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{capacityData.metrics.avgLoad}</div>
              <div className="text-xs text-slate-600 mt-1">Avg Load per Owner</div>
            </div>
            <div className="p-3 bg-white rounded border border-red-200 bg-red-50">
              <div className="text-2xl font-bold text-red-600">{capacityData.metrics.overAllocatedCount}</div>
              <div className="text-xs text-red-700 mt-1">Over-Allocated</div>
            </div>
            <div className="p-3 bg-white rounded border border-yellow-200 bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{capacityData.metrics.underUtilizedCount}</div>
              <div className="text-xs text-yellow-700 mt-1">Under-Utilized</div>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{capacityData.metrics.threshold}</div>
              <div className="text-xs text-slate-600 mt-1">Over-Allocation Threshold</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Capacity Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Team Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {capacityData.capacityAnalysis.map((owner, idx) => {
            const percentage = (owner.totalWeightedLoad / maxLoad) * 100;
            const isOverAllocated = owner.totalWeightedLoad > threshold;
            const isUnderUtilized = owner.totalWeightedLoad < parseFloat(capacityData.metrics.avgLoad) * 0.5;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{owner.owner}</div>
                    <div className="text-xs text-slate-600">{owner.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {owner.totalWeightedLoad.toFixed(1)}
                    </span>
                    {isOverAllocated && (
                      <Badge className="bg-red-100 text-red-900">Over-allocated</Badge>
                    )}
                    {isUnderUtilized && (
                      <Badge className="bg-yellow-100 text-yellow-900">Under-utilized</Badge>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverAllocated ? 'bg-red-500' :
                      isUnderUtilized ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600">
                  {owner.taskCount} tasks • {percentage.toFixed(0)}% of peak capacity
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Rebalancing Recommendations */}
      {capacityData.rebalancingRecommendations.length > 0 && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Auto-Rebalancing Opportunities
            </CardTitle>
            <p className="text-sm text-red-800 mt-2">
              {capacityData.rebalancingRecommendations.length} rebalancing actions available to optimize team capacity
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {capacityData.rebalancingRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-white rounded border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{rec.fromOwner}</span>
                      <ArrowRight className="w-4 h-4 text-red-500" />
                      <span>{rec.toOwner}</span>
                    </div>
                    <div className="text-sm text-slate-700 mt-1">{rec.impact}</div>
                  </div>
                  <Badge className={
                    rec.severity === 'critical' 
                      ? 'bg-red-600' 
                      : 'bg-orange-500'
                  }>
                    {rec.severity.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 mb-3">
                  Move {rec.tasksToMove} tasks • Load reduction: {rec.estimatedLoadReduction}
                </div>
                <Button
                  onClick={() => executeRebalance(rec)}
                  disabled={rebalancing}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {rebalancing ? 'Rebalancing...' : 'Execute Rebalance'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Issues */}
      {capacityData.rebalancingRecommendations.length === 0 && capacityData.metrics.overAllocatedCount === 0 && (
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Capacity Balanced</p>
                <p className="text-sm text-green-800">All teams are operating within optimal capacity limits. No rebalancing required.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}