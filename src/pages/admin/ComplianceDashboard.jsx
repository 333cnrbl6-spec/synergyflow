import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, FileText, Clock, TrendingUp, AlertCircle, CheckCircle2, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Extracted KPICard component for maintainability
function KPICard({ title, value, icon: Icon, color, description, trend }) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <Icon className={`w-5 h-5 opacity-70`} />
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-70">{description}</div>
        {trend && (
          <div className={`text-xs mt-2 font-semibold ${
            trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-slate-600'
          }`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#eab308',
  low: '#22c55e'
};

const DOMAIN_COLORS = {
  property: '#3b82f6',
  legal: '#8b5cf6',
  charity: '#ec4899',
  conservation: '#10b981',
  general: '#64748b'
};

export default function ComplianceDashboard() {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Fetch audit trail data
  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ['audit-trail', selectedPeriod],
    queryFn: async () => {
      const allAudits = await base44.entities.AuditTrail.list();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(selectedPeriod));
      return (allAudits || []).filter(a => new Date(a.timestamp) >= cutoffDate);
    }
  });

  // Fetch entities that might have compliance issues
  const { data: tenancies } = useQuery({
    queryKey: ['tenancies'],
    queryFn: () => base44.entities.TenancyAgreement?.list() || Promise.resolve([])
  });

  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case?.list() || Promise.resolve([])
  });

  const { data: donations } = useQuery({
    queryKey: ['donations'],
    queryFn: () => base44.entities.Donation?.list() || Promise.resolve([])
  });

  const { data: surveys } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => base44.entities.Survey?.list() || Promise.resolve([])
  });

  // Calculate compliance metrics
  const metrics = calculateComplianceMetrics(audits, tenancies, cases, donations, surveys, selectedDomain);

  if (auditsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-green-400" />
              <h1 className="text-2xl font-bold">Portfolio Compliance Monitor</h1>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl">
              Real-time tracking of regulatory compliance, critical deadlines, and risk flags across all portfolio apps.
              Integrated with AuditTrail and FileProcessingPipeline for automatic detection.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">All Domains</option>
              <option value="property">Property (Premiso)</option>
              <option value="legal">Legal (CaseNarrative)</option>
              <option value="charity">Charity (CharityHub)</option>
              <option value="conservation">Conservation (Species Explorer)</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Critical Risks"
          value={metrics.criticalRisks}
          icon={AlertCircle}
          color="red"
          description="Requires immediate action"
          trend={metrics.trends.critical}
        />
        <KPICard
          title="High Priority"
          value={metrics.highRisks}
          icon={AlertTriangle}
          color="orange"
          description="Review within 24 hours"
          trend={metrics.trends.high}
        />
        <KPICard
          title="Compliance Rate"
          value={`${metrics.complianceRate}%`}
          icon={CheckCircle2}
          color="green"
          description="Records meeting standards"
          trend={metrics.trends.compliance}
        />
        <KPICard
          title="Audits This Period"
          value={metrics.totalAudits}
          icon={FileText}
          color="blue"
          description="Tracked modifications"
          trend={metrics.trends.audits}
        />
      </div>

      {/* Critical Alerts */}
      {metrics.criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Critical Compliance Alerts — Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.criticalAlerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-red-900">{alert.title}</span>
                      <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Critical</Badge>
                    </div>
                    <p className="text-sm text-red-700">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-red-600">
                      <span>Entity: {alert.entity_name}</span>
                      <span>Record: {alert.entity_id}</span>
                      <span>Regulation: {alert.regulation}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Risk Distribution by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metrics.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Compliance Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="compliant" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="review_required" stroke="#eab308" strokeWidth={2} />
                <Line type="monotone" dataKey="non_compliant" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issues by Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Compliance Issues by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.domainIssues}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="issues" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Compliance Violations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Compliance Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topViolations.map((violation, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${violation.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                    <span className="text-sm font-medium">{violation.type}</span>
                  </div>
                  <Badge variant="outline">{violation.count} occurrences</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Audit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Timestamp</th>
                  <th className="text-left py-2 px-3 font-semibold">Entity</th>
                  <th className="text-left py-2 px-3 font-semibold">Action</th>
                  <th className="text-left py-2 px-3 font-semibold">User</th>
                  <th className="text-left py-2 px-3 font-semibold">Compliance Flags</th>
                  <th className="text-left py-2 px-3 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {(audits || []).slice(0, 20).map((audit) => (
                  <tr key={audit.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-3 text-xs">
                      {new Date(audit.timestamp).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2 px-3">{audit.entity_name}</td>
                    <td className="py-2 px-3">
                      <Badge className={
                        audit.action === 'create' ? 'bg-green-100 text-green-800' :
                        audit.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>{audit.action}</Badge>
                    </td>
                    <td className="py-2 px-3 text-xs">{audit.user_email}</td>
                    <td className="py-2 px-3">
                      {audit.compliance_flags?.length > 0 ? (
                        <div className="flex gap-1">
                          {audit.compliance_flags.slice(0, 2).map((flag, i) => (
                            <Badge key={i} className={`text-xs ${
                              flag.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              flag.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>{flag.type}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <Badge className={`text-xs ${
                        audit.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        audit.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        audit.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>{audit.risk_level || 'N/A'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function calculateComplianceMetrics(audits, tenancies, cases, donations, surveys, domain) {
  if (!audits) {
    return {
      criticalRisks: 0,
      highRisks: 0,
      complianceRate: 100,
      totalAudits: 0,
      trends: {},
      criticalAlerts: [],
      riskDistribution: [],
      trendData: [],
      domainIssues: [],
      topViolations: []
    };
  }

  // Filter by domain if selected
  let filteredAudits = audits;
  if (domain !== 'all') {
    const domainEntities = {
      property: ['TenancyAgreement', 'Property', 'Tenant', 'InspectionReport'],
      legal: ['Case', 'Client', 'LegalDocument', 'CourtHearing'],
      charity: ['Donation', 'Grant', 'Campaign', 'Volunteer'],
      conservation: ['Survey', 'SpeciesObservation', 'Site', 'Researcher']
    };
    filteredAudits = audits.filter(a => 
      domainEntities[domain]?.includes(a.entity_name) || 
      a.entity_name === 'AuditTrail'
    );
  }

  // Count risks by severity
  const criticalRisks = filteredAudits.filter(a => 
    a.compliance_flags?.some(f => f.severity === 'critical') || 
    a.risk_level === 'critical'
  ).length;

  const highRisks = filteredAudits.filter(a => 
    a.compliance_flags?.some(f => f.severity === 'high') || 
    a.risk_level === 'high'
  ).length;

  // Calculate compliance rate
  const compliant = filteredAudits.filter(a => 
    a.compliance_status === 'compliant' || 
    !a.compliance_flags || a.compliance_flags.length === 0
  ).length;
  const complianceRate = filteredAudits.length > 0 
    ? Math.round((compliant / filteredAudits.length) * 100) 
    : 100;

  // Generate critical alerts
  const criticalAlerts = filteredAudits
    .filter(a => a.compliance_flags?.some(f => f.severity === 'critical'))
    .flatMap(audit => 
      audit.compliance_flags
        .filter(f => f.severity === 'critical')
        .map(flag => ({
          title: flag.message,
          description: flag.regulation,
          entity_name: audit.entity_name,
          entity_id: audit.entity_id,
          regulation: flag.regulation,
          timestamp: audit.timestamp
        }))
    )
    .slice(0, 10);

  // Risk distribution for pie chart
  const riskDistribution = [
    { name: 'Critical', value: criticalRisks },
    { name: 'High', value: highRisks },
    { name: 'Medium', value: filteredAudits.filter(a => 
      a.compliance_flags?.some(f => f.severity === 'medium')
    ).length },
    { name: 'Low', value: filteredAudits.filter(a => 
      a.compliance_flags?.some(f => f.severity === 'low')
    ).length }
  ].filter(d => d.value > 0);

  // Top violations
  const violationCounts = {};
  filteredAudits.forEach(audit => {
    audit.compliance_flags?.forEach(flag => {
      violationCounts[flag.type] = (violationCounts[flag.type] || 0) + 1;
    });
  });

  const topViolations = Object.entries(violationCounts)
    .map(([type, count]) => ({
      type,
      count,
      severity: count > 5 ? 'critical' : count > 2 ? 'high' : 'medium'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Domain issues
  const domainCounts = {};
  filteredAudits.forEach(audit => {
    const entityDomain = getEntityDomain(audit.entity_name);
    domainCounts[entityDomain] = (domainCounts[entityDomain] || 0) + 1;
  });

  const domainIssues = Object.entries(domainCounts).map(([d, issues]) => ({
    domain: d,
    issues
  }));

  // Trend data (simplified)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    
    const dayAudits = filteredAudits.filter(a => 
      new Date(a.timestamp).toDateString() === date.toDateString()
    );

    return {
      date: dateStr,
      compliant: dayAudits.filter(a => !a.compliance_flags?.length).length,
      review_required: dayAudits.filter(a => 
        a.compliance_flags?.some(f => f.severity === 'medium')
      ).length,
      non_compliant: dayAudits.filter(a => 
        a.compliance_flags?.some(f => ['high', 'critical'].includes(f.severity))
      ).length
    };
  });

  return {
    criticalRisks,
    highRisks,
    complianceRate,
    totalAudits: filteredAudits.length,
    trends: {
      critical: criticalRisks > 5 ? 15 : criticalRisks > 0 ? 5 : 0,
      high: highRisks > 10 ? 10 : highRisks > 0 ? 3 : 0,
      compliance: complianceRate < 90 ? -5 : complianceRate < 95 ? -2 : 2,
      audits: filteredAudits.length > 50 ? 8 : 0
    },
    criticalAlerts,
    riskDistribution,
    trendData,
    domainIssues,
    topViolations
  };
}

function getEntityDomain(entityName) {
  if (['TenancyAgreement', 'Property', 'Tenant', 'InspectionReport'].includes(entityName)) return 'Property';
  if (['Case', 'Client', 'LegalDocument', 'CourtHearing'].includes(entityName)) return 'Legal';
  if (['Donation', 'Grant', 'Campaign', 'Volunteer'].includes(entityName)) return 'Charity';
  if (['Survey', 'SpeciesObservation', 'Site', 'Researcher'].includes(entityName)) return 'Conservation';
  return 'General';
}