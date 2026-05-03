import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Daily check of deposit protection compliance
 * Sends alerts when deadlines approaching or overdue
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all deposits created by this user's properties
    const deposits = await base44.asServiceRole.entities.DepositProtection.list();

    let checkResults = {
      total_checked: deposits.length,
      alerts_sent: 0,
      compliance_updates: 0,
      errors: []
    };

    for (const deposit of deposits) {
      try {
        // Calculate days until deadline
        const deadline = new Date(deposit.protection_deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline - today) / (1000 * 3600 * 24));

        // Determine new compliance status
        let newStatus = deposit.compliance_status;

        if (deposit.protection_date && deposit.prescribed_info_sent) {
          // Both completed - check if within deadline
          const protectionDate = new Date(deposit.protection_date);
          const prescribedDate = new Date(deposit.prescribed_info_sent_date);
          if (protectionDate <= deadline && prescribedDate <= deadline) {
            newStatus = 'compliant';
          }
        } else if (daysUntil < 0) {
          newStatus = 'overdue';
        } else if (daysUntil <= 7) {
          newStatus = 'non_compliant';
        } else if (daysUntil <= 14) {
          newStatus = 'at_risk';
        }

        // Update status if changed
        if (newStatus !== deposit.compliance_status) {
          await base44.asServiceRole.entities.DepositProtection.update(deposit.id, {
            compliance_status: newStatus
          });
          checkResults.compliance_updates++;
        }

        // Check if alert should be sent
        const shouldAlert = checkAlertCondition(deposit, daysUntil);

        if (shouldAlert) {
          // Record alert sent
          const alertLog = deposit.compliance_alerts_sent || [];
          alertLog.push({
            alert_type: shouldAlert.type,
            days_before_deadline: daysUntil,
            sent_date: new Date().toISOString()
          });

          await base44.asServiceRole.entities.DepositProtection.update(deposit.id, {
            compliance_alerts_sent: alertLog
          });

          // Send email to landlord
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `⚠️ Deposit Compliance Alert - ${deposit.tenant_name}`,
            body: buildAlertEmail(deposit, daysUntil, shouldAlert)
          });

          checkResults.alerts_sent++;
        }
      } catch (depositError) {
        checkResults.errors.push({
          deposit_id: deposit.id,
          error: depositError.message
        });
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: checkResults
    });
  } catch (error) {
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});

/**
 * Determine if alert should be sent based on deposit state
 */
function checkAlertCondition(deposit, daysUntil) {
  // Don't alert for already compliant deposits
  if (deposit.compliance_status === 'compliant') {
    return null;
  }

  // Check if already sent same type of alert (avoid spam)
  const alertHistory = deposit.compliance_alerts_sent || [];
  
  // Alert when protection not yet done and 14 days remain
  if (!deposit.protection_date && daysUntil === 14) {
    if (!alertHistory.some(a => a.alert_type === 'protection_deadline_warning' && a.days_before_deadline === 14)) {
      return { type: 'protection_deadline_warning', severity: 'warning' };
    }
  }

  // Alert when protection not done and 7 days remain
  if (!deposit.protection_date && daysUntil === 7) {
    if (!alertHistory.some(a => a.alert_type === 'protection_deadline_warning' && a.days_before_deadline === 7)) {
      return { type: 'protection_deadline_warning', severity: 'urgent' };
    }
  }

  // Alert when prescribed info not sent and 14 days remain
  if (deposit.protection_date && !deposit.prescribed_info_sent && daysUntil === 14) {
    if (!alertHistory.some(a => a.alert_type === 'prescribed_info_deadline_warning' && a.days_before_deadline === 14)) {
      return { type: 'prescribed_info_deadline_warning', severity: 'warning' };
    }
  }

  // Alert when prescribed info not sent and 7 days remain
  if (deposit.protection_date && !deposit.prescribed_info_sent && daysUntil === 7) {
    if (!alertHistory.some(a => a.alert_type === 'prescribed_info_deadline_warning' && a.days_before_deadline === 7)) {
      return { type: 'prescribed_info_deadline_warning', severity: 'urgent' };
    }
  }

  // Alert when overdue
  if (daysUntil < 0) {
    if (!deposit.protection_date) {
      return { type: 'protection_overdue', severity: 'critical' };
    }
    if (!deposit.prescribed_info_sent) {
      return { type: 'prescribed_info_overdue', severity: 'critical' };
    }
  }

  return null;
}

