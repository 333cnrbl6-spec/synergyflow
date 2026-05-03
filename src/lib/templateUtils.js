/**
 * Template utility functions for placeholder parsing and population
 */

export const PLACEHOLDER_DEFINITIONS = {
  // Tenant placeholders
  tenant_name: { label: 'Tenant Name', example: 'John Smith' },
  tenant_email: { label: 'Tenant Email', example: 'john@example.com' },
  tenant_phone: { label: 'Tenant Phone', example: '07911 123456' },
  tenant_address: { label: 'Tenant Address', example: '123 Main St, London' },

  // Property placeholders
  property_name: { label: 'Property Name', example: '42 Maple Street' },
  property_address: { label: 'Property Full Address', example: '42 Maple Street, London SW1A 1AA' },
  property_postcode: { label: 'Property Postcode', example: 'SW1A 1AA' },
  property_type: { label: 'Property Type', example: 'Flat' },

  // Tenancy placeholders
  tenancy_start_date: { label: 'Tenancy Start Date', example: '1st January 2024' },
  tenancy_end_date: { label: 'Tenancy End Date', example: '31st December 2024' },
  rent_amount: { label: 'Monthly Rent', example: '£1,200' },
  rent_due_day: { label: 'Rent Due Day', example: '1st of each month' },
  deposit_amount: { label: 'Deposit Amount', example: '£2,400' },

  // Landlord placeholders
  landlord_name: { label: 'Landlord Name', example: 'Jane Doe' },
  landlord_email: { label: 'Landlord Email', example: 'jane@example.com' },
  landlord_phone: { label: 'Landlord Phone', example: '07911 654321' },

  // System placeholders
  current_date: { label: 'Current Date', example: '3rd May 2026' },
  document_title: { label: 'Document Title', example: 'Tenancy Agreement' }
};

export const TEMPLATE_TYPE_PLACEHOLDERS = {
  tenancy_agreement: [
    'tenant_name', 'tenant_email', 'tenant_phone',
    'property_name', 'property_address', 'property_postcode', 'property_type',
    'tenancy_start_date', 'tenancy_end_date', 'rent_amount', 'rent_due_day', 'deposit_amount',
    'landlord_name', 'landlord_email', 'current_date'
  ],
  notice_to_quit: [
    'tenant_name', 'property_address', 'notice_period', 'notice_end_date',
    'landlord_name', 'current_date'
  ],
  notice_to_repair: [
    'tenant_name', 'property_address', 'repair_description', 'repair_deadline',
    'landlord_name', 'current_date'
  ],
  rent_demand: [
    'tenant_name', 'property_address', 'rent_amount', 'rent_period',
    'landlord_name', 'current_date'
  ],
  custom: Object.keys(PLACEHOLDER_DEFINITIONS)
};

/**
 * Extract placeholders from template content
 * Returns array of unique placeholder tags found
 */
export function extractPlaceholders(content) {
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const placeholders = new Set();
  let match;

  while ((match = regex.exec(content)) !== null) {
    placeholders.add(match[1]);
  }

  return Array.from(placeholders);
}

/**
 * Populate template with data
 * Returns template content with all placeholders replaced
 */
export function populateTemplate(content, data) {
  let populated = content;

  // Replace each placeholder with corresponding data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    populated = populated.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
  });

  // Replace any remaining unmapped placeholders with [placeholder_name]
  const unmappedRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  populated = populated.replace(unmappedRegex, '[Unmapped: $1]');

  return populated;
}

/**
 * Format a template with proper line breaks and spacing
 */
export function formatTemplateForDisplay(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
}

/**
 * Generate placeholder suggestions for a template type
 */
export function getPlaceholderSuggestions(templateType) {
  const placeholders = TEMPLATE_TYPE_PLACEHOLDERS[templateType] || [];
  return placeholders.map(placeholder => ({
    tag: `{{${placeholder}}}`,
    ...PLACEHOLDER_DEFINITIONS[placeholder]
  }));
}

/**
 * Validate template for missing or invalid placeholders
 */
export function validateTemplate(content, templateType) {
  const errors = [];
  const placeholders = extractPlaceholders(content);
  const validPlaceholders = new Set(TEMPLATE_TYPE_PLACEHOLDERS[templateType] || Object.keys(PLACEHOLDER_DEFINITIONS));

  placeholders.forEach(placeholder => {
    if (!validPlaceholders.has(placeholder) && !PLACEHOLDER_DEFINITIONS[placeholder]) {
      errors.push(`Unknown placeholder: {{${placeholder}}}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    placeholders
  };
}