import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Send, Pause, Play, FileText } from 'lucide-react';
import { toast } from 'sonner';
import ReportBuilder from '@/components/ReportBuilder';

export default function ReportsManager() {
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [sendingReportId, setSendingReportId] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await base44.entities.Report.list();
      return res.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await base44.entities.Report.delete(id);
      toast.success('Report deleted');
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleToggleStatus = async (report) => {
    try {
      const newStatus = report.status === 'active' ? 'paused' : 'active';
      await base44.entities.Report.update(report.id, { status: newStatus });
      toast.success(`Report ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleSendNow = async (report) => {
    setSendingReportId(report.id);
    try {
      await base44.functions.invoke('generateAndEmailReport', { report_id: report.id });
      toast.success(`Report sent to ${report.recipients.length} recipient(s)`);
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error) {
      console.error(error);
      toast.error('Failed to send report');
    } finally {
      setSendingReportId(null);
    }
  };

  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const scheduleString = (report) => {
    if (report.frequency === 'weekly') {
      return `Every ${dayOfWeekNames[report.day_of_week]} at ${report.send_time}`;
    } else {
      return `Day ${report.day_of_month} of month at ${report.send_time}`;
    }
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setShowBuilder(false);
              setEditingReport(null);
            }}
            className="mb-6"
          >
            ← Back
          </Button>
          <ReportBuilder
            initialReport={editingReport}
            onSave={async () => {
              setShowBuilder(false);
              setEditingReport(null);
              await queryClient.invalidateQueries({ queryKey: ['reports'] });
            }}
            onCancel={() => {
              setShowBuilder(false);
              setEditingReport(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">Reports Manager</h1>
          <p className="text-slate-600 mt-2">Create and schedule automated portfolio reports</p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setEditingReport(null);
              setShowBuilder(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No reports yet. Create one to get started.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map(report => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{report.report_name}</h3>
                        <Badge
                          className={
                            report.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {report.status}
                        </Badge>
                      </div>
                      {report.description && (
                        <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                      )}
                      <p className="text-sm text-slate-600">
                        <strong>Schedule:</strong> {scheduleString(report)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Recipients:</strong> {report.recipients.join(', ')}
                      </p>
                      {report.last_sent && (
                        <p className="text-xs text-slate-500 mt-2">
                          Last sent: {new Date(report.last_sent).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendNow(report)}
                        disabled={sendingReportId === report.id}
                        className="gap-1"
                      >
                        {sendingReportId === report.id ? (
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(report)}
                        className="gap-1"
                      >
                        {report.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingReport(report);
                          setShowBuilder(true);
                        }}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(report.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Report Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {report.include_portfolio_metrics && (
                        <Badge variant="secondary" className="text-xs">Portfolio Metrics</Badge>
                      )}
                      {report.include_churn_analysis && (
                        <Badge variant="secondary" className="text-xs">Churn Analysis</Badge>
                      )}
                      {report.include_benchmark_comparison && (
                        <Badge variant="secondary" className="text-xs">Benchmarks</Badge>
                      )}
                      {report.include_product_breakdown && (
                        <Badge variant="secondary" className="text-xs">Product Breakdown</Badge>
                      )}
                      {report.include_action_items && (
                        <Badge variant="secondary" className="text-xs">Action Items</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}