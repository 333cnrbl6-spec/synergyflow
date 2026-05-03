import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Check for expiring/expired documents and send renewal alerts
 * Run this daily via automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all documents for this user
    const documents = await base44.asServiceRole.entities.Document.list();

    const alertsToSend = [];
    const documentsToUpdate = [];

    const now = new Date();

    documents.forEach(doc => {
      if (!doc.expiration_date) return;

      const expiryDate = new Date(doc.expiration_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      // Check if document needs alert
      const needsAlert = daysUntilExpiry <= 30 && !doc.renewal_alert_sent;
      const isExpired = daysUntilExpiry < 0;
      const expiringWithin30 = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

      if (needsAlert) {
        alertsToSend.push({
          documentId: doc.id,
          documentName: doc.name,
          documentType: doc.document_type,
          propertyName: doc.property_name,
          expiryDate: doc.expiration_date,
          daysUntilExpiry: Math.max(0, daysUntilExpiry),
          isExpired,
          userEmail: user.email
        });

        // Mark alert as sent
        documentsToUpdate.push({
          id: doc.id,
          renewal_alert_sent: true,
          renewal_alert_sent_date: new Date().toISOString(),
          status: isExpired ? 'expired' : expiringWithin30 ? 'expiring_soon' : 'valid'
        });
      } else if (isExpired || expiringWithin30) {
        // Update status even if alert already sent
        documentsToUpdate.push({
          id: doc.id,
          status: isExpired ? 'expired' : 'expiring_soon'
        });
      }
    });

    // Update document statuses
    for (const update of documentsToUpdate) {
      const { id, ...data } = update;
      await base44.asServiceRole.entities.Document.update(id, data);
    }

    // Send alerts via email
    if (alertsToSend.length > 0) {
      const alertSummary = alertsToSend.map(alert => {
        const daysText = alert.daysUntilExpiry === 0 ? 'today' : `in ${alert.daysUntilExpiry} days`;
        const status = alert.isExpired ? '⚠️ EXPIRED' : '🔔 EXPIRING';
        return `${status}: ${alert.documentName} ${daysText}`;
      }).join('\n');

      const emailBody = `
Your compliance documents need attention:

${alertSummary}

Please log in to Premiso to renew or replace these documents.

Best regards,
Premiso Compliance Team
      `.trim();

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `⚠️ Document Renewal Alert - ${alertsToSend.length} document(s) need attention`,
        body: emailBody
      });
    }

    return Response.json({
      success: true,
      alertsSent: alertsToSend.length,
      documentsUpdated: documentsToUpdate.length,
      alerts: alertsToSend
    });
  } catch (error) {
    console.error('Error checking document expirations:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});