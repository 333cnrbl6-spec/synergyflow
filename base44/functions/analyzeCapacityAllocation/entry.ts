import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active action items and board members
    const actionItems = await base44.asServiceRole.entities.ActionItem.filter({
      status: { $in: ['open', 'in_progress'] }
    });

    const boardMembers = await base44.asServiceRole.entities.BoardMember.filter({
      active: true
    });

    // Allocate by assigned_to or related_product_id
    const capacityMap = {};
    const priorityWeights = { critical: 3, high: 2, medium: 1, low: 0.5 };

    boardMembers.forEach(member => {
      capacityMap[member.app_name] = {
        owner: member.app_name,
        memberName: member.member_name,
        role: member.role,
        tasks: [],
        totalWeightedLoad: 0,
        taskCount: 0
      };
    });

    actionItems.forEach(item => {
      const owner = item.assigned_to || item.related_product_name || item.related_product_id || 'Unassigned';
      
      if (!capacityMap[owner]) {
        capacityMap[owner] = {
          owner,
          memberName: owner,
          role: 'External/Unassigned',
          tasks: [],
          totalWeightedLoad: 0,
          taskCount: 0
        };
      }

      const weight = priorityWeights[item.priority] || 1;
      capacityMap[owner].tasks.push({
        id: item.id,
        title: item.title,
        priority: item.priority,
        weight: weight,
        status: item.status,
        category: item.category
      });
      capacityMap[owner].totalWeightedLoad += weight;
      capacityMap[owner].taskCount++;
    });

    // Calculate average load and identify over-allocation
    const owners = Object.values(capacityMap);
    const avgLoad = owners.reduce((sum, o) => sum + o.totalWeightedLoad, 0) / owners.length;
    const threshold = avgLoad * 1.3; // 30% over average is over-allocated

    const overAllocated = owners.filter(o => o.totalWeightedLoad > threshold);
    const underUtilized = owners.filter(o => o.totalWeightedLoad < avgLoad * 0.5);

    // Generate rebalancing recommendations
    const recommendations = [];
    
    overAllocated.forEach(owner => {
      const excess = owner.totalWeightedLoad - threshold;
      const tasksSortedByPriority = owner.tasks
        .filter(t => t.priority !== 'critical')
        .sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
      
      let tasksToShift = [];
      let shiftedWeight = 0;
      
      for (const task of tasksSortedByPriority) {
        if (shiftedWeight >= excess) break;
        tasksToShift.push(task);
        shiftedWeight += task.weight;
      }

      if (tasksToShift.length > 0 && underUtilized.length > 0) {
        const bestTarget = underUtilized.reduce((best, curr) => 
          curr.totalWeightedLoad < best.totalWeightedLoad ? curr : best
        );

        recommendations.push({
          type: 'rebalance',
          severity: owner.totalWeightedLoad > threshold * 1.5 ? 'critical' : 'high',
          fromOwner: owner.owner,
          toOwner: bestTarget.owner,
          tasksToMove: tasksToShift.length,
          taskIds: tasksToShift.map(t => t.id),
          estimatedLoadReduction: `${shiftedWeight.toFixed(1)} units`,
          impact: `Reduces ${owner.owner} load from ${owner.totalWeightedLoad.toFixed(1)} to ${(owner.totalWeightedLoad - shiftedWeight).toFixed(1)}`
        });
      }
    });

    // Create capacity report
    const report = await base44.asServiceRole.entities.ActionItem.create({
      title: `Capacity Analysis Report - ${new Date().toLocaleDateString()}`,
      description: `Analyzed ${actionItems.length} active action items across ${owners.length} team members. ${overAllocated.length} over-allocated, ${underUtilized.length} under-utilized.`,
      category: 'governance',
      priority: overAllocated.length > 0 ? 'high' : 'medium',
      trigger_entity_type: 'ActionItem',
      status: 'open',
      auto_triggered: true
    });

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      capacityAnalysis: owners,
      metrics: {
        totalTasks: actionItems.length,
        avgLoad: avgLoad.toFixed(2),
        overAllocatedCount: overAllocated.length,
        underUtilizedCount: underUtilized.length,
        threshold: threshold.toFixed(2)
      },
      rebalancingRecommendations: recommendations,
      reportId: report.id
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});