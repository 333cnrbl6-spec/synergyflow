# Premiso Code Quality & Security Review

## Pre-Release Code Audit Checklist

This document provides systematic code review guidelines to identify bugs, performance issues, security vulnerabilities, and architectural weaknesses.

---

## 1. Frontend Components Review

### 1.1 MaintenanceReportForm.jsx
**File**: `components/MaintenanceReportForm.jsx`

```
Review Checklist:
☐ Image upload: Verify file size check is enforced (currently checks 5MB)
☐ Category/Priority: Verify all options available, no missing values
☐ Form submission: Check for duplicate submissions on rapid clicks
☐ Error handling: Verify all mutation errors caught and displayed
☐ Placeholders: Verify working for all fields (property, tenant needed)
☐ Preview: Verify form data can be reviewed before submission
☐ Empty state: Handle tenant/property not found gracefully
☐ Mobile: Verify textarea and inputs are touch-friendly
```

**Potential Issues to Check**:
1. Image upload progress indicator missing - user may not know upload is happening
2. No confirmation before submitting if user types long description
3. File type validation only checks MIME type, could allow malicious files
4. Category icons may not render on all browsers
5. No support for multiple images (user may want to show different angles)

**Recommended Fixes**:
- Add upload progress percentage
- Add "preview before submit" step for validation
- Validate file signatures in addition to MIME type
- Consider limiting to 1 image or multiple images
- Add file size warning before selecting

---

### 1.2 MaintenanceDashboard.jsx
**File**: `components/MaintenanceDashboard.jsx`

```
Review Checklist:
☐ Status dropdown: Verify all transitions logical (can't go from completed → pending)
☐ Work order form: Check required fields enforced in modal
☐ Search: Verify searches both ticket number and title
☐ Filter: Verify filter combinations work (status AND priority)
☐ Sorting: Check default sort order (newest first, oldest first?)
☐ Modal: Verify modal closes on background click only if unsaved data warning shown
☐ Pagination: Check if needed for large ticket lists
☐ Re-render: Verify mutations trigger list refresh correctly
```

**Potential Issues to Check**:
1. Status dropdown allows invalid transitions (e.g., completed → pending)
2. Work order form doesn't validate contractor email format
3. Search is case-sensitive for ticket numbers
4. Estimated cost field accepts negative numbers
5. Modal can be closed without saving, losing entered data

**Recommended Fixes**:
- Restrict status transitions to valid flows
- Add email validation to contractor field
- Make search case-insensitive and handle partial matches
- Add min/max validation for cost (≥0)
- Add unsaved changes warning before modal close

---

### 1.3 DepositProtectionManager.jsx
**File**: `components/DepositProtectionManager.jsx`

```
Review Checklist:
☐ Deposit recording: Verify all fields required
☐ Scheme selection: Verify radio/select updates data
☐ Dates: Check start date <= end date validation
☐ Email sending: Verify email actually sent, not just simulated
☐ Prescribed info: Check HTML generation escapes special characters
☐ Tenant email: Verify email format before sending
☐ Modal: Check scrollable if content exceeds viewport height
☐ Accessibility: Verify form labels associated with inputs
```

**Potential Issues to Check**:
1. Prescribed information generation doesn't escape HTML in tenant name (XSS vulnerability)
2. Tenant email not validated before sending prescribed info
3. Protection date can be before deposit received date
4. No confirmation before sending prescribed information
5. Modal content not scrollable on small screens
6. Form doesn't show loading state while sending email

**Recommended Fixes**:
- HTML escape all user-supplied data in prescribed info
- Add email validation before SendEmail call
- Add date validation (protection_date >= deposit_received_date)
- Add confirmation modal before sending
- Add overflow-y-auto to modal content
- Add loading state with button disabled during email send

---

### 1.4 FinancialInsightsDashboard.jsx
**File**: `components/FinancialInsightsDashboard.jsx`

