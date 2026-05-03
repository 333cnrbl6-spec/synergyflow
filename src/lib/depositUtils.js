/**
 * Deposit protection utilities for UK landlord compliance
 */

export const DEPOSIT_SCHEMES = {
  dps: {
    name: 'Deposit Protection Service (DPS)',
    url: 'https://www.depositprotection.com',
    phone: '0844 561 1000',
    email: 'hello@depositprotection.com',
    color: 'bg-blue-100 text-blue-700'
  },
  tds: {
    name: 'The Deposit Protection Service (TDS)',
    url: 'https://www.tds.gb.com',
    phone: '0870 770 6868',
    email: 'deposits@tds.gb.com',
    color: 'bg-green-100 text-green-700'
  },
  mydeposits: {
    name: 'MyDeposits',
    url: 'https://www.mydeposits.co.uk',
    phone: '0333 321 9401',
    email: 'support@mydeposits.co.uk',
    color: 'bg-purple-100 text-purple-700'
  }
};

export const COMPLIANCE_STATUS = {
  compliant: {
    label: 'Compliant ✓',
    color: 'bg-green-100 text-green-700',
    icon: '✅',
    description: 'Deposit protected and prescribed information provided within 30 days'
  },
  at_risk: {
    label: 'At Risk ⚠️',
    color: 'bg-yellow-100 text-yellow-700',
    icon: '⏰',
    description: 'Protection or prescribed info not yet completed - approaching deadline'
  },
  non_compliant: {
    label: 'Non-Compliant 🔴',
    color: 'bg-red-100 text-red-700',
    icon: '❌',
    description: 'Deadline has passed - immediate action required'
  },
  overdue: {
    label: 'Severely Overdue 🚨',
    color: 'bg-red-200 text-red-900',
    icon: '⛔',
    description: 'Critical compliance failure - legal liability'
  }
};

export const DEPOSIT_STATUSES = {
  held: { label: 'Held', color: 'bg-blue-100 text-blue-700' },
  returned: { label: 'Returned', color: 'bg-green-100 text-green-700' },
  deductions_made: { label: 'Deductions Made', color: 'bg-orange-100 text-orange-700' },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-700' }
};

/**
 * Calculate 30 days from deposit received date
 */
export function calculateDeadline(depositReceivedDate) {
  const date = new Date(depositReceivedDate);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate days until deadline
 */
export function daysUntilDeadline(deadline) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil((deadlineDate - today) / (1000 * 3600 * 24));
}

/**
 * Determine compliance status based on protection and prescribed info
 */
export function getComplianceStatus(deposit) {
  const today = new Date();
  const deadline = new Date(deposit.protection_deadline);
  const daysUntil = Math.ceil((deadline - today) / (1000 * 3600 * 24));

  // If both protection and prescribed info completed within 30 days
  if (deposit.protection_date && deposit.prescribed_info_sent) {
    const protectionDate = new Date(deposit.protection_date);
    const prescribedDate = new Date(deposit.prescribed_info_sent_date);
    if (protectionDate <= deadline && prescribedDate <= deadline) {
      return 'compliant';
    }
  }

  // If deadline passed without both requirements
  if (daysUntil < 0) {
    return 'overdue';
  }

  // If deadline within 7 days
  if (daysUntil <= 7) {
    return 'non_compliant';
  }

  // If deadline approaching
  if (daysUntil <= 14) {
    return 'at_risk';
  }

  return 'at_risk';
}

/**
 * Generate prescribed information text (England & Wales)
 */