/**
 * Build email alert for landlord
 */
function buildAlertEmail(deposit, daysUntil, alertInfo) {
  const schemeNames = {
    dps: 'Deposit Protection Service',
    tds: 'The Deposit Protection Service',
    mydeposits: 'MyDeposits'
  };

  let subject = 'Deposit Compliance Alert';
  let actionRequired = '';

  if (alertInfo.type === 'protection_deadline_warning') {
    subject = `Protection Deadline in ${daysUntil} Days`;
    actionRequired = `<p><strong>Action Required:</strong> Register the deposit with a scheme immediately.</p>`;
  } else if (alertInfo.type === 'prescribed_info_deadline_warning') {
    subject = `Prescribed Information Deadline in ${daysUntil} Days`;
    actionRequired = `<p><strong>Action Required:</strong> Send prescribed information to the tenant immediately.</p>`;
  } else if (alertInfo.type === 'protection_overdue') {
    subject = `🚨 CRITICAL: Protection Overdue`;
    actionRequired = `<p><strong style="color: red;">CRITICAL ACTION REQUIRED:</strong> Deposit must be protected within 30 days. You are now in legal non-compliance. Protect immediately or face legal action and penalties.</p>`;
  } else if (alertInfo.type === 'prescribed_info_overdue') {
    subject = `🚨 CRITICAL: Prescribed Information Overdue`;
    actionRequired = `<p><strong style="color: red;">CRITICAL ACTION REQUIRED:</strong> Prescribed information must be provided within 30 days. You are now in legal non-compliance. Send immediately or face legal action and penalties.</p>`;
  }

  return `
    <h2>Deposit Compliance Alert</h2>
    
    <p><strong>Property:</strong> ${deposit.property_address}</p>
    <p><strong>Tenant:</strong> ${deposit.tenant_name}</p>
    <p><strong>Deposit Amount:</strong> £${deposit.deposit_amount}</p>
    <p><strong>Received:</strong> ${new Date(deposit.deposit_received_date).toLocaleDateString('en-GB')}</p>
    <p><strong>Deadline:</strong> ${new Date(deposit.protection_deadline).toLocaleDateString('en-GB')} (${daysUntil} days)</p>
    
    <hr />
    
    ${actionRequired}
    
    <h3>Current Status:</h3>
    <ul>
      <li>Protection Status: ${deposit.protection_date ? '✅ Protected' : '❌ Not Protected'}</li>
      <li>Prescribed Information: ${deposit.prescribed_info_sent ? '✅ Sent' : '❌ Not Sent'}</li>
    </ul>
    
    <h3>UK Deposit Protection Schemes:</h3>
    <ul>
      <li><strong>DPS:</strong> https://www.depositprotection.com | 0844 561 1000</li>
      <li><strong>TDS:</strong> https://www.tds.gb.com | 0870 770 6868</li>
      <li><strong>MyDeposits:</strong> https://www.mydeposits.co.uk | 0333 321 9401</li>
    </ul>
    
    <h3>Legal Consequences of Non-Compliance:</h3>
    <p>Failure to protect a deposit or provide prescribed information within 30 days can result in:</p>
    <ul>
      <li>Tenant can claim up to 3x the deposit amount in damages</li>
      <li>Inability to serve a Section 21 eviction notice</li>
      <li>County Court claims and legal costs</li>
      <li>Reputational damage and negative reviews</li>
    </ul>
    
    <p style="color: red;"><strong>Do not ignore this alert.</strong> Deposit protection is a legal requirement.</p>
  `;
}