import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Send automated emails based on payment status and triggers
 * Call this daily via automation to check rent status and send reminders
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all templates, tenants, and payment records
    const templates = await base44.asServiceRole.entities.EmailTemplate.list();
    const tenants = await base44.asServiceRole.entities.Tenant?.list?.() || [];
    const paymentRecords = await base44.asServiceRole.entities.TenantPayment?.list?.() || [];

    const emailsSent = [];
    const errors = [];

    // Process each active template
    const activeTemplates = templates.filter(t => t.active);

    for (const tenant of tenants) {
      // Get tenant's latest payment
      const tenantPayments = paymentRecords
        .filter(p => p.tenant_id === tenant.id)
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
      
      const lastPayment = tenantPayments[0];
      const rentDueDate = tenant.rent_day ? `${tenant.rent_day}` : '1';

      // Calculate days overdue
      const today = new Date();
      const [year, month] = [today.getFullYear(), today.getMonth() + 1];
      const dueDate = new Date(year, month - 1, parseInt(rentDueDate));
      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

      // Check which templates should be sent
      for (const template of activeTemplates) {
        let shouldSend = false;
        let triggerContext = {};

        // Match trigger types
        if (template.trigger_type === 'rent_due' && daysOverdue === 0) {
          shouldSend = true;
          triggerContext = { reason: 'Rent due today' };
        } else if (template.trigger_type === 'rent_overdue_3_days' && daysOverdue === 3) {
          shouldSend = true;
          triggerContext = { reason: 'Rent overdue by 3 days', daysOverdue };
        } else if (template.trigger_type === 'rent_overdue_7_days' && daysOverdue === 7) {
          shouldSend = true;
          triggerContext = { reason: 'Rent overdue by 7 days', daysOverdue };
        } else if (template.trigger_type === 'rent_overdue_14_days' && daysOverdue === 14) {
          shouldSend = true;
          triggerContext = { reason: 'Rent overdue by 14 days', daysOverdue };
        }

        if (shouldSend) {
          try {
            // Prepare email data
            const emailData = {
              tenant_name: tenant.full_name,
              tenant_email: tenant.email,
              property_name: tenant.property_name || '[Property]',
              rent_amount: tenant.rent_amount ? `£${tenant.rent_amount.toLocaleString()}` : '[Rent]',
              rent_due_date: `${rentDueDate}th of each month`,
              rent_overdue_by: `${daysOverdue} days`,
              total_outstanding: tenant.rent_amount ? `£${(tenant.rent_amount * daysOverdue / 30).toLocaleString()}` : '[Amount]',
              current_date: today.toLocaleDateString('en-GB'),
              landlord_name: user.full_name || 'Landlord',
              payment_portal_url: 'https://premiso.app/pay'
            };

            // Populate template
            let subject = template.subject_line;
            let body = template.body;

            Object.entries(emailData).forEach(([key, value]) => {
              const placeholder = `{{${key}}}`;
              subject = subject.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
              body = body.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
            });

            // Send email
            await base44.integrations.Core.SendEmail({
              to: tenant.email,
              subject,
              body
            });

            // Log email
            await base44.asServiceRole.entities.EmailLog.create({
              tenant_email: tenant.email,
              tenant_name: tenant.full_name,
              property_id: tenant.property_id,
              property_name: tenant.property_name,
              template_id: template.id,
              template_type: template.template_type,
              subject,
              body,
              sent_date: new Date().toISOString(),
              status: 'sent',
              trigger_context: triggerContext
            });

            emailsSent.push({
              tenant: tenant.full_name,
              template: template.name,
              status: 'sent'
            });
          } catch (e) {
            errors.push({
              tenant: tenant.full_name,
              template: template.name,
              error: e.message
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length,
      details: { sent: emailsSent, errors }
    });
  } catch (error) {
    console.error('Error sending automated emails:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});