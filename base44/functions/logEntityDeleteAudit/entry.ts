import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This function is called by entity automation on delete
    const { event, old_data } = await req.json();
    
    if (!event || !old_data) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Create audit entry
    const auditData = {
      entity_name: event.entity_name,
      entity_id: event.entity_id,
      action: 'delete',
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changed_fields: Object.keys(old_data || []),
      changes_summary: `Record deleted (had ${Object.keys(old_data || {}).length} fields)`,
      old_snapshot: old_data,
      new_snapshot: null,
      reason: 'Record deleted via application',
      compliance_flags: [{
        type: 'record_deletion',
        severity: 'high',
        message: 'Record deleted — verify this complies with data retention policy',
        regulation: 'GDPR Article 17'
      }]
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