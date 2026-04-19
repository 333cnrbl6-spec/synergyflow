import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || !['admin'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Fetch all required data in parallel
    const [audits, valuations, readiness, subscriptions, proposals] = await Promise.all([
      base44.entities.AuditTrail.list().catch(() => []),
      base44.entities.ValuationSnapshot.list().catch(() => []),
      base44.entities.ProductReadiness.list().catch(() => []),
      base44.entities.AppSubscription.list().catch(() => []),
      base44.entities.BoardProposal.list().catch(() => [])
    ]);

    // Define synergy groups
    const SYNERGY_GROUPS = {
      'SynergyFlow': {
        name: 'SynergyFlow',
        products: ['premiso', 'charityhub'],
        description: 'Operational management across property and third sector'
      },
      'Conservation Hub': {
        name: 'Conservation Hub',
        products: ['species_explorer'],
        description: 'Wildlife research and conservation data'
      },
      'Legal Integration Hub': {
        name: 'Legal Integration Hub',
        products: ['casenarrative'],
        description: 'Legal case management and narrative building'
      }
    };

    // Product mapping
    const APP_CONFIG = {
      'premiso': 'Premiso',
      'charityhub': 'CharityHub',
      'species_explorer': 'Species Explorer',
      'casenarrative': 'CaseNarrative'
    };

    // Build portfolio health metrics
    const portfolioHealth = {
      timestamp: new Date().toISOString(),
      aggregation_period: 'real-time',
      portfolio_status: 'operational',
      synergy_groups: {}
    };

    // Process each synergy group
    Object.entries(SYNERGY_GROUPS).forEach(([groupKey, groupConfig]) => {
      const groupData = {
        name: groupConfig.name,
        description: groupConfig.description,
        products: [],
        aggregated_metrics: {},
        compliance_metrics: {},
        health_status: 'unknown'
      };

      // Get latest valuation per product
      const latestVals = {};
      valuations.forEach(val => {
        const key = val.product_name?.toLowerCase().replace(/\s+/g, '_');
        if (!latestVals[key] || new Date(val.snapshot_date) > new Date(latestVals[key].snapshot_date)) {
          latestVals[key] = val;
        }
      });

      // Get latest readiness per product
      const latestReady = {};
      readiness.forEach(r => {
        const key = r.product_name?.toLowerCase().replace(/\s+/g, '_');
        if (!latestReady[key] || new Date(r.last_assessed) > new Date(latestReady[key].last_assessed)) {
          latestReady[key] = r;
        }
      });

      // Aggregate data for products in this synergy group
      let totalValBefore = 0, totalValAfter = 0, totalReady = 0, productCount = 0;
      
      groupConfig.products.forEach(productId => {
        const val = latestVals[productId];
        const ready = latestReady[productId];
        const productSubs = subscriptions.filter(sub => 
          sub.apps_included?.includes(productId)
        );

        const beforeVal = val?.sell_now_value ? val.sell_now_value * 0.8 : 0;
        const afterVal = val?.sell_now_value || 0;

        if (val || ready) {
          groupData.products.push({
            id: productId,
            name: APP_CONFIG[productId] || productId,
            valuation: {
              before_execution: beforeVal,
              after_execution: afterVal,
              increase_percentage: beforeVal > 0 ? Math.round(((afterVal - beforeVal) / beforeVal) * 100) : 0,
              currency: 'GBP'
            },
            readiness: ready ? {
              overall_percentage: ready.overall_readiness_percentage,
              documentation: ready.documentation_readiness,
              security: ready.security_readiness,
              performance: ready.performance_readiness,
              feature_completeness: ready.feature_completeness,
              market_readiness: ready.market_readiness
            } : null,
            subscriptions: {
              active_organizations: productSubs.length,
              estimated_users: productSubs.length * 3
            },
            last_assessed: ready?.last_assessed || null,
            ready_for_launch: ready?.overall_readiness_percentage >= 75
          });

          if (val) {
            totalValBefore += beforeVal;
            totalValAfter += afterVal;
          }
          if (ready) {
            totalReady += ready.overall_readiness_percentage;
          }
          productCount++;
        }
      });

      // Calculate aggregated metrics
      if (productCount > 0) {
        groupData.aggregated_metrics = {
          total_products: productCount,
          combined_valuation: {
            before_execution: Math.round(totalValBefore),
            after_execution: Math.round(totalValAfter),
            increase_percentage: totalValBefore > 0 ? Math.round(((totalValAfter - totalValBefore) / totalValBefore) * 100) : 0
          },
          average_readiness_percentage: Math.round(totalReady / productCount),
          products_launch_ready: groupData.products.filter(p => p.ready_for_launch).length,
          active_organizations: groupData.products.reduce((sum, p) => sum + p.subscriptions.active_organizations, 0),
          estimated_total_users: groupData.products.reduce((sum, p) => sum + p.subscriptions.estimated_users, 0)
        };
      }

      // Compliance metrics for this synergy group
      const groupAudits = audits.filter(a => 
        groupConfig.products.some(pid => 
          a.entity_name?.toLowerCase().includes(APP_CONFIG[pid]?.toLowerCase() || pid)
        )
      );

      const criticalFlags = groupAudits.filter(a => 
        a.compliance_flags?.some(f => f.severity === 'critical')
      ).length;
      
      const highFlags = groupAudits.filter(a => 
        a.compliance_flags?.some(f => f.severity === 'high')
      ).length;

      const compliantRecords = groupAudits.filter(a => 
        !a.compliance_flags || a.compliance_flags.length === 0
      ).length;

      groupData.compliance_metrics = {
        total_audited_records: groupAudits.length,
        compliant_records: compliantRecords,
        compliance_rate_percentage: groupAudits.length > 0 ? Math.round((compliantRecords / groupAudits.length) * 100) : 100,
        critical_flags: criticalFlags,
        high_flags: highFlags,
        medium_high_flags: groupAudits.filter(a => 
          a.compliance_flags?.some(f => ['medium', 'low'].includes(f.severity))
        ).length,
        last_audit_timestamp: groupAudits.length > 0 
          ? groupAudits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
          : null
      };

      // Determine health status
      if (criticalFlags > 0) {
        groupData.health_status = 'critical';
      } else if (highFlags > 0 || groupData.aggregated_metrics.average_readiness_percentage < 50) {
        groupData.health_status = 'warning';
      } else if (groupData.aggregated_metrics.average_readiness_percentage < 75) {
        groupData.health_status = 'caution';
      } else {
        groupData.health_status = 'healthy';
      }

      portfolioHealth.synergy_groups[groupKey] = groupData;
    });

    // Calculate portfolio-wide metrics
    let portfolioValBefore = 0, portfolioValAfter = 0, totalReadiness = 0, totalProducts = 0;
    let portfolioCriticalFlags = 0, portfolioHighFlags = 0, portfolioCompliantRate = 0;

    Object.values(portfolioHealth.synergy_groups).forEach(group => {
      portfolioValBefore += group.aggregated_metrics.combined_valuation?.before_execution || 0;
      portfolioValAfter += group.aggregated_metrics.combined_valuation?.after_execution || 0;
      totalReadiness += group.aggregated_metrics.average_readiness_percentage || 0;
      totalProducts += group.aggregated_metrics.total_products || 0;
      portfolioCriticalFlags += group.compliance_metrics.critical_flags || 0;
      portfolioHighFlags += group.compliance_metrics.high_flags || 0;
      portfolioCompliantRate += group.compliance_metrics.compliance_rate_percentage || 0;
    });

    const groupCount = Object.keys(portfolioHealth.synergy_groups).length;

    portfolioHealth.portfolio_metrics = {
      total_synergy_groups: groupCount,
      total_products: totalProducts,
      total_valuation: {
        before_execution: Math.round(portfolioValBefore),
        after_execution: Math.round(portfolioValAfter),
        increase_percentage: portfolioValBefore > 0 ? Math.round(((portfolioValAfter - portfolioValBefore) / portfolioValBefore) * 100) : 0,
        currency: 'GBP'
      },
      average_readiness_percentage: Math.round(totalReadiness / groupCount),
      portfolio_compliance_rate: Math.round(portfolioCompliantRate / groupCount),
      critical_compliance_flags: portfolioCriticalFlags,
      high_compliance_flags: portfolioHighFlags
    };

    // Overall portfolio status
    if (portfolioCriticalFlags > 0) {
      portfolioHealth.portfolio_status = 'critical';
    } else if (portfolioHighFlags > 0 || portfolioHealth.portfolio_metrics.average_readiness_percentage < 50) {
      portfolioHealth.portfolio_status = 'warning';
    } else if (portfolioHealth.portfolio_metrics.average_readiness_percentage < 75) {
      portfolioHealth.portfolio_status = 'caution';
    } else {
      portfolioHealth.portfolio_status = 'healthy';
    }

    // Add execution summary
    const approvedProposals = proposals.filter(p => p.status === 'approved').length;
    const completedProposals = proposals.filter(p => p.approval_stage === 'completed').length;

    portfolioHealth.execution_summary = {
      total_approved_proposals: approvedProposals,
      completed_proposals: completedProposals,
      in_progress_proposals: approvedProposals - completedProposals,
      execution_completion_rate: approvedProposals > 0 ? Math.round((completedProposals / approvedProposals) * 100) : 0
    };

    return Response.json(portfolioHealth, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60',
        'X-Portfolio-Health-Version': '1.0',
        'X-Generated-At': new Date().toISOString()
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});