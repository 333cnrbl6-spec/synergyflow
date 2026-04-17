import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImplementationPanel({ verification, onRefresh }) {
  const [deployingIssueId, setDeployingIssueId] = useState(null);
  const [showRollbackPlan, setShowRollbackPlan] = useState(null);
  const [rollbackPlan, setRollbackPlan] = useState('');
  const [implementationNotes, setImplementationNotes] = useState('');

  const handleAutoDeploy = async (issue) => {
    if (!rollbackPlan.trim()) {
      toast.error('Please provide a rollback plan');
      return;
    }

    setDeployingIssueId(issue.issue_id);

    try {
      const res = await base44.functions.invoke('autoDeployFix', {
        verification_id: verification.id,
        issue_id: issue.issue_id,
        issue_description: issue.description,
        issue_severity: issue.severity,
        fix_type: 'bug_fix',
        rollback_plan: rollbackPlan,
        implementation_notes: implementationNotes
      });

      if (res.data.success) {
        toast.success(`Fix deployed for ${issue.description}`);
        setRollbackPlan('');
        setImplementationNotes('');
        setShowRollbackPlan(null);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to deploy fix');
    } finally {
      setDeployingIssueId(null);
    }
  };

  const severityColors = {
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-200 text-red-900'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Auto-Deploy Fixes</h3>
      </div>

      {(!verification.issues_found || verification.issues_found.length === 0) ? (
        <Card className="text-center py-8 bg-green-50 border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-700 font-medium">No issues found</p>
          <p className="text-sm text-green-600">Product verification passed all tests</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {verification.issues_found.map((issue) => (
            <Card key={issue.issue_id} className="border-red-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={severityColors[issue.severity]}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-slate-900">{issue.description}</span>
                    </div>
                    <p className="text-xs text-slate-500">Status: <span className="font-medium capitalize">{issue.status}</span></p>
                  </div>
                  {issue.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => setShowRollbackPlan(
                        showRollbackPlan === issue.issue_id ? null : issue.issue_id
                      )}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="w-4 h-4" />
                      {deployingIssueId === issue.issue_id ? 'Deploying...' : 'Deploy Fix'}
                    </Button>
                  )}
                  {issue.status === 'resolved' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Deployed</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Deployment Form */}
              {showRollbackPlan === issue.issue_id && issue.status === 'open' && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Rollback Plan (Required)
                    </label>
                    <Textarea
                      placeholder="Describe how to rollback this fix if needed..."
                      value={rollbackPlan}
                      onChange={(e) => setRollbackPlan(e.target.value)}
                      className="h-20 resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Ensures safe deployment</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Implementation Notes (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any notes about the implementation..."
                      value={implementationNotes}
                      onChange={(e) => setImplementationNotes(e.target.value)}
                      className="h-16 resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-900">
                      <strong>⚡ Auto-Deploy:</strong> This fix will be deployed immediately to your product. Make sure you have a rollback plan in case of issues.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAutoDeploy(issue)}
                      disabled={!rollbackPlan.trim() || deployingIssueId === issue.issue_id}
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {deployingIssueId === issue.issue_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Deploy Now
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRollbackPlan(null);
                        setRollbackPlan('');
                        setImplementationNotes('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}