/**
 * Document management utility functions
 */

export const DOCUMENT_TYPES = {
  gas_safety_certificate: {
    label: 'Gas Safety Certificate',
    validityYears: 1,
    color: 'bg-red-100 text-red-700',
    icon: '🔥',
    description: 'Required annually for gas installations'
  },
  epc: {
    label: 'Energy Performance Certificate',
    validityYears: 10,
    color: 'bg-green-100 text-green-700',
    icon: '⚡',
    description: 'Valid for 10 years'
  },
  eicr: {
    label: 'Electrical Installation Condition Report',
    validityYears: 5,
    color: 'bg-yellow-100 text-yellow-700',
    icon: '⚠️',
    description: 'Required every 5 years'
  },
  hmo_license: {
    label: 'HMO License',
    validityYears: 5,
    color: 'bg-blue-100 text-blue-700',
    icon: '🏠',
    description: 'Required for HMO properties'
  },
  insurance: {
    label: 'Insurance Certificate',
    validityYears: 1,
    color: 'bg-purple-100 text-purple-700',
    icon: '🛡️',
    description: 'Landlord insurance policy'
  },
  tenancy_agreement: {
    label: 'Tenancy Agreement',
    validityYears: null,
    color: 'bg-slate-100 text-slate-700',
    icon: '📄',
    description: 'No expiration'
  },
  risk_assessment: {
    label: 'Risk Assessment',
    validityYears: 3,
    color: 'bg-orange-100 text-orange-700',
    icon: '📋',
    description: 'Updated every 3 years'
  },
  other: {
    label: 'Other Document',
    validityYears: null,
    color: 'bg-slate-100 text-slate-700',
    icon: '📎',
    description: 'Custom document'
  }
};

/**
 * Calculate days until expiration
 */
export function daysUntilExpiration(expirationDate) {
  if (!expirationDate) return null;
  const expiry = new Date(expirationDate);
  const today = new Date();
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

/**
 * Get document status based on expiration date
 */
export function getDocumentStatus(expirationDate) {
  if (!expirationDate) return 'valid';
  
  const days = daysUntilExpiration(expirationDate);
  
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring_soon';
  return 'valid';
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(date) {
  if (!date) return 'No expiration';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Get human-readable expiration status
 */
export function getExpirationStatus(expirationDate) {
  if (!expirationDate) return 'No expiration date';
  
  const days = daysUntilExpiration(expirationDate);
  
  if (days < 0) {
    return `Expired ${Math.abs(days)} days ago`;
  }
  if (days === 0) {
    return 'Expires today';
  }
  if (days === 1) {
    return 'Expires tomorrow';
  }
  if (days <= 30) {
    return `Expires in ${days} days`;
  }
  return `Expires on ${formatExpirationDate(expirationDate)}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  const colors = {
    valid: 'bg-green-100 text-green-800',
    expiring_soon: 'bg-amber-100 text-amber-800',
    expired: 'bg-red-100 text-red-800',
    archived: 'bg-slate-100 text-slate-800'
  };
  return colors[status] || colors.valid;
}

/**
 * Calculate renewal date based on document type
 */
export function calculateRenewalDate(issueDate, docType) {
  const validity = DOCUMENT_TYPES[docType]?.validityYears;
  if (!validity || !issueDate) return null;
  
  const date = new Date(issueDate);
  date.setFullYear(date.getFullYear() + validity);
  return date.toISOString().split('T')[0];
}

/**
 * Get documents needing attention (expired or expiring soon)
 */
export function filterDocumentsNeedingAttention(documents) {
  return documents.filter(doc => {
    const status = getDocumentStatus(doc.expiration_date);
    return status === 'expired' || status === 'expiring_soon';
  });
}

/**
 * Group documents by status
 */
export function groupDocumentsByStatus(documents) {
  return {
    valid: documents.filter(d => getDocumentStatus(d.expiration_date) === 'valid'),
    expiring_soon: documents.filter(d => getDocumentStatus(d.expiration_date) === 'expiring_soon'),
    expired: documents.filter(d => getDocumentStatus(d.expiration_date) === 'expired')
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(sizeKb) {
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}