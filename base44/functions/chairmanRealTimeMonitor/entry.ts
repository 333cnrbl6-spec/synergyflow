import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || !['admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all critical data for chairman monitoring
    const [proposals, readiness, valuations, subscriptions, actionItems, audits] = await Promise.all([
      base44.entities.BoardProposal.list().catch(() => []),
      base44.entities.ProductReadiness.list().catch(() => []),
      base44.entities.ValuationSnapshot.list().catch(() => []),
      base44.entities.AppSubscription.list().catch(() => []),
      base44.entities.ActionItem.list().catch(() => []),
      base44.entities.AuditTrail.list().catch(() => [])
    ]);

    // Detect improvements since last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentProposals = proposals.filter(p => new Date(p.timestamp) > last24h);
    const recentReadiness = readiness.filter(r => new Date(r.last_assessed) > last24h);
    const recentAudits = audits.filter(a => new Date(a.timestamp) > last24h);

    // Calculate trends
    const synergyProducts = ['premiso', 'charityhub'];
    const synergySubs = subscriptions.filter(sub => 
      synergyProducts.some(prod => sub.apps_included?.includes(prod))
    );

    const synergyReadiness = readiness.filter(r => 
      synergyProducts.some(prod => r.product_name?.toLowerCase().includes(prod))
    );

    const latestVals = {};
    valuations.forEach(val => {
      const key = val.product_name?.toLowerCase().replace(/\s+/g, '_');
      if (!latestVals[key] || new Date(val.snapshot_date) > new Date(latestVals[key].snapshot_date)) {
        latestVals[key] = val;
      }
    });

    // Build real-time status
    const chairmanReport = {
      timestamp: new Date().toISOString(),
      chairman_focus: {
        critical_alerts: [],
        improvements_detected: [],
        execution_status: 'nominal',
        requires_attention: false
      },
      synergy_flow_status: {
        name: 'SynergyFlow Initiative (Premiso + CharityHub)',
        organizations: synergySubs.length,
        avg_readiness: synergyReadiness.length > 0 
          ? Math.round(synergyReadiness.reduce((sum, r) => sum + r.overall_readiness_percentage, 0) / synergyReadiness.length)
          : 0,
        valuation_increase: (() => {
          const totalBefore = Object.values(latestVals).reduce((sum, v) => sum + (v?.sell_now_value || 0) * 0.8, 0);
          const totalAfter = Object.values(latestVals).reduce((sum, v) => sum + (v?.sell_now_value || 0), 0);
          return totalBefore > 0 ? Math.round(((totalAfter - totalBefore) / totalBefore) * 100) : 0;
        })(),
        status: 'operational'
      },
      execution_summary: {
        approved_proposals: proposals.filter(p => p.status === 'approved').length,
        completed_proposals: proposals.filter(p => p.approval_stage === 'completed').length,
        in_progress_proposals: proposals.filter(p => p.approval_stage === 'passed' || p.approval_stage === 'final_approval').length,
        pending_proposals: proposals.filter(p => p.approval_stage === 'needs_review').length
      },
      recent_activity: {
        proposals_in_last_24h: recentProposals.length,
        readiness_updates_in_last_24h: recentReadiness.length,
        audit_events_in_last_24h: recentAudits.length
      }
    };

    // Detect improvements
    if (recentReadiness.length > 0) {
      const avgNewReadiness = recentReadiness.reduce((sum, r) => sum + r.overall_readiness_percentage, 0) / recentReadiness.length;
      if (avgNewReadiness >= 75) {
        chairmanReport.chairman_focus.improvements_detected.push({
          type: 'high_readiness',
          message: `${recentReadiness.length} products now showing launch-ready readiness (≥75%)`,
          priority: 'high',
          action: 'Review for go-to-market approval'
        });
      }
    }

    // Check for critical compliance issues
    const criticalAudits = recentAudits.filter(a => 
      a.compliance_flags?.some(f => f.severity === 'critical')
    );
    if (criticalAudits.length > 0) {
      chairmanReport.chairman_focus.critical_alerts.push({
        type: 'compliance_critical',
        count: criticalAudits.length,
        message: `${criticalAudits.length} critical compliance issues detected in last 24h`,
        priority: 'critical',
        action: 'Immediate review required'
      });
      chairmanReport.chairman_focus.execution_status = 'caution';
      chairmanReport.chairman_focus.requires_attention = true;
    }

    // Check for execution velocity
    const approvedThisMonth = proposals.filter(p => {
      const propDate = new Date(p.timestamp);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return propDate > monthAgo && p.status === 'approved';
    }).length;

    if (approvedThisMonth > 10) {
      chairmanReport.chairman_focus.improvements_detected.push({
        type: 'execution_velocity',
        message: `${approvedThisMonth} proposals approved in last 30 days (high execution velocity)`,
        priority: 'medium',
        action: 'Monitor capacity and team bandwidth'
      });
    }

    // Check synergy cross-product metrics
    if (synergySubs.length > 5) {
      chairmanReport.chairman_focus.improvements_detected.push({
        type: 'synergy_adoption',
        message: `SynergyFlow reaching ${synergySubs.length} organizations with unified platform`,
        priority: 'high',
        action: 'Consider scaling marketing for integrated offerings'
      });
    }

    // Action items status
    const openActionItems = actionItems.filter(a => a.status === 'open');
    const overdueItems = openActionItems.filter(a => new Date(a.due_date) < new Date());
    if (overdueItems.length > 0) {
      chairmanReport.chairman_focus.critical_alerts.push({
        type: 'overdue_actions',
        count: overdueItems.length,
        message: `${overdueItems.length} action items overdue`,
        priority: 'high',
        action: 'Immediate follow-up required'
      });
      chairmanReport.chairman_focus.requires_attention = true;
    }

    // Market readiness assessment
    const launchReadyProducts = synergyReadiness.filter(r => r.overall_readiness_percentage >= 75).length;
    if (launchReadyProducts >= 1) {
      chairmanReport.chairman_focus.improvements_detected.push({
        type: 'launch_ready',
        message: `${launchReadyProducts} synergy products meet launch readiness (≥75%)`,
        priority: 'high',
        action: 'Schedule go-to-market kickoff meeting'
      });
    }

    // Overall health
    if (chairmanReport.chairman_focus.critical_alerts.length === 0 && 
        synergyReadiness.every(r => r.overall_readiness_percentage >= 60)) {
      chairmanReport.synergy_flow_status.status = 'healthy';
      chairmanReport.execution_summary.overall_health = 'excellent';
    } else if (chairmanReport.chairman_focus.critical_alerts.length > 0) {
      chairmanReport.synergy_flow_status.status = 'needs_attention';
      chairmanReport.execution_summary.overall_health = 'warning';
    } else {
      chairmanReport.execution_summary.overall_health = 'caution';
    }

    return Response.json(chairmanReport, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=30',
        'X-Monitor-Version': '1.0'
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});