import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Send automated rent reminders 3 days before due date
 * and follow-up emails for late payments
 * Triggered daily via automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenants and templates
    const tenants = await base44.asServiceRole.entities.Tenant?.list?.() || [];
    const templates = await base44.asServiceRole.entities.EmailTemplate.list();
    const emailLogs = await base44.asServiceRole.entities.EmailLog.list();
    const payments = await base44.asServiceRole.entities.TenantPayment?.list?.() || [];

    const remindersSent = [];
    const followupsSent = [];
    const errors = [];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    for (const tenant of tenants) {
      try {
        if (!tenant.email) continue;

        // Get rent due date (assuming rent_day is day of month)
        const rentDay = tenant.rent_day || 1;
        const dueDate = new Date(today.getFullYear(), today.getMonth(), rentDay);
        if (dueDate < today) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }

        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 3600 * 24));
        const lastPayments = payments
          .filter(p => p.tenant_id === tenant.id)
          .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
        const lastPayment = lastPayments[0];

        // 1. Send 3-day reminder
        if (daysUntilDue === 3) {
          // Check if we already sent a 3-day reminder this month
          const recentReminder = emailLogs.find(log =>
            log.tenant_email === tenant.email &&
            log.template_type === 'rent_reminder' &&
            new Date(log.sent_date) > threeMonthsAgo
          );

          if (!recentReminder) {
            const template = templates.find(t =>
              t.template_type === 'rent_reminder' &&
              t.trigger_type === 'rent_due' &&
              t.active
            );

            if (template) {
              const emailData = {
                tenant_name: tenant.full_name || tenant.name,
                tenant_email: tenant.email,
                property_name: tenant.property_name || '[Property]',
                rent_amount: tenant.rent_amount ? `£${tenant.rent_amount.toLocaleString()}` : '[Rent]',
                rent_due_date: `${rentDay}${getOrdinalSuffix(rentDay)} of each month`,
                current_date: today.toLocaleDateString('en-GB'),
                landlord_name: user.full_name || 'Landlord',
                payment_portal_url: 'https://premiso.app/pay'
              };

              let subject = template.subject_line;
              let body = template.body;

              Object.entries(emailData).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                subject = subject.replace(new RegExp(placeholder, 'g'), value);
                body = body.replace(new RegExp(placeholder, 'g'), value);
              });

              await base44.integrations.Core.SendEmail({
                to: tenant.email,
                subject,
                body
              });

              await base44.asServiceRole.entities.EmailLog.create({
                tenant_email: tenant.email,
                tenant_name: tenant.full_name || tenant.name,
                property_id: tenant.property_id,
                property_name: tenant.property_name,
                template_id: template.id,
                template_type: template.template_type,
                subject,
                body,
                sent_date: new Date().toISOString(),
                status: 'sent',
                trigger_context: { reason: '3 days before due date', days_until_due: daysUntilDue }
              });

              remindersSent.push({
                tenant: tenant.full_name || tenant.name,
                daysUntilDue
              });
            }
          }
        }

        // 2. Send late payment follow-ups
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.payment_date);
          const daysSincePayment = Math.ceil((today - lastPaymentDate) / (1000 * 3600 * 24));

          // Check if payment is late (more than rent_day days into month)
          const expectedPaymentDay = rentDay;
          const actualPaymentDay = lastPaymentDate.getDate();
          const isLate = actualPaymentDay > expectedPaymentDay;

          if (isLate) {
            let templateType = null;
            let triggerType = null;

            if (daysSincePayment >= 14) {
              templateType = 'rent_overdue';
              triggerType = 'rent_overdue_14_days';
            } else if (daysSincePayment >= 7) {
              templateType = 'rent_overdue';
              triggerType = 'rent_overdue_7_days';
            } else if (daysSincePayment >= 3) {
              templateType = 'rent_overdue';
              triggerType = 'rent_overdue_3_days';
            }

            if (templateType && triggerType) {
              // Check if follow-up already sent recently
              const recentFollowup = emailLogs.find(log =>
                log.tenant_email === tenant.email &&
                log.template_type === templateType &&
                new Date(log.sent_date) > new Date(today.getTime() - 24 * 3600 * 1000)
              );

              if (!recentFollowup) {
                const template = templates.find(t =>
                  t.template_type === templateType &&
                  t.trigger_type === triggerType &&
                  t.active
                );

                if (template) {
                  const totalOutstanding = lastPayment.amount || tenant.rent_amount || 0;
                  const emailData = {
                    tenant_name: tenant.full_name || tenant.name,
                    tenant_email: tenant.email,
                    property_name: tenant.property_name || '[Property]',
                    rent_amount: tenant.rent_amount ? `£${tenant.rent_amount.toLocaleString()}` : '[Rent]',
                    rent_due_date: `${rentDay}${getOrdinalSuffix(rentDay)} of each month`,
                    rent_overdue_by: `${daysSincePayment} days`,
                    total_outstanding: `£${totalOutstanding.toLocaleString()}`,
                    current_date: today.toLocaleDateString('en-GB'),
                    landlord_name: user.full_name || 'Landlord',
                    payment_portal_url: 'https://premiso.app/pay'
                  };

                  let subject = template.subject_line;
                  let body = template.body;

                  Object.entries(emailData).forEach(([key, value]) => {
                    const placeholder = `{{${key}}}`;
                    subject = subject.replace(new RegExp(placeholder, 'g'), value);
                    body = body.replace(new RegExp(placeholder, 'g'), value);
                  });

                  await base44.integrations.Core.SendEmail({
                    to: tenant.email,
                    subject,
                    body
                  });

                  await base44.asServiceRole.entities.EmailLog.create({
                    tenant_email: tenant.email,
                    tenant_name: tenant.full_name || tenant.name,
                    property_id: tenant.property_id,
                    property_name: tenant.property_name,
                    template_id: template.id,
                    template_type: template.template_type,
                    subject,
                    body,
                    sent_date: new Date().toISOString(),
                    status: 'sent',
                    trigger_context: { reason: 'Late payment follow-up', days_overdue: daysSincePayment }
                  });

                  followupsSent.push({
                    tenant: tenant.full_name || tenant.name,
                    daysOverdue: daysSincePayment,
                    templateType
                  });
                }
              }
            }
          }
        }
      } catch (tenantError) {
        errors.push({
          tenant: tenant.full_name || tenant.name,
          error: tenantError.message
        });
      }
    }

    return Response.json({
      success: true,
      remindersSent: remindersSent.length,
      followupsSent: followupsSent.length,
      errors: errors.length,
      details: {
        reminders: remindersSent,
        followups: followupsSent,
        errors
      }
    });
  } catch (error) {
    console.error('Error in rent reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Get ordinal suffix for day (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}