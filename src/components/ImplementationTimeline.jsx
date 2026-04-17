import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';

const MILESTONE_STAGES = [
  { key: 'design', label: 'Design', order: 1 },
  { key: 'development', label: 'Development', order: 2 },
  { key: 'qa', label: 'QA', order: 3 },
  { key: 'deployment', label: 'Deployment', order: 4 }
];

export default function ImplementationTimeline() {
  const [implementations, setImplementations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImplementationData();
  }, []);

  const loadImplementationData = async () => {
    try {
      // Get in-progress action items
      const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
        status: 'in_progress'
      });

      // Get related proposals
      const proposals = await base44.asServiceRole.entities.BoardProposal.list();
      const proposalMap = proposals.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Map action items to implementation timeline
      const implementationData = actionItems
        .filter(item => item.trigger_entity_type === 'BoardProposal')
        .map(item => {
          const proposal = proposalMap[item.trigger_entity_id];
          const createdDate = new Date(item.created_date);
          const dueDateMs = item.due_date ? new Date(item.due_date).getTime() : createdDate.getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days default
          const daysElapsed = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const totalDays = Math.floor((dueDateMs - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          const progressPercent = Math.min(100, (daysElapsed / totalDays) * 100);

          // Determine milestones based on progress
          const milestones = MILESTONE_STAGES.map(stage => {
            const stageProgress = (stage.order / MILESTONE_STAGES.length) * 100;
            let status = 'pending';
            if (progressPercent >= stageProgress) {
              status = 'completed';
            } else if (progressPercent >= stageProgress - 20) {
              status = 'in_progress';
            }
            return {
              ...stage,
              status,
              completedDate: status === 'completed' ? new Date(createdDate.getTime() + (totalDays * (stage.order / MILESTONE_STAGES.length)) * 24 * 60 * 60 * 1000) : null
            };
          });

          // Check for delays
          const isDelayed = daysElapsed > totalDays * 0.8; // Delayed if 80%+ of time used

          return {
            id: item.id,
            title: item.title,
            proposalTitle: proposal?.title || 'Unknown',
            product: item.related_product_name,
            status: item.status,
            priority: item.priority,
            createdDate,
            dueDate: item.due_date ? new Date(item.due_date) : new Date(dueDateMs),
            daysElapsed,
            totalDays,
            progressPercent: Math.round(progressPercent),
            milestones,
            isDelayed,
            assignedTo: item.assigned_to
          };
        });

      setImplementations(implementationData.sort((a, b) => b.progressPercent - a.progressPercent));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load implementation data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-900';
      case 'in_progress':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-900';
      case 'high':
        return 'bg-orange-100 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 text-yellow-900';
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Implementation Timeline & Milestones ({implementations.length} active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {implementations.length === 0 ? (
              <p className="text-slate-600 text-sm">No active implementations in progress.</p>
            ) : (
              implementations.map((impl) => (
                <div key={impl.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{impl.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Initiative:</strong> {impl.proposalTitle}
                      </p>
                      {impl.product && (
                        <p className="text-sm text-slate-600">
                          <strong>Product:</strong> {impl.product}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge className={getPriorityColor(impl.priority)}>
                        {impl.priority} priority
                      </Badge>
                      {impl.isDelayed && (
                        <Badge className="bg-red-100 text-red-900 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Delayed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">Overall Progress</span>
                      <span className="text-xs font-bold text-slate-900">{impl.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${impl.isDelayed ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${impl.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {impl.daysElapsed} of {impl.totalDays} days used
                      {impl.isDelayed && <span className="text-red-600"> — ⚠️ Behind schedule</span>}
                    </p>
                  </div>

                  {/* Milestones Timeline */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-700 mb-3">Milestone Progress</p>
                    <div className="grid grid-cols-4 gap-3">
                      {impl.milestones.map((milestone, idx) => (
                        <div key={milestone.key} className="flex flex-col items-center">
                          {/* Milestone Circle */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                            milestone.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : milestone.status === 'in_progress'
                              ? 'bg-blue-500 text-white animate-pulse'
                              : 'bg-gray-300 text-gray-700'
                          }`}>
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : milestone.status === 'in_progress' ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-bold">{milestone.order}</span>
                            )}
                          </div>

                          {/* Milestone Label */}
                          <p className="text-xs font-semibold text-slate-900 text-center">{milestone.label}</p>

                          {/* Completion Date */}
                          {milestone.completedDate && (
                            <p className="text-xs text-slate-600 text-center mt-1">
                              {milestone.completedDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                            </p>
                          )}

                          {/* Connector Line */}
                          {idx < impl.milestones.length - 1 && (
                            <div className="absolute right-0 w-3 h-0.5 bg-slate-300 mt-5" style={{ marginLeft: '20px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Details */}
                  <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600">Started</p>
                      <p className="font-semibold text-slate-900">
                        {impl.createdDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Target Completion</p>
                      <p className={`font-semibold ${impl.isDelayed ? 'text-red-600' : 'text-slate-900'}`}>
                        {impl.dueDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Assigned To</p>
                      <p className="font-semibold text-slate-900">{impl.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>

                  {/* Delay Reason Section */}
                  {impl.isDelayed && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Delay Analysis</p>
                      <p className="text-xs text-red-800">
                        This initiative has used {Math.round((impl.daysElapsed / impl.totalDays) * 100)}% of allocated time. 
                        Consider reallocating resources or extending the deadline.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-xs text-blue-700 font-semibold">Total Active Implementations</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{implementations.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-xs text-red-700 font-semibold">At Risk (Delayed)</p>
            <p className="text-3xl font-black text-red-600 mt-2">
              {implementations.filter(i => i.isDelayed).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-xs text-green-700 font-semibold">Avg Progress</p>
            <p className="text-3xl font-black text-green-600 mt-2">
              {Math.round(implementations.reduce((sum, i) => sum + i.progressPercent, 0) / implementations.length)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}