/**
 * Maintenance ticketing utilities
 */

export const TICKET_CATEGORIES = {
  plumbing: { label: 'Plumbing', icon: '🚿', color: 'bg-blue-100 text-blue-700' },
  electrical: { label: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  heating: { label: 'Heating/Cooling', icon: '🌡️', color: 'bg-orange-100 text-orange-700' },
  appliance: { label: 'Appliance', icon: '🔧', color: 'bg-gray-100 text-gray-700' },
  structural: { label: 'Structural', icon: '🏗️', color: 'bg-red-100 text-red-700' },
  cleaning: { label: 'Cleaning', icon: '🧹', color: 'bg-green-100 text-green-700' },
  pest_control: { label: 'Pest Control', icon: '🐛', color: 'bg-purple-100 text-purple-700' },
  garden: { label: 'Garden/Outdoor', icon: '🌿', color: 'bg-emerald-100 text-emerald-700' },
  other: { label: 'Other', icon: '📋', color: 'bg-slate-100 text-slate-700' }
};

export const TICKET_PRIORITIES = {
  low: { label: 'Low', color: 'bg-blue-100 text-blue-700', severity: 3 },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', severity: 2 },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700', severity: 1 },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700', severity: 0 }
};

export const TICKET_STATUSES = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: '📝' },
  acknowledged: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-700', icon: '👀' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: '🔨' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '✅' },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: '⏸️' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' }
};

export const WORK_ORDER_STATUSES = {
  issued: { label: 'Issued', color: 'bg-slate-100 text-slate-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  invoiced: { label: 'Invoiced', color: 'bg-purple-100 text-purple-700' },
  paid: { label: 'Paid', color: 'bg-green-500 text-white' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
};

/**
 * Generate unique ticket number
 */
export function generateTicketNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TKT-${year}${month}-${random}`;
}

/**
 * Generate unique work order number
 */
export function generateWorkOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO-${year}${month}-${random}`;
}

/**
 * Get days since ticket reported
 */
export function getDaysSinceReported(reportedDate) {
  const reported = new Date(reportedDate);
  const today = new Date();
  return Math.floor((today - reported) / (1000 * 3600 * 24));
}

/**
 * Calculate SLA status (days remaining)
 */
export function calculateSLAStatus(priority, reportedDate) {
  const daysSince = getDaysSinceReported(reportedDate);
  
  const slaLimits = {
    emergency: 1,
    high: 3,
    medium: 7,
    low: 14
  };

  const limit = slaLimits[priority] || 7;
  const daysRemaining = limit - daysSince;

  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining === 0) return 'due_today';
  if (daysRemaining <= 1) return 'urgent';
  return 'on_track';
}

/**
 * Format SLA status for display
 */
export function formatSLAStatus(status) {
  const labels = {
    overdue: '🔴 Overdue',
    due_today: '⚠️ Due Today',
    urgent: '🟠 Urgent (1 day)',
    on_track: '✅ On Track'
  };
  return labels[status] || 'Unknown';
}

/**
 * Calculate ticket age (for sorting)
 */
export function getTicketAge(reportedDate) {
  return new Date() - new Date(reportedDate);
}