```
Review Checklist:
☐ Data loading: Verify error state properly displayed
☐ Charts: Check responsive on mobile (recharts should handle)
☐ Numbers: Verify currency formatting with commas
☐ Collection rate: Check calculation (0-100%), handling zero expected rent
☐ ROI: Verify handling negative profit correctly
☐ Overdue: Check aggregation accuracy per property
☐ Empty state: Verify helpful message when no data
☐ Performance: Check if large dataset (1000+ records) causes slowness
```

**Potential Issues to Check**:
1. Collection rate could divide by zero (if total_expected = 0)
2. ROI calculation shows as percentage but may confuse (positive vs negative)
3. Overdue rent calculation doesn't account for partial payments
4. Chart may not update if data refreshed manually
5. No indication of data freshness (last updated timestamp)
6. Export functionality mentioned but not implemented
7. Large datasets may cause chart rendering lag

**Recommended Fixes**:
- Add guard for zero division in collection rate: `total_expected > 0 ? ... : "N/A"`
- Add "Maintenance Breakdown by Category" placeholder with sample data
- Display data refresh timestamp
- Add debounce to refresh button (prevent rapid clicks)
- Consider pagination for property table if >50 properties
- Implement actual export functionality

---

## 2. Backend Functions Review

### 2.1 sendRentRemindersAndFollowups.js
**File**: `functions/sendRentRemindersAndFollowups.js`

```
Review Checklist:
☐ Date calculations: Verify rent due date logic correct
☐ Rent overdue logic: Check 3/7/14 day windows correct
☐ Email sending: Verify batch sending handles failures gracefully
☐ Template validation: Check placeholders exist before substitution
☐ Tenant filtering: Verify only active tenants get reminders
☐ Duplicates: Check multiple reminders not sent same day
☐ Scheduling: Verify runs once daily, not multiple times
☐ Error recovery: Check failed emails logged and can be retried
```

**Potential Issues to Check**:
1. Date calculation assumes 30-day months, may miss end-of-month rent
2. No deduplication - same tenant could get multiple reminders if function runs twice
3. Placeholder replacement is simple string replacement, breaks if placeholder appears in text
4. No check if tenant email is valid before sending
5. No rate limiting on email sending to avoid spam triggers
6. Return value doesn't indicate which emails failed vs succeeded clearly
7. No transaction - if halfway through sending, inconsistent state

**Recommended Fixes**:
- Add check: prevent sending if reminder already sent today (via email log)
- Add email validation before SendEmail call
- Use more robust template substitution (e.g., regex or templating library)
- Add rate limiting or batching with delays
- Return detailed array of send results (success/failure per tenant)
- Add idempotency key to prevent duplicate runs

---

### 2.2 checkDepositCompliance.js
**File**: `functions/checkDepositCompliance.js`

```
Review Checklist:
☐ Deadline calculation: Verify 30-day window correct
☐ Status transitions: Check logic for moving between statuses
☐ Alert deduplication: Verify same alert not sent twice
☐ Date math: Check timezone handling for date comparisons
☐ Alert thresholds: Verify 14, 7 day alerts sent at correct times
☐ Error handling: Check individual deposit errors don't stop other checks
☐ Compliance status: Verify all combinations of protection/prescribed info handled
☐ Email generation: Check HTML is valid, no broken links
```

**Potential Issues to Check**:
1. Date comparison assumes same timezone, may off by a day depending on server TZ
2. Alert deduplication checks alert_history, but what if field is null? (Null error)
3. Status logic doesn't handle case where both protection and prescribed info overdue
4. Email template references schemes but scheme may be null if not yet set
5. No check if tenant email is valid before sending
6. Early returns in checkAlertCondition could miss alert types
7. buildAlertEmail doesn't sanitize property_address for HTML

**Recommended Fixes**:
- Use UTC consistently for all date calculations
- Check alert_history exists before accessing: `(deposit.compliance_alerts_sent || []).some(...)`
- Define explicit status flow with all valid combinations
- Add email validation before SendEmail
- HTML escape all user data in email template
- Return more detailed compliance check results

---

### 2.3 generateFinancialInsights.js
**File**: `functions/generateFinancialInsights.js`

