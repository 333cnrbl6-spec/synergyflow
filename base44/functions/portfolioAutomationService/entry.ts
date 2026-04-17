import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Portfolio Automation Service
 * Monitors cross-product data triggers and creates action items/compliance tasks
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, trigger_type, trigger_data } = await req.json();

    if (action === 'check_triggers') {
      return await checkAllTriggers(base44);
    } else if (action === 'process_trigger') {
      return await processTrigger(base44, trigger_type, trigger_data);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkAllTriggers(base44) {
  const triggers = [];

  try {
    // TRIGGER 1: Products with low subscription count
    const products = await base44.asServiceRole.entities.Product.list();
    const subscriptions = await base44.asServiceRole.entities.Subscription.list();

    for (const product of products) {
      const productSubs = subscriptions.filter(s => s.product_id === product.id);
      const activeSubs = productSubs.filter(s => s.status === 'active').length;

      if (activeSubs === 0 && product.name) {
        triggers.push({
          type: 'low_subscription_count',
          severity: 'high',
          product_id: product.id,
          product_name: product.name,
          current_subs: activeSubs,
          reason: 'No active subscriptions'
        });
      }
    }

    // TRIGGER 2: Missing product metadata
    for (const product of products) {
      const missing = [];
      if (!product.description) missing.push('description');
      if (!product.target_market) missing.push('target_market');
      if (!product.features || product.features.length === 0) missing.push('features');
      if (!product.icon_url) missing.push('icon_url');

      if (missing.length > 0) {
        triggers.push({
          type: 'incomplete_product_metadata',
          severity: 'medium',
          product_id: product.id,
          product_name: product.name,
          missing_fields: missing,
          reason: `Missing: ${missing.join(', ')}`
        });
      }
    }

    // TRIGGER 3: Subscriptions nearing renewal with no pricing tiers
    for (const product of products) {
      if (!product.pricing_tiers || product.pricing_tiers.length === 0) {
        const prodSubs = subscriptions.filter(s => s.product_id === product.id && s.status === 'active');
        if (prodSubs.length > 0) {
          triggers.push({
            type: 'no_pricing_tiers_with_active_subs',
            severity: 'critical',
            product_id: product.id,
            product_name: product.name,
            active_subscription_count: prodSubs.length,
            reason: 'Active subscriptions exist but no pricing tiers defined'
          });
        }
      }
    }

    // TRIGGER 4: Products without pricing structure
    for (const product of products) {
      const productSubs = subscriptions.filter(s => s.product_id === product.id && s.status === 'active');
      if (productSubs.length > 0 && (!product.pricing_tiers || product.pricing_tiers.length === 0)) {
        triggers.push({
          type: 'missing_pricing_structure',
          severity: 'high',
          product_id: product.id,
          product_name: product.name,
          reason: 'Revenue-generating product lacks pricing definition'
        });
      }
    }

    // TRIGGER 5: Cancelled subscriptions requiring review
    const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');
    if (cancelledSubs.length > 0) {
      const uniqueProducts = [...new Set(cancelledSubs.map(s => s.product_id))];
      for (const productId of uniqueProducts) {
        const cancelled = cancelledSubs.filter(s => s.product_id === productId);
        const product = products.find(p => p.id === productId);
        if (cancelled.length >= 2) {
          triggers.push({
            type: 'churn_alert',
            severity: 'high',
            product_id: productId,
            product_name: product?.name || 'Unknown',
            cancelled_count: cancelled.length,
            reason: `${cancelled.length} subscriptions cancelled - churn investigation needed`
          });
        }
      }
    }

    // Create action items for each trigger
    const createdActions = [];
    for (const trigger of triggers) {
      const action = await createActionItem(base44, trigger);
      createdActions.push(action);
    }

    return Response.json({
      success: true,
      triggers_found: triggers.length,
      actions_created: createdActions.length,
      triggers,
      actions: createdActions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function processTrigger(base44, triggerType, triggerData) {
  try {
    const action = await createActionItem(base44, {
      type: triggerType,
      ...triggerData
    });

    return Response.json({
      success: true,
      action_created: action
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function createActionItem(base44, trigger) {
  // Check if action already exists for this trigger
  const existingActions = await base44.asServiceRole.entities.ActionItem.filter({
    trigger_entity_type: trigger.type,
    trigger_entity_id: trigger.product_id || trigger.subscription_id,
    status: { '$ne': 'completed' }
  });

  if (existingActions.length > 0) {
    return existingActions[0];
  }

  // Map trigger type to action category and priority
  const triggerMap = {
    'low_subscription_count': {
      category: 'product_health',
      priority: 'high',
      titleTemplate: (trigger) => `Boost subscriptions for ${trigger.product_name}`,
      descriptionTemplate: (trigger) => `${trigger.product_name} has no active subscriptions. Investigate market fit and execution readiness.`
    },
    'incomplete_product_metadata': {
      category: 'readiness',
      priority: 'medium',
      titleTemplate: (trigger) => `Complete metadata for ${trigger.product_name}`,
      descriptionTemplate: (trigger) => `Missing fields: ${trigger.missing_fields.join(', ')}. Update product profile to enable go-to-market.`
    },
    'no_pricing_tiers_with_active_subs': {
      category: 'compliance',
      priority: 'critical',
      titleTemplate: (trigger) => `Define pricing tiers for ${trigger.product_name}`,
      descriptionTemplate: (trigger) => `${trigger.product_name} has ${trigger.active_subscription_count} active subscriptions but no pricing structure. Critical compliance issue.`
    },
    'missing_pricing_structure': {
      category: 'compliance',
      priority: 'high',
      titleTemplate: (trigger) => `Create pricing structure for ${trigger.product_name}`,
      descriptionTemplate: (trigger) => `${trigger.product_name} generates revenue but lacks pricing definition. Immediate action required.`
    },
    'churn_alert': {
      category: 'revenue',
      priority: 'high',
      titleTemplate: (trigger) => `Investigate churn on ${trigger.product_name}`,
      descriptionTemplate: (trigger) => `${trigger.cancelled_count} subscriptions cancelled. Review cancellation reasons and implement retention strategy.`
    }
  };

  const mapping = triggerMap[trigger.type] || {
    category: 'product_health',
    priority: 'medium',
    titleTemplate: () => `Review ${trigger.product_name || 'product'}`,
    descriptionTemplate: (t) => t.reason || 'Automated action from portfolio monitoring'
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (trigger.severity === 'critical' ? 2 : trigger.severity === 'high' ? 7 : 14));

  const actionData = {
    title: mapping.titleTemplate(trigger),
    description: mapping.descriptionTemplate(trigger),
    category: mapping.category,
    priority: mapping.priority,
    trigger_entity_type: trigger.type,
    trigger_entity_id: trigger.product_id || 'auto_trigger',
    related_product_id: trigger.product_id,
    related_product_name: trigger.product_name,
    status: 'open',
    auto_triggered: true,
    due_date: dueDate.toISOString().split('T')[0]
  };

  const created = await base44.asServiceRole.entities.ActionItem.create(actionData);
  return created;
}