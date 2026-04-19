import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all pending deadlines
    const deadlines = await base44.entities.ComplianceDeadline.filter({ status: 'pending' });
    
    const notificationsSent = [];
    const missedDeadlines = [];

    for (const deadline of deadlines) {
      const deadlineDate = new Date(deadline.deadline_date);
      deadlineDate.setHours(0, 0, 0, 0);
      
      const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      // Check if deadline is missed
      if (daysUntilDeadline < 0) {
        await base44.entities.ComplianceDeadline.update(deadline.id, {
          status: 'missed'
        });
        missedDeadlines.push(deadline);
        continue;
      }

      // Check notification schedule
      const notificationsToSchedule = [30, 14, 7];
      
      for (const daysBefore of notificationsToSchedule) {
        if (daysUntilDeadline === daysBefore) {
          // Check if this notification was already sent
          const notification = deadline.notification_schedule?.find(n => n.days_before === daysBefore);
          
          if (notification && !notification.sent) {
            // Send notification
            await sendDeadlineNotification(base44, deadline, daysBefore);
            
            // Update notification schedule
            const updatedSchedule = deadline.notification_schedule.map(n => {
              if (n.days_before === daysBefore) {
                return { ...n, sent: true, sent_date: new Date().toISOString() };
              }
              return n;
            });

            await base44.entities.ComplianceDeadline.update(deadline.id, {
              notification_schedule: updatedSchedule
            });

            notificationsSent.push({
              deadline_id: deadline.id,
              days_before: daysBefore,
              entity_name: deadline.entity_name,
              deadline_type: deadline.deadline_type
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      notifications_sent: notificationsSent.length,
      missed_deadlines: missedDeadlines.length,
      details: { notificationsSent, missedDeadlines }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendDeadlineNotification(base44, deadline, daysBefore) {
  const urgencyLabel = daysBefore === 30 ? 'Upcoming' : daysBefore === 14 ? 'Approaching' : 'URGENT';
  const urgencyColor = daysBefore === 30 ? '🟡' : daysBefore === 14 ? '🟠' : '🔴';
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${urgencyColor} ${urgencyLabel} Compliance Deadline</h1>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">${daysBefore} days remaining</p>
      </div>
      
      <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">${deadline.description || deadline.deadline_type.replace('_', ' ').toUpperCase()}</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Deadline Type:</td>
            <td style="padding: 8px 0; color: #1e293b;">${deadline.deadline_type.replace('_', ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Related Entity:</td>
            <td style="padding: 8px 0; color: #1e293b;">${deadline.entity_name} (${deadline.entity_id})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Deadline Date:</td>
            <td style="padding: 8px 0; color: #1e293b;">${new Date(deadline.deadline_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Domain:</td>
            <td style="padding: 8px 0; color: #1e293b;">${deadline.domain.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Priority:</td>
            <td style="padding: 8px 0;">
              <span style="background: ${deadline.priority === 'critical' ? '#fee2e2' : deadline.priority === 'high' ? '#ffedd5' : deadline.priority === 'medium' ? '#fef3c7' : '#dcfce7'}; 
                            color: ${deadline.priority === 'critical' ? '#991b1b' : deadline.priority === 'high' ? '#9a3412' : deadline.priority === 'medium' ? '#92400e' : '#166534'}; 
                            padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                ${deadline.priority.toUpperCase()}
              </span>
            </td>
          </tr>
          ${deadline.assigned_to ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Assigned To:</td>
            <td style="padding: 8px 0; color: #1e293b;">${deadline.assigned_to}</td>
          </tr>
          ` : ''}
        </table>

        ${deadline.notes ? `
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 15px 0;">
          <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Notes:</strong> ${deadline.notes}</p>
        </div>
        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background: ${daysBefore <= 7 ? '#fee2e2' : '#fef3c7'}; border-radius: 6px; border-left: 4px solid ${daysBefore <= 7 ? '#dc2626' : '#d97706'};">
          <p style="margin: 0; color: ${daysBefore <= 7 ? '#991b1b' : '#92400e'}; font-size: 14px; font-weight: 600;">
            ⚠️ Action Required: Please ensure all necessary compliance steps are completed before the deadline to avoid regulatory issues.
          </p>
        </div>
      </div>

      <div style="padding: 15px 20px; background: #f1f5f9; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 12px;">
          This is an automated compliance notification from Portfolio Compliance Monitor
        </p>
        <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 11px;">
          Sent ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  `;

  // Send to assigned user or admin
  const recipient = deadline.assigned_to || (await base44.auth.me()).email;
  
  await base44.integrations.Core.SendEmail({
    to: recipient,
    subject: `${urgencyColor} ${urgencyLabel}: ${deadline.deadline_type.replace('_', ' ').toUpperCase()} - ${daysBefore} Days Remaining`,
    body: emailBody
  });

  // Also create in-app notification
  await base44.entities.BoardNotification.create({
    channel_id: 'compliance',
    channel_name: 'Compliance Alerts',
    message_id: `deadline_${deadline.id}`,
    from_member: 'System',
    to_member: recipient,
    message_preview: `${urgencyLabel} compliance deadline: ${deadline.description || deadline.deadline_type} - ${daysBefore} days remaining`,
    read: false,
    timestamp: new Date().toISOString()
  });
}