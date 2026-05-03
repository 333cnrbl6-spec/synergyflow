/**
 * Automated messaging utility functions
 */

export const EMAIL_PLACEHOLDERS = {
  // Tenant
  tenant_name: { label: 'Tenant Name', example: 'John Smith' },
  tenant_email: { label: 'Tenant Email', example: 'john@example.com' },
  tenant_phone: { label: 'Tenant Phone', example: '07911 123456' },

  // Property
  property_name: { label: 'Property Name', example: '42 Maple Street' },
  property_address: { label: 'Property Address', example: '42 Maple Street, London SW1A 1AA' },
  
  // Rent
  rent_amount: { label: 'Monthly Rent', example: '£1,200' },
  rent_due_date: { label: 'Due Date', example: '1st of each month' },
  rent_overdue_by: { label: 'Days Overdue', example: '7 days' },
  total_outstanding: { label: 'Total Outstanding', example: '£2,400' },

  // Tenancy
  tenancy_start_date: { label: 'Tenancy Start Date', example: '1st January 2024' },
  tenancy_end_date: { label: 'Tenancy End Date', example: '31st December 2025' },
  tenancy_renewal_date: { label: 'Renewal Date', example: '1st January 2026' },

  // System
  current_date: { label: 'Current Date', example: '3rd May 2026' },
  landlord_name: { label: 'Landlord Name', example: 'Jane Doe' },
  payment_portal_url: { label: 'Payment Portal URL', example: 'https://premiso.app/pay' }
};

export const TEMPLATE_TYPES = {
  rent_reminder: {
    label: 'Rent Reminder',
    description: 'Friendly reminder before rent is due',
    color: 'bg-blue-100 text-blue-700',
    icon: '📧'
  },
  rent_overdue: {
    label: 'Rent Overdue Notice',
    description: 'Payment is overdue',
    color: 'bg-red-100 text-red-700',
    icon: '⚠️'
  },
  tenancy_renewal: {
    label: 'Tenancy Renewal',
    description: 'Notice of upcoming tenancy renewal',
    color: 'bg-purple-100 text-purple-700',
    icon: '📜'
  },
  maintenance_update: {
    label: 'Maintenance Update',
    description: 'Notification about maintenance or repairs',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '🔧'
  },
  inspection_notice: {
    label: 'Inspection Notice',
    description: 'Notification of upcoming inspection',
    color: 'bg-orange-100 text-orange-700',
    icon: '👀'
  },
  deposit_return: {
    label: 'Deposit Return',
    description: 'Notification about deposit return',
    color: 'bg-green-100 text-green-700',
    icon: '💰'
  },
  custom: {
    label: 'Custom Message',
    description: 'Custom template',
    color: 'bg-slate-100 text-slate-700',
    icon: '✉️'
  }
};

export const TRIGGER_TYPES = {
  manual: { label: 'Manual Send', description: 'Sent manually by landlord' },
  rent_due: { label: 'Rent Due', description: 'Sent when rent is due' },
  rent_overdue_3_days: { label: 'Rent 3 Days Late', description: 'Sent 3 days after due date' },
  rent_overdue_7_days: { label: 'Rent 7 Days Late', description: 'Sent 7 days after due date' },
  rent_overdue_14_days: { label: 'Rent 14 Days Late', description: 'Sent 14 days after due date' },
  tenancy_renewal_90_days: { label: 'Tenancy Renewal (90 days)', description: 'Sent 90 days before renewal' },
  tenancy_renewal_30_days: { label: 'Tenancy Renewal (30 days)', description: 'Sent 30 days before renewal' },
  maintenance_scheduled: { label: 'Maintenance Scheduled', description: 'Sent when maintenance is scheduled' },
  custom_date: { label: 'Custom Date', description: 'Sent on specific date' }
};

/**
 * Populate email template with data
 */
export function populateEmailTemplate(subject, body, data) {
  let populatedSubject = subject;
  let populatedBody = body;

  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    populatedSubject = populatedSubject.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
    populatedBody = populatedBody.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
  });

  return { subject: populatedSubject, body: populatedBody };
}

/**
 * Extract placeholders from template
 */
export function extractPlaceholders(text) {
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const placeholders = new Set();
  let match;

  while ((match = regex.exec(text)) !== null) {
    placeholders.add(match[1]);
  }

  return Array.from(placeholders);
}

/**
 * Get rent payment status
 */
export function getRentStatus(lastPaymentDate, rentDueDate) {
  if (!rentDueDate) return 'unknown';
  
  const today = new Date();
  const due = new Date(rentDueDate);
  const diffMs = today.getTime() - due.getTime();
  const daysOverdue = Math.ceil(diffMs / (1000 * 3600 * 24));

  if (daysOverdue < 0) return 'on_time';
  if (daysOverdue === 0) return 'due_today';
  if (daysOverdue <= 3) return 'overdue_3';
  if (daysOverdue <= 7) return 'overdue_7';
  if (daysOverdue <= 14) return 'overdue_14';
  return 'overdue_30plus';
}

/**
 * Get default template for trigger type
 */
export function getDefaultTemplate(triggerType) {
  const templates = {
    rent_due: {
      subject: 'Rent Payment Due - {{property_name}}',
      body: `Hello {{tenant_name}},\n\nFriendly reminder that rent for {{property_name}} is due on {{rent_due_date}}.\n\nAmount: {{rent_amount}}\n\nPlease ensure payment is made on time. You can pay via the tenant portal.\n\nBest regards,\n{{landlord_name}}`
    },
    rent_overdue_3_days: {
      subject: 'Rent Payment Overdue - {{property_name}}',
      body: `Hello {{tenant_name}},\n\nWe notice that rent payment for {{property_name}} is now 3 days overdue.\n\nDue Date: {{rent_due_date}}\nAmount Outstanding: {{total_outstanding}}\n\nPlease arrange payment immediately to avoid further action.\n\nBest regards,\n{{landlord_name}}`
    },
    rent_overdue_7_days: {
      subject: 'URGENT: Rent Payment Overdue - {{property_name}}',
      body: `Hello {{tenant_name}},\n\nRent for {{property_name}} is now 7 days overdue.\n\nAmount Outstanding: {{total_outstanding}}\n\nImmediate payment is required. Please contact us if there are any issues.\n\nBest regards,\n{{landlord_name}}`
    },
    tenancy_renewal_90_days: {
      subject: 'Tenancy Renewal Notice - {{property_name}}',
      body: `Hello {{tenant_name}},\n\nYour tenancy for {{property_name}} will expire on {{tenancy_end_date}}.\n\nWe would like to discuss renewal terms 90 days in advance. Please contact us to discuss.\n\nCurrent Rent: {{rent_amount}}\n\nBest regards,\n{{landlord_name}}`
    },
    maintenance_update: {
      subject: 'Maintenance Update - {{property_name}}',
      body: `Hello {{tenant_name}},\n\nA maintenance issue at {{property_address}} requires attention.\n\nPlease keep the area accessible. We will contact you with specific timing.\n\nThank you for your cooperation.\n\nBest regards,\n{{landlord_name}}`
    }
  };

  return templates[triggerType] || null;
}

/**
 * Format rent status for display
 */
export function formatRentStatus(status) {
  const labels = {
    on_time: '✅ On Time',
    due_today: '📅 Due Today',
    overdue_3: '⚠️ 3 Days Overdue',
    overdue_7: '🔴 7 Days Overdue',
    overdue_14: '🔴 14 Days Overdue',
    overdue_30plus: '🔴 30+ Days Overdue'
  };
  return labels[status] || 'Unknown';
}