export function generatePrescribedInformation(deposit, scheme) {
  const daysUntilReturn = deposit.prescribed_info_deadline
    ? Math.ceil((new Date(deposit.prescribed_info_deadline) - new Date()) / (1000 * 3600 * 24))
    : 0;

  const schemeInfo = DEPOSIT_SCHEMES[scheme] || {};

  return `
PRESCRIBED INFORMATION - TENANCY DEPOSIT PROTECTION

This document contains prescribed information about how your tenancy deposit has been protected.

DEPOSIT DETAILS
===============
Property Address: ${deposit.property_address}
Deposit Amount: £${deposit.deposit_amount}
Date Received: ${new Date(deposit.deposit_received_date).toLocaleDateString('en-GB')}
Tenancy Start Date: ${new Date(deposit.tenancy_start_date).toLocaleDateString('en-GB')}

PROTECTION SCHEME
=================
Your deposit has been protected with: ${schemeInfo.name}
Reference Number: ${deposit.protection_reference || 'To be provided'}
Date Protected: ${deposit.protection_date ? new Date(deposit.protection_date).toLocaleDateString('en-GB') : 'Pending'}

PRESCRIBED INFORMATION RIGHTS
=============================

You are entitled to the return of your deposit in full, plus accrued interest, at the end of the tenancy,
unless deductions are made for:

- Damage to the property (beyond fair wear and tear)
- Cleaning (if required under the tenancy agreement)
- Unpaid rent
- Breach of tenancy terms

DISPUTE RESOLUTION
==================

If there is a dispute about the return of your deposit, either party can apply to the dispute resolution
service of the scheme in which the deposit is protected, free of charge.

Scheme Contact Details:
${schemeInfo.name}
Phone: ${schemeInfo.phone}
Email: ${schemeInfo.email}
Website: ${schemeInfo.url}

LANDLORD DETAILS
================
This deposit is held on behalf of:
Name: [LANDLORD NAME]
Address: [LANDLORD ADDRESS]

Your right to take proceedings against the scheme
=================================================

If the deposit is not returned within the required timescale, or if there is a dispute about the deposit
which cannot be resolved through the scheme's dispute resolution process, you may take proceedings against
the scheme to recover the full deposit and/or compensation.

KEY DATES
=========

Deposit Received: ${new Date(deposit.deposit_received_date).toLocaleDateString('en-GB')}
Protection Deadline: ${new Date(deposit.protection_deadline).toLocaleDateString('en-GB')}
Prescribed Information Deadline: ${new Date(deposit.prescribed_info_deadline).toLocaleDateString('en-GB')}

This information is provided in accordance with The Housing Act 2004 (Prescribed Information)
Regulations 2007.

Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}
`;
}

/**
 * Get alert message for landlord
 */
export function getComplianceAlert(deposit) {
  const daysUntil = daysUntilDeadline(deposit.protection_deadline);

  if (daysUntil < 0) {
    return {
      type: 'CRITICAL',
      message: `🚨 CRITICAL: Deposit for ${deposit.tenant_name} at ${deposit.property_address} is ${Math.abs(daysUntil)} days OVERDUE for protection. Legal liability applies.`,
      action: 'Protect immediately and provide prescribed information'
    };
  }

  if (!deposit.protection_date) {
    if (daysUntil <= 7) {
      return {
        type: 'URGENT',
        message: `⚠️ URGENT: Deposit protection deadline in ${daysUntil} days for ${deposit.tenant_name}`,
        action: 'Register deposit with scheme immediately'
      };
    }
    if (daysUntil <= 14) {
      return {
        type: 'WARNING',
        message: `⏰ Deposit protection deadline in ${daysUntil} days for ${deposit.tenant_name}`,
        action: 'Register deposit with scheme'
      };
    }
  }

  if (!deposit.prescribed_info_sent) {
    if (daysUntil <= 7) {
      return {
        type: 'URGENT',
        message: `⚠️ URGENT: Prescribed information deadline in ${daysUntil} days for ${deposit.tenant_name}`,
        action: 'Send prescribed information to tenant'
      };
    }
    if (daysUntil <= 14) {
      return {
        type: 'WARNING',
        message: `⏰ Prescribed information deadline in ${daysUntil} days for ${deposit.tenant_name}`,
        action: 'Send prescribed information to tenant'
      };
    }
  }

  if (deposit.protection_date && deposit.prescribed_info_sent) {
    return {
      type: 'OK',
      message: `✅ Compliant: Deposit protected and prescribed information provided`,
      action: null
    };
  }

  return null;
}