/**
 * Automated Audit Trail System
 * Board-Mandated Compliance: Track ALL entity modifications for regulatory transparency
 * 
 * Critical for: Property (UK Housing Act), Legal (SRA Code), Charity (Charity Commission)
 * 
 * Usage:
 *   // In entity automations (on create/update/delete):
 *   import { logAuditEntry, createAuditTrail } from '@/lib/AuditTrail';
 *   
 *   await logAuditEntry({
 *     entityName: 'TenancyAgreement',
 *     entityId: record.id,
 *     action: 'update',
 *     oldData: oldRecord,
 *     newData: newRecord,
 *     userEmail: user.email
 *   });
 */

import { base44 } from '@/api/base44Client';

/**
 * Log an audit trail entry for any entity modification
 * @param {Object} params - Audit entry parameters
 * @param {string} params.entityName - Entity being modified (e.g., 'TenancyAgreement')
 * @param {string} params.entityId - Record ID
 * @param {'create' | 'update' | 'delete'} params.action - Type of modification
 * @param {Object} [params.oldData] - Previous data (for updates)
 * @param {Object} params.newData - New/created data
 * @param {string} params.userEmail - User making the change
 * @param {string} [params.reason] - Optional reason for change (for compliance notes)
 * @param {string} [params.ipAddress] - Optional IP address
 * @returns {Promise<Object>} Created audit record
 */
export async function logAuditEntry(params) {
  const {
    entityName,
    entityId,
    action,
    oldData,
    newData,
    userEmail,
    reason = null,
    ipAddress = null
  } = params;

  if (!entityName || !entityId || !action || !userEmail) {
    throw new Error('AuditTrail requires: entityName, entityId, action, userEmail');
  }

  // Calculate changed fields (for updates)
  const changedFields = action === 'update' && oldData && newData
    ? calculateChangedFields(oldData, newData)
    : [];

  // Create audit entry
  const auditData = {
    entity_name: entityName,
    entity_id: entityId,
    action,
    user_email: userEmail,
    timestamp: new Date().toISOString(),
    changed_fields: changedFields,
    changes_summary: generateChangesSummary(action, oldData, newData, changedFields),
    old_snapshot: action === 'update' ? oldData : null,
    new_snapshot: newData,
    reason,
    ip_address: ipAddress,
    compliance_flags: detectComplianceCriticalChanges(entityName, action, changedFields, oldData, newData)
  };

  try {
    const auditRecord = await base44.entities.AuditTrail.create(auditData);
    return { success: true, auditRecord };
  } catch (error) {
    console.error('Failed to create audit trail entry:', error);
    // Don't throw — audit failure shouldn't block the main operation
    // But log it for investigation
    return { success: false, error: error.message };
  }
}

/**
 * Calculate which fields changed between old and new data
 * @param {Object} oldData - Previous record data
 * @param {Object} newData - New record data
 * @returns {Array<string>} Array of changed field names
 */
function calculateChangedFields(oldData, newData) {
  const changedFields = [];
  
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  for (const key of allKeys) {
    // Skip built-in fields that change automatically
    if (['updated_date', 'id'].includes(key)) continue;
    
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    
    // Deep comparison for objects/arrays
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changedFields.push(key);
    }
  }
  
  return changedFields;
}

/**
 * Generate human-readable summary of changes
 * @param {string} action - create/update/delete
 * @param {Object} oldData - Previous data
 * @param {Object} newData - New data
 * @param {Array<string>} changedFields - List of changed field names
 * @returns {string} Summary text
 */
function generateChangesSummary(action, oldData, newData, changedFields) {
  if (action === 'create') {
    return `Record created with ${Object.keys(newData || {}).length} fields`;
  }
  
  if (action === 'delete') {
    return `Record deleted (had ${Object.keys(oldData || {}).length} fields)`;
  }
  
  if (action === 'update') {
    const changes = changedFields.map(field => {
      const oldValue = oldData?.[field];
      const newValue = newData?.[field];
      return `${field}: "${oldValue}" → "${newValue}"`;
    });
    
    return `Updated ${changedFields.length} field(s): ${changes.join(', ')}`;
  }
  
  return 'Unknown action';
}

/**
 * Detect compliance-critical changes that require immediate attention
 * @param {string} entityName - Entity type
 * @param {string} action - Action type
 * @param {Array<string>} changedFields - Changed fields
 * @param {Object} oldData - Old data
 * @param {Object} newData - New data
 * @returns {Array<Object>} Compliance flags
 */
function detectComplianceCriticalChanges(entityName, action, changedFields, oldData, newData) {
  const flags = [];

  // Property domain compliance checks
  if (entityName === 'TenancyAgreement' || entityName === 'Property' || entityName === 'Tenant') {
    if (changedFields.includes('rent_amount')) {
      flags.push({
        type: 'rent_change',
        severity: 'medium',
        message: 'Rent amount modified — may require Section 13 notice',
        regulation: 'Housing Act 1988'
      });
    }
    if (changedFields.includes('tenant_name') || changedFields.includes('tenants')) {
      flags.push({
        type: 'tenant_change',
        severity: 'high',
        message: 'Tenant changed — verify Right to Rent check completed',
        regulation: 'Immigration Act 2014'
      });
    }
    if (changedFields.includes('status') && newData?.status === 'terminated') {
      flags.push({
        type: 'tenancy_ended',
        severity: 'high',
        message: 'Tenancy terminated — ensure proper notice served and deposit returned',
        regulation: 'Housing Act 2004'
      });
    }
  }

  // Legal domain compliance checks
  if (entityName === 'Case' || entityName === 'LegalCase' || entityName === 'Client') {
    if (changedFields.includes('limitation_date')) {
      flags.push({
        type: 'limitation_date_change',
        severity: 'critical',
        message: 'Limitation date modified — verify accuracy to avoid negligence claim',
        regulation: 'SRA Code of Conduct'
      });
    }
    if (changedFields.includes('status') && newData?.status === 'settled') {
      flags.push({
        type: 'case_settled',
        severity: 'medium',
        message: 'Case settled — ensure settlement authority obtained and costs calculated',
        regulation: 'SRA Code of Conduct'
      });
    }
    if (changedFields.includes('assigned_fee_earner')) {
      flags.push({
        type: 'fee_earner_change',
        severity: 'medium',
        message: 'Fee earner changed — update client care letter and conflict checks',
        regulation: 'SRA Code of Conduct'
      });
    }
  }

  // Charity domain compliance checks
  if (entityName === 'Donation' || entityName === 'Grant' || entityName === 'Campaign') {
    if (changedFields.includes('amount') && newData?.amount > 10000) {
      flags.push({
        type: 'large_donation',
        severity: 'medium',
        message: 'Large donation (>£10k) — verify donor eligibility and source',
        regulation: 'Charity Commission Guidelines'
      });
    }
    if (changedFields.includes('gift_aid_eligible') && newData?.gift_aid_eligible === true) {
      flags.push({
        type: 'gift_aid_claimed',
        severity: 'low',
        message: 'Gift Aid declared — ensure valid declaration on file',
        regulation: 'HMRC Gift Aid Rules'
      });
    }
    if (entityName === 'Grant' && changedFields.includes('deadline') && newData?.deadline) {
      const daysUntil = Math.ceil((new Date(newData.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 7) {
        flags.push({
          type: 'grant_deadline_imminent',
          severity: 'high',
          message: `Grant deadline in ${daysUntil} days — immediate action required`,
          regulation: 'Grant Compliance'
        });
      }
    }
  }

  // Conservation domain compliance checks
  if (entityName === 'Survey' || entityName === 'SpeciesObservation' || entityName === 'Site') {
    if (changedFields.includes('conservation_status')) {
      flags.push({
        type: 'status_change',
        severity: 'medium',
        message: 'Conservation status changed — verify with qualified ecologist',
        regulation: 'Natural England Standards'
      });
    }
    if (changedFields.includes('location') && newData?.sensitive_species === true) {
      flags.push({
        type: 'sensitive_location_change',
        severity: 'high',
        message: 'Location of sensitive species modified — ensure data protection applied',
        regulation: 'Wildlife & Countryside Act 1981'
      });
    }
  }

  // Generic compliance checks (all domains)
  if (action === 'delete') {
    flags.push({
      type: 'record_deletion',
      severity: 'high',
      message: 'Record deleted — verify this complies with data retention policy',
      regulation: 'GDPR Article 17'
    });
  }

  if (changedFields.includes('file_url') || changedFields.includes('files')) {
    flags.push({
      type: 'document_change',
      severity: 'low',
      message: 'Supporting document modified — verify version control',
      regulation: 'Best Practice'
    });
  }

  return flags;
}

/**
 * Get audit trail for a specific entity record
 * @param {string} entityName - Entity type
 * @param {string} entityId - Record ID
 * @returns {Promise<Array>} Array of audit entries (newest first)
 */
export async function getAuditTrail(entityName, entityId) {
  try {
    const audits = await base44.entities.AuditTrail.filter(
      { entity_name: entityName, entity_id: entityId },
      '-timestamp'
    );
    return audits || [];
  } catch (error) {
    console.error('Failed to fetch audit trail:', error);
    return [];
  }
}

/**
 * Get audit trail for a specific user
 * @param {string} userEmail - User email
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Array>} Array of audit entries
 */
export async function getUserAuditTrail(userEmail, days = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const audits = await base44.entities.AuditTrail.filter(
      { user_email: userEmail },
      '-timestamp'
    );
    
    // Filter by date client-side if needed
    return (audits || []).filter(audit => 
      new Date(audit.timestamp) >= cutoffDate
    );
  } catch (error) {
    console.error('Failed to fetch user audit trail:', error);
    return [];
  }
}

/**
 * Get compliance report for a date range
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @param {string} [entityName] - Optional filter by entity
 * @returns {Promise<Object>} Compliance summary report
 */
export async function getComplianceReport(startDate, endDate, entityName = null) {
  try {
    let audits = await base44.entities.AuditTrail.filter({}, '-timestamp');
    
    // Filter by date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    audits = (audits || []).filter(audit => {
      const auditDate = new Date(audit.timestamp);
      const inRange = auditDate >= start && auditDate <= end;
      const matchesEntity = !entityName || audit.entity_name === entityName;
      return inRange && matchesEntity;
    });

    // Generate summary
    const summary = {
      period: { start: startDate, end: endDate },
      entity_filter: entityName,
      total_modifications: audits.length,
      by_action: {
        create: audits.filter(a => a.action === 'create').length,
        update: audits.filter(a => a.action === 'update').length,
        delete: audits.filter(a => a.action === 'delete').length
      },
      by_user: {},
      compliance_flags: {
        critical: audits.filter(a => a.compliance_flags?.some(f => f.severity === 'critical')).length,
        high: audits.filter(a => a.compliance_flags?.some(f => f.severity === 'high')).length,
        medium: audits.filter(a => a.compliance_flags?.some(f => f.severity === 'medium')).length,
        low: audits.filter(a => a.compliance_flags?.some(f => f.severity === 'low')).length
      },
      flagged_records: audits
        .filter(a => a.compliance_flags?.length > 0)
        .map(a => ({
          entity_name: a.entity_name,
          entity_id: a.entity_id,
          timestamp: a.timestamp,
          user_email: a.user_email,
          flags: a.compliance_flags
        }))
    };

    // Count by user
    audits.forEach(audit => {
      summary.by_user[audit.user_email] = (summary.by_user[audit.user_email] || 0) + 1;
    });

    return { success: true, summary };
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create entity automations for audit trail (call this in app setup)
 * @param {string} entityName - Entity to watch
 * @returns {Promise<void>}
 */
export async function createAuditTrailAutomations(entityName) {
  console.log(`Audit trail automations would be created for entity: ${entityName}`);
  console.log('Note: Automations must be created via Base44 dashboard or backend function');
  
  // This function documents what automations should be created
  // In practice, you'd create these via create_automation tool or dashboard:
  
  const automations = [
    {
      name: `Audit Trail - ${entityName} Create`,
      entity_name: entityName,
      event_types: ['create'],
      function_name: 'logEntityCreateAudit',
      description: `Log audit trail when ${entityName} records are created`
    },
    {
      name: `Audit Trail - ${entityName} Update`,
      entity_name: entityName,
      event_types: ['update'],
      function_name: 'logEntityUpdateAudit',
      description: `Log audit trail when ${entityName} records are updated`
    },
    {
      name: `Audit Trail - ${entityName} Delete`,
      entity_name: entityName,
      event_types: ['delete'],
      function_name: 'logEntityDeleteAudit',
      description: `Log audit trail when ${entityName} records are deleted`
    }
  ];

  return automations;
}

export default {
  logAuditEntry,
  getAuditTrail,
  getUserAuditTrail,
  getComplianceReport,
  createAuditTrailAutomations,
  calculateChangedFields,
  generateChangesSummary,
  detectComplianceCriticalChanges
};