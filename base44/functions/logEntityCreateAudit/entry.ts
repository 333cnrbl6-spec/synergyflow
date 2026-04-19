import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This function is called by entity automation on create
    const { event, data } = await req.json();
    
    if (!event || !data) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Calculate changed fields
    const changedFields = Object.keys(data || {});
    const changesSummary = `Record created with ${changedFields.length} fields`;

    // Create audit entry directly
    const auditData = {
      entity_name: event.entity_name,
      entity_id: event.entity_id,
      action: 'create',
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changed_fields: changedFields,
      changes_summary: changesSummary,
      old_snapshot: null,
      new_snapshot: data,
      reason: 'Record created via application',
      compliance_flags: []
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