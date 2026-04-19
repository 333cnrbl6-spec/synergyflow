import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This function is called by entity automation on update
    const { event, data, old_data } = await req.json();
    
    if (!event || !data || !old_data) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Calculate changed fields
    const changedFields = [];
    const allKeys = new Set([...Object.keys(old_data || {}), ...Object.keys(data || {})]);
    
    for (const key of allKeys) {
      if (['updated_date', 'id'].includes(key)) continue;
      const oldValue = old_data?.[key];
      const newValue = data?.[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push(key);
      }
    }

    // Generate changes summary
    const changes = changedFields.map(field => {
      const oldValue = old_data?.[field];
      const newValue = data?.[field];
      return `${field}: "${oldValue}" → "${newValue}"`;
    });
    const changesSummary = `Updated ${changedFields.length} field(s): ${changes.join(', ')}`;

    // Detect compliance flags (simplified inline)
    const complianceFlags = [];
    if (event.entity_name === 'TenancyAgreement' && changedFields.includes('rent_amount')) {
      complianceFlags.push({
        type: 'rent_change',
        severity: 'medium',
        message: 'Rent amount modified — may require Section 13 notice',
        regulation: 'Housing Act 1988'
      });
    }
    if (event.entity_name === 'Case' && changedFields.includes('limitation_date')) {
      complianceFlags.push({
        type: 'limitation_date_change',
        severity: 'critical',
        message: 'Limitation date modified — verify accuracy',
        regulation: 'SRA Code of Conduct'
      });
    }
    if (event.entity_name === 'Donation' && data?.amount > 10000) {
      complianceFlags.push({
        type: 'large_donation',
        severity: 'medium',
        message: 'Large donation (>£10k) — verify donor eligibility',
        regulation: 'Charity Commission Guidelines'
      });
    }

    // Create audit entry
    const auditData = {
      entity_name: event.entity_name,
      entity_id: event.entity_id,
      action: 'update',
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changed_fields: changedFields,
      changes_summary: changesSummary,
      old_snapshot: old_data,
      new_snapshot: data,
      reason: 'Record updated via application',
      compliance_flags: complianceFlags
    };

    const auditRecord = await base44.entities.AuditTrail.create(auditData);

    return Response.json({ 
      success: true,
      auditRecord
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});