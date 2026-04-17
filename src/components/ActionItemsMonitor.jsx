import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Zap, RefreshCw } from 'lucide-react';

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-blue-100 text-blue-800 border-blue-300'
};

const CATEGORY_ICONS = {
  compliance: '⚖️',
  readiness: '✅',
  revenue: '💰',
  product_health: '🏥',
  proposal: '📋'
};

export default function ActionItemsMonitor() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch action items
  const { data: actionItems = [], isLoading, refetch } = useQuery({
    queryKey: ['actionItems'],
    queryFn: async () => {
      const res = await base44.entities.ActionItem.list();
      return res.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
  });

  // Fetch trigger status
  const { data: triggerStatus } = useQuery({
    queryKey: ['triggerStatus'],
    queryFn: async () => {
      const res = await base44.functions.invoke('portfolioAutomationService', {
        action: 'check_triggers'
      });
      return res.data;
    },
    refetchInterval: 300000 // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await base44.functions.invoke('portfolioAutomationService', {
        action: 'check_triggers'
      });
      await queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      await queryClient.invalidateQueries({ queryKey: ['triggerStatus'] });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkComplete = async (actionId) => {
    await base44.entities.ActionItem.update(actionId, { status: 'completed' });
    await queryClient.invalidateQueries({ queryKey: ['actionItems'] });
  };

  const openItems = actionItems.filter(a => a.status === 'open');
  const criticalItems = openItems.filter(a => a.priority === 'critical');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open Actions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{openItems.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Critical Priority</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{criticalItems.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Last Scan</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">Just now</p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="self-start"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions List */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {openItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-slate-600">All clear! No action items at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 flex items-start justify-between ${
                    item.priority === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : item.priority === 'high'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">
                        {CATEGORY_ICONS[item.category] || '📌'}
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={PRIORITY_COLORS[item.priority]}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.due_date && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </Badge>
                      )}
                      {item.related_product_name && (
                        <Badge variant="secondary" className="text-xs">
                          {item.related_product_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMarkComplete(item.id)}
                    className="gap-2 ml-4 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trigger Summary */}
      {triggerStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <p>
              Found <span className="font-semibold text-slate-900">{triggerStatus.triggers_found}</span> triggers across portfolio.
              Created <span className="font-semibold text-slate-900">{triggerStatus.actions_created}</span> action items.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}