/**
 * Universal File Upload & AI Processing Pipeline
 * Board-Mandated Compliance-Driven Document Intelligence
 * 
 * Usage:
 *   const result = await processUploadedFile(file, {
 *     appName: 'Premiso',
 *     domain: 'property',
 *     entityMappings: { contracts: 'TenancyAgreement', certificates: 'SafetyCertificate', ... }
 *   });
 */

import { base44 } from '@/api/base44Client';

// AI Model for complex document analysis — best quality for compliance
const AI_MODEL = 'claude_opus_4_6';

// Domain-specific compliance rules
const DOMAIN_RULES = {
  property: {
    name: 'UK Property Law',
    criticalFields: ['property_address', 'landlord_name', 'tenant_name', 'start_date', 'rent_amount', 'deposit_amount'],
    complianceChecks: ['Section 21 valid', 'EPC attached', 'Gas Safety certificate current', 'Deposit protected', 'Right to Rent verified'],
    riskIndicators: ['missing_signature', 'expired_certificate', 'undeposit_protected', 'invalid_notice_period']
  },
  conservation: {
    name: 'Conservation & Wildlife',
    criticalFields: ['species_name', 'location', 'survey_date', 'observer', 'population_count', 'conservation_status'],
    complianceChecks: ['Natural England standards', 'BTO guidelines', 'Data protection (endangered species)', 'Survey methodology valid'],
    riskIndicators: ['endangered_species_location_exposed', 'incomplete_survey', 'unqualified_observer', 'outdated_methodology']
  },
  charity: {
    name: 'Charity Commission & Fundraising',
    criticalFields: ['charity_number', 'donor_name', 'donation_amount', 'gift_aid_eligible', 'campaign_name', 'grant_funder'],
    complianceChecks: ['Charity Commission reporting', 'Gift Aid eligibility', 'GDPR donor consent', 'Fundraising regulator code'],
    riskIndicators: ['missing_gift_aid_declaration', 'donor_consent_expired', 'grant_deadline_missed', 'undeclared_conflict']
  },
  legal: {
    name: 'SRA Legal Practice',
    criticalFields: ['case_reference', 'client_name', 'opponent_name', 'incident_date', 'limitation_date', 'case_type'],
    complianceChecks: ['SRA Code of Conduct', 'Limitation date tracked', 'Client care letter sent', 'Costs transparency', 'Conflict check passed'],
    riskIndicators: ['limitation_date_within_30_days', 'no_client_care_letter', 'conflict_of_interest', 'missing_documentation']
  }
};

/**
 * Upload and AI-process any file type with automatic classification and compliance checking
 * @param {File} file - The uploaded file (any type: pdf, docx, xlsx, csv, jpg, png, etc.)
 * @param {Object} options - Processing options
 * @param {string} options.appName - App name (Species Explorer, Premiso, CharityHub, CaseNarrative)
 * @param {string} options.domain - Domain type (conservation/property/charity/legal)
 * @param {Object} options.entityMappings - Map content categories to entity names
 * @param {Object} options.customFields - Additional domain-specific fields to extract
 * @returns {Promise<Object>} Processing result with extracted data, compliance status, and routing
 */
export async function processUploadedFile(file, options) {
  const { appName, domain, entityMappings, customFields = {} } = options;
  
  if (!appName || !domain || !entityMappings) {
    throw new Error('processUploadedFile requires: appName, domain, and entityMappings');
  }

  const domainRules = DOMAIN_RULES[domain] || DOMAIN_RULES.property;

  try {
    // Step 1: Upload file
    const uploadResponse = await base44.integrations.Core.UploadFile({ file });
    const fileUrl = uploadResponse.file_url;

    // Step 2: AI Parse, Classify & Extract with Compliance Checking
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      model: AI_MODEL,
      prompt: `You are a ${domainRules.name} compliance expert and document analysis specialist.
      
Analyse this uploaded file: ${fileUrl}
App: ${appName}
Domain: ${domain}

TASK:
1. Detect file type automatically (PDF, DOCX, XLSX, CSV, JPG, PNG, etc.)
2. Classify content category (contract/certificate/report/financial/technical/legal/compliance/correspondence/other)
3. Extract all relevant fields based on the domain
4. Validate against compliance rules
5. Assess risk level
6. Determine which entity this should be routed to
7. Recommend actions

DOMAIN-SPECIFIC REQUIREMENTS:
- Critical Fields to Extract: ${domainRules.criticalFields.join(', ')}
- Compliance Checks: ${domainRules.complianceChecks.join(', ')}
- Risk Indicators: ${domainRules.riskIndicators.join(', ')}
${customFields.additionalInstructions ? `Additional Instructions: ${customFields.additionalInstructions}` : ''}

Output structured JSON with confidence scores. Be strict on compliance — flag anything uncertain.`,
      response_json_schema: {
        type: 'object',
        properties: {
          file_type: {
            type: 'string',
            description: 'Detected file type (pdf, docx, xlsx, csv, jpg, png, etc.)'
          },
          content_category: {
            type: 'string',
            enum: ['contract', 'certificate', 'report', 'financial', 'technical', 'legal', 'compliance', 'correspondence', 'other'],
            description: 'What type of document this is'
          },
          extracted_fields: {
            type: 'object',
            description: 'All extracted data fields'
          },
          compliance_check: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['compliant', 'review_required', 'non_compliant'] },
              passed_checks: { type: 'array', items: { type: 'string' } },
              failed_checks: { type: 'array', items: { type: 'string' } },
              missing_documents: { type: 'array', items: { type: 'string' } }
            },
            required: ['status']
          },
          risk_assessment: {
            type: 'object',
            properties: {
              level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              flags: { type: 'array', items: { type: 'string' } },
              explanation: { type: 'string' }
            },
            required: ['level']
          },
          routing: {
            type: 'object',
            properties: {
              target_entity: { type: 'string', description: 'Which entity to create (e.g., TenancyAgreement, SafetyCertificate)' },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              alternative_entities: { type: 'array', items: { type: 'string' } }
            },
            required: ['target_entity', 'confidence']
          },
          recommended_actions: {
            type: 'array',
            items: { type: 'string' },
            description: 'What the user should do next'
          },
          auto_fill_data: {
            type: 'object',
            description: 'Pre-formatted data ready to pass to entity.create()'
          }
        },
        required: ['file_type', 'content_category', 'extracted_fields', 'compliance_check', 'risk_assessment', 'routing', 'recommended_actions']
      }
    });

    const analysis = llmResponse.data;

    // Step 3: Auto-route to correct entity if confidence is high enough
    let createdRecord = null;
    if (analysis.routing.confidence >= 0.7 && analysis.routing.target_entity) {
      const targetEntity = entityMappings[analysis.routing.target_entity] || entityMappings[analysis.content_category];
      
      if (targetEntity && analysis.auto_fill_data) {
        try {
          const entityData = {
            ...analysis.auto_fill_data,
            file_url: fileUrl,
            risk_level: analysis.risk_assessment.level,
            compliance_status: analysis.compliance_check.status,
            processed_by_ai: true,
            processing_timestamp: new Date().toISOString()
          };

          // Use appropriate entity method
          if (base44.entities[targetEntity]) {
            createdRecord = await base44.entities[targetEntity].create(entityData);
          }
        } catch (entityError) {
          console.warn(`Auto-routing failed for entity ${targetEntity}:`, entityError.message);
          // Continue anyway — user can manually route
        }
      }
    }

    return {
      success: true,
      file_url: fileUrl,
      analysis,
      created_record: createdRecord,
      message: analysis.risk_assessment.level === 'critical' || analysis.risk_assessment.level === 'high'
        ? '⚠️ High-risk document detected — manual review recommended'
        : '✅ Document processed and routed successfully'
    };

  } catch (error) {
    console.error('File processing pipeline error:', error);
    return {
      success: false,
      error: error.message,
      message: '❌ File processing failed — please try again or contact support'
    };
  }
}

/**
 * Batch process multiple files with AI classification and routing
 * @param {File[]} files - Array of uploaded files
 * @param {Object} options - Same as processUploadedFile
 * @returns {Promise<Object[]>} Array of processing results
 */
export async function processMultipleFiles(files, options) {
  const results = [];
  
  for (const file of files) {
    const result = await processUploadedFile(file, options);
    results.push(result);
  }

  return results;
}

/**
 * Get compliance status summary for a set of processed files
 * @param {Array} processedFiles - Array of file records with compliance_status and risk_level
 * @returns {Object} Summary statistics
 */
export function getComplianceSummary(processedFiles) {
  const summary = {
    total: processedFiles.length,
    compliant: 0,
    review_required: 0,
    non_compliant: 0,
    risk_low: 0,
    risk_medium: 0,
    risk_high: 0,
    risk_critical: 0,
    requires_immediate_action: []
  };

  processedFiles.forEach(file => {
    // Compliance status
    if (file.compliance_status === 'compliant') summary.compliant++;
    else if (file.compliance_status === 'review_required') summary.review_required++;
    else if (file.compliance_status === 'non_compliant') summary.non_compliant++;

    // Risk levels
    if (file.risk_level === 'low') summary.risk_low++;
    else if (file.risk_level === 'medium') summary.risk_medium++;
    else if (file.risk_level === 'high') summary.risk_high++;
    else if (file.risk_level === 'critical') summary.risk_critical++;

    // Flag critical/high risk for immediate action
    if (file.risk_level === 'critical' || file.risk_level === 'high') {
      summary.requires_immediate_action.push({
        id: file.id,
        name: file.name || file.file_url,
        risk_level: file.risk_level,
        compliance_status: file.compliance_status
      });
    }
  });

  return summary;
}

export default {
  processUploadedFile,
  processMultipleFiles,
  getComplianceSummary,
  DOMAIN_RULES,
  AI_MODEL
};