import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

export default function GanttChart() {
  const [items, setItems] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [actionItems, boardProposals] = await Promise.all([
          base44.entities.ActionItem.filter({ status: 'in_progress' }, '-due_date', 100),
          base44.entities.BoardProposal.filter({ status: 'approved' }, '-timestamp', 100),
        ]);

        setItems(actionItems.filter(item => item.due_date));
        setProposals(boardProposals);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeItems = base44.entities.ActionItem.subscribe((event) => {
      if (event.data?.status === 'in_progress' && event.data?.due_date) {
        if (event.type === 'create') {
          setItems(prev => [...prev, event.data]);
        } else if (event.type === 'update') {
          setItems(prev => prev.map(i => i.id === event.id ? event.data : i));
        } else if (event.type === 'delete') {
          setItems(prev => prev.filter(i => i.id !== event.id));
        }
      }
    });

    return () => unsubscribeItems();
  }, []);

  if (loading) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate timeline span
  const today = new Date();
  const allDates = items.map(i => parseISO(i.due_date));
  const minDate = new Date(Math.min(...allDates, today));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = differenceInDays(maxDate, minDate) + 1;

  // Helper to calculate position
  const getProgress = (itemDate) => {
    const itemTime = parseISO(itemDate).getTime();
    const minTime = minDate.getTime();
    const totalTime = maxDate.getTime() - minTime;
    return ((itemTime - minTime) / totalTime) * 100;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-blue-600';
      default:
        return 'bg-slate-600';
    }
  };

  const sortedItems = items.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  return (
    <Card className="border-slate-200 bg-white overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Initiative Timeline
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {sortedItems.length} in-progress initiatives • {totalDays} day span
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No in-progress initiatives</p>
          </div>
        ) : (
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="flex gap-4 mb-4 pb-4 border-b border-slate-200">
              <div className="w-48 flex-shrink-0 text-xs font-semibold text-slate-700">
                Initiative
              </div>
              <div className="flex-1 relative h-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-slate-300" />
                </div>
                <div className="absolute inset-0 flex justify-between px-2 text-xs text-slate-600">
                  <span>{minDate.toLocaleDateString()}</span>
                  <span>{maxDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="w-24 flex-shrink-0" />
            </div>

            {/* Timeline Rows */}
            <div className="space-y-3">
              {sortedItems.map((item) => {
                const daysUntilDue = differenceInDays(parseISO(item.due_date), today);
                const isOverdue = daysUntilDue < 0;
                const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0;

                return (
                  <div key={item.id} className="flex gap-4 items-center">
                    {/* Label */}
                    <div className="w-48 flex-shrink-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {item.related_product_name}
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 relative h-10 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      {/* Progress bar */}
                      <div
                        className={`h-full rounded-lg transition-all ${getPriorityColor(item.priority)} opacity-80 hover:opacity-100`}
                        style={{
                          width: `${Math.max(5, getProgress(item.due_date))}%`,
                          minWidth: '40px',
                        }}
                        title={`Due: ${new Date(item.due_date).toLocaleDateString()}`}
                      >
                        <div className="h-full flex items-center px-2 text-xs text-white font-semibold">
                          {item.category}
                        </div>
                      </div>

                      {/* Today marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                        style={{
                          left: `${getProgress(today.toISOString())}%`,
                        }}
                        title="Today"
                      />
                    </div>

                    {/* Status Indicator */}
                    <div className="w-24 flex-shrink-0 flex items-center gap-2 justify-end">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900">
                          {isOverdue ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          ) : isUrgent ? (
                            <span className="text-orange-600">{daysUntilDue}d left</span>
                          ) : (
                            <span className="text-green-600">{daysUntilDue}d left</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(item.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(item.priority)} text-white text-xs`}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-600" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 rounded bg-blue-500" />
                <span>Today</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}