```
Review Checklist:
☐ Data filtering: Verify only paid/pending payments included in correct calculations
☐ Collection rate: Check zero division handled (zero expected rent)
☐ ROI: Verify formula correct, handles negative profit
☐ Overdue: Check only includes overdue, not pending
☐ Monthly trends: Verify monthly aggregation correct (group by YYYY-MM)
☐ Performance: Check if 1000+ records causes timeout (30s limit)
☐ Sorting: Verify monthly trends sorted chronologically
☐ Null checks: Verify all optional fields checked before arithmetic
```

**Potential Issues to Check**:
1. Collection rate divides by zero if total_expected = 0
2. Overdue calculation includes pending from past due date, but pending != overdue
3. Monthly trends could be slow if calculating for 1000+ transactions
4. ROI calculation doesn't account for negative income (partial write-offs)
5. No null checks on actual_cost field before adding
6. Hardcoded 12-month lookback may miss older data

**Recommended Fixes**:
- Add guards for zero division throughout
- Distinguish between "pending" and "overdue" (pending = not due yet, overdue = past due)
- Add indexes on date fields if using real database
- Clarify ROI formula in comments (e.g., is it gross or net?)
- Add null coalescing for optional numeric fields
- Consider caching results for large datasets

---

## 3. Entity Schemas Review

### 3.1 MaintenanceTicket.json
**File**: `entities/MaintenanceTicket.json`

```
Review Checklist:
☐ Status values: Verify all statuses are valid (no typos)
☐ Priority values: Check priorities exhaustive (low, medium, high, emergency)
☐ Categories: Verify all categories defined and used consistently
☐ Dates: Check reported_date vs completed_date logic
☐ Cost fields: Verify both estimated and actual present
☐ Tenant data: Check redundant (also in relationship) but needed for queries
☐ Audit fields: Verify created_date, updated_date present
```

**Potential Issues**:
1. No validation that completed_date >= reported_date
2. Estimated cost can be null, but actual cost also null (could be confusing)
3. Image URL field assumes uploaded image, but user might skip
4. Tenant phone optional, but useful for urgent issues
5. No priority field on work order - inherited from ticket?

**Recommended Fixes**:
- Add note that dates should be validated in code
- Add estimated_cost min value of 0
- Mark image_url as optional with note
- Consider requiring tenant_phone
- Define clear relationship between MaintenanceTicket.priority and WorkOrder.priority

---

### 3.2 DepositProtection.json
**File**: `entities/DepositProtection.json`

```
Review Checklist:
☐ Status values: Verify compliant/at_risk/overdue/non_compliant make sense
☐ Dates: Check all deadline dates calculated correctly
☐ Scheme: Verify enum matches available schemes
☐ Alerts: Verify alert_type values match those sent in function
☐ Tenure: Check fields cover all lifecycle (receipt → return/deduction)
```

**Potential Issues**:
1. protection_reference required field but null initially - should be optional
2. Status "non_compliant" and "overdue" seem redundant (overdue IS non-compliant)
3. No field for extension/dispute process
4. prescribed_info_deadline always same as protection_deadline (by design?)

**Recommended Fixes**:
- Make protection_reference optional initially, required only after protection
- Clarify status semantics: "at_risk" (≤14 days), "non_compliant" (7-0 days), "overdue" (<0 days)
- Add dispute/extension status if applicable
- Add note that prescribed info deadline = protection deadline per regulations

---

### 3.3 RentPayment.json
**File**: `entities/RentPayment.json`

```
Review Checklist:
☐ Status values: Verify all statuses (pending/paid/overdue/partial/missed)
☐ Amounts: Check rent_amount vs payment_received handling
☐ Dates: Verify due_date and payment_date logic
☐ Payment method: Verify all methods covered
☐ Required fields: Check essentials present for calculations
```

**Potential Issues**:
1. Status "pending" ambiguous - paid but pending delivery? Pending to be paid?
2. days_overdue computed field - should be calculated in code, not stored?
3. No indication if rent is recurring vs one-time
4. No adjustment reason field (if rent changed mid-tenancy)

**Recommended Fixes**:
- Clarify status: "pending" = awaiting payment (before due date), "overdue" = past due date
- Mark days_overdue as computed, calculate in code, don't store
- Add recurring field to indicate if monthly, weekly, etc.
- Add adjustment_amount and adjustment_reason fields if needed

---

## 4. Security Review

### 4.1 Authentication & Authorization
```
Review Checklist:
☐ User email verified before granting access
☐ Token expiration set (not infinite)
☐ No sensitive data in logs (passwords, tokens)
☐ CORS properly configured (not * for all origins)
☐ Rate limiting on login attempts
☐ Session fixation prevention
```

**Vulnerabilities to Check**:
1. Are passwords hashed with strong algorithm (bcrypt, argon2)?
2. Is 2FA available for accounts?
3. Are API endpoints requiring authentication?
4. Are permission checks on entity read/write operations?

---

### 4.2 Data Handling
```
Review Checklist:
☐ User input validated before database (no SQL injection)
☐ File uploads scanned for malware
☐ File names sanitized (no path traversal)
☐ Output escaping to prevent XSS
☐ Secrets not hardcoded (use env vars)
☐ API responses don't leak sensitive data
```

**Vulnerabilities to Check**:
1. DepositProtectionManager.jsx generates HTML - is it escaped?
2. Email templates - are user data escaped in HTML?
3. File uploads - are names sanitized?
4. Are any API keys or secrets visible in code?

---

### 4.3 Infrastructure
```
Review Checklist:
☐ Database encryption (at rest)
☐ HTTPS enforced (not HTTP)
☐ API keys rotated regularly
☐ Backups encrypted
☐ Audit logs immutable
☐ DDoS protection
```

---

## 5. Performance Review

### 5.1 Database Queries
```
Review Checklist:
☐ List endpoints paginated (not returning all records)
☐ Indexes on frequently filtered columns
☐ No N+1 queries (fetching all then looping to fetch more)
☐ Query results cached where appropriate
☐ Batch operations for bulk inserts/updates
```

---

### 5.2 Frontend Performance
```
Review Checklist:
☐ Images optimized and lazy-loaded
☐ Code splitting implemented for large pages
☐ Unnecessary re-renders eliminated
☐ Bundle size < 500KB (gzipped)
☐ Fonts optimized (system fonts preferred over web fonts)
```

---

## 6. Bug Detection Patterns

### Common Bugs to Search For
1. **Off-by-one errors in date calculations**
   - Rent due on 1st, but checking >= due date (includes next day)
   
2. **Null/undefined access without checks**
   - `deposit.compliance_alerts_sent.some()` if alerts_sent is null
   
3. **Floating point arithmetic**
   - Currency calculations using floats instead of integers
   
4. **Race conditions**
   - Multiple users updating same record simultaneously
   
5. **Logic errors in conditionals**
   - `if (status === 'completed' || 'pending')` evaluates as `if (true)`
   
6. **Async/await issues**
   - Missing await on async function calls
   - Promise errors not caught
   
7. **Array mutations**
   - Directly mutating state arrays instead of creating new arrays
   
8. **CSS specificity issues**
   - Utility classes overridden by component styles

---

## 7. Testing Gaps

### Coverage Analysis
```
For each component, verify:
☐ Happy path (valid input → success)
☐ Validation (invalid input → error)
☐ Edge cases (empty, zero, max values)
☐ Error states (API failure, network error)
☐ Accessibility (keyboard nav, screen reader)
☐ Mobile (responsive, touch interactions)
```

---

## 8. Documentation Review

```
Review Checklist:
☐ Complex logic has comments explaining "why"
☐ Function parameters documented
☐ Return types documented
☐ Assumptions documented (e.g., date timezone)
☐ Known limitations documented
☐ Breaking changes documented in changelog
```

---

## Sign-Off

After completing this code review, if issues found:

1. Log detailed issue with reproduction steps
2. Fix with targeted change (not refactoring unrelated code)
3. Add test case to prevent regression
4. Re-review the fix
5. Regression test related features

---

*Last updated: May 2026*