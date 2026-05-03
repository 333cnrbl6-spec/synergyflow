/**
 * Validation utilities for Premiso
 */

/**
 * Validate email address format (RFC 5322 simplified)
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * HTML escape user input to prevent XSS
 */
export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate numeric currency value (0-999999.99)
 */
export function isValidCurrency(value) {
  if (value === null || value === undefined || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 999999.99;
}

/**
 * Validate date is valid ISO format and is not in future
 */
export function isValidPastDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !isNaN(date.getTime()) && date <= today;
}

/**
 * Validate date range: start <= end
 */
export function isValidDateRange(startStr, endStr) {
  if (!startStr || !endStr) return false;
  const start = new Date(startStr);
  const end = new Date(endStr);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}

/**
 * Validate file size in MB
 */
export function isValidFileSize(fileSizeBytes, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return fileSizeBytes > 0 && fileSizeBytes <= maxBytes;
}

/**
 * Validate allowed MIME types
 */
export function isValidFileType(mimeType, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate phone number format (basic UK)
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  // Accepts various UK formats: 020 xxxx xxxx, +44, etc
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Safe integer division with zero check
 */
export function safeDivide(numerator, denominator, defaultValue = 0) {
  if (!denominator || denominator === 0) return defaultValue;
  return numerator / denominator;
}