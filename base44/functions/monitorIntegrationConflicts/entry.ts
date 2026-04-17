import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active action items and proposals
    const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
      status: 'in_progress'
    });

    const proposals = await base44.asServiceRole.entities.BoardProposal.filter({
      status: 'approved'
    });

    const conflicts = {
      dataConflicts: [],
      overlappingLogic: [],
      resourceBottlenecks: [],
      priorityResolutions: []
    };

    // Analyze for data conflicts
    const productMap = {};
    actionItems.forEach(item => {
      const product = item.related_product_id || item.related_product_name;
      if (!productMap[product]) {
        productMap[product] = [];
      }
      productMap[product].push(item);
    });

    Object.entries(productMap).forEach(([product, items]) => {
      if (items.length > 1) {
        const titles = items.map(i => i.title);
        const dataConflict = {
          severity: 'high',
          product,
          count: items.length,
          issue: `Multiple simultaneous integrations on ${product} - potential data schema conflicts`,
          items: titles.slice(0, 3),
          recommendation: 'Coordinate schema validation and establish data versioning across concurrent tasks'
        };
        conflicts.dataConflicts.push(dataConflict);
      }
    });

    // Detect overlapping logic patterns
    const commonPatterns = [
      { pattern: 'API bridge', count: 0, items: [] },
      { pattern: 'data mapping', count: 0, items: [] },
      { pattern: 'automation trigger', count: 0, items: [] },
      { pattern: 'integration framework', count: 0, items: [] }
    ];

    actionItems.forEach(item => {
      commonPatterns.forEach(pat => {
        if (item.title.toLowerCase().includes(pat.pattern)) {
          pat.count++;
          pat.items.push(item.id);
        }
      });
    });

    commonPatterns.forEach(pat => {
      if (pat.count > 2) {
        conflicts.overlappingLogic.push({
          severity: 'medium',
          pattern: pat.pattern,
          count: pat.count,
          issue: `${pat.count} tasks building similar "${pat.pattern}" logic - potential duplication`,
          recommendation: 'Consolidate into shared utility libraries and abstract common patterns'
        });
      }
    });

    // Identify resource bottlenecks
    const byRaisedBy = {};
    proposals.forEach(prop => {
      const raised = prop.raised_by;
      if (!byRaisedBy[raised]) {
        byRaisedBy[raised] = [];
      }
      byRaisedBy[raised].push(prop);
    });

    Object.entries(byRaisedBy).forEach(([owner, props]) => {
      if (props.length > 5) {
        conflicts.resourceBottlenecks.push({
          severity: 'critical',
          owner,
          count: props.length,
          issue: `${owner} has ${props.length} active approved proposals - severe resource/capacity constraint`,
          recommendation: `Load-balance by deferring non-critical tasks and establishing clear priority sequencing. Current initiatives: ${props.slice(0, 2).map(p => p.title).join('; ')}`
        });
      }
    });

    // Generate prioritized resolution strategies
    const allIssues = [
      ...conflicts.dataConflicts.map(c => ({ ...c, type: 'dataConflict' })),
      ...conflicts.overlappingLogic.map(c => ({ ...c, type: 'overlappingLogic' })),
      ...conflicts.resourceBottlenecks.map(c => ({ ...c, type: 'resourceBottleneck' }))
    ];

    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    const sorted = allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    sorted.forEach((issue, idx) => {
      conflicts.priorityResolutions.push({
        priority: idx + 1,
        severity: issue.severity,
        type: issue.type,
        title: issue.issue,
        strategy: issue.recommendation,
        estimatedImpact: issue.severity === 'critical' ? 'High - implement immediately' : 
                         issue.severity === 'high' ? 'Medium - implement this sprint' : 
                         'Low - plan for next cycle'
      });
    });

    // Create monitoring alert record
    const alert = await base44.asServiceRole.entities.ActionItem.create({
      title: `Integration Conflict Monitoring Report - ${new Date().toLocaleDateString()}`,
      description: `Automated scan detected ${allIssues.length} potential conflicts across active integration tasks. ${conflicts.resourceBottlenecks.length} critical resource bottlenecks identified.`,
      category: 'compliance',
      priority: allIssues.some(i => i.severity === 'critical') ? 'critical' : 'high',
      trigger_entity_type: 'BoardProposal',
      status: 'open',
      auto_triggered: true
    });

    // Post notification to board
    await base44.asServiceRole.functions.invoke('boardCommunications', {
      action: 'send_message',
      channel_id: 'strategy',
      message_content: `⚠️ INTEGRATION CONFLICT SCAN COMPLETE: Automated monitoring detected ${allIssues.length} potential issues across active board integration tasks:

🔴 CRITICAL (${conflicts.resourceBottlenecks.length}): Resource bottlenecks - immediate load-balancing required
🟠 HIGH (${conflicts.dataConflicts.length}): Data schema conflicts on overlapping product integrations
🟡 MEDIUM (${conflicts.overlappingLogic.length}): Duplicated logic patterns requiring consolidation

Detailed resolution strategies available in Board Impact Analytics. Review prioritized action items immediately.`,
      message_type: 'announcement',
      from_member: '🔍 Integration Monitor'
    });

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalIssuesDetected: allIssues.length,
      conflicts,
      alertId: alert.id
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});