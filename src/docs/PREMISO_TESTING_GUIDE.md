# Premiso Pre-Release Testing Guide

## Overview
This comprehensive testing guide covers all user journeys, feature interactions, edge cases, and code quality checks for Premiso. Execute each section systematically and report findings for immediate remediation.

---

## Section 1: Authentication & Onboarding Flow

### Test Case 1.1: User Registration
- [ ] Sign up with valid email → verify confirmation email arrives
- [ ] Sign up with invalid email format → verify error message
- [ ] Sign up with existing email → verify "already registered" error
- [ ] Sign up with weak password → verify strength validation
- [ ] Complete onboarding wizard → verify all steps progress correctly
- [ ] Skip optional steps → verify form still submits
- [ ] Return to incomplete onboarding → verify data persists
- [ ] Access app before completing onboarding → verify gate/redirect

### Test Case 1.2: Login & Session
- [ ] Login with correct credentials → verify redirect to dashboard
- [ ] Login with incorrect password → verify error, attempt counter
- [ ] Login with unverified email → verify verification requirement
- [ ] Session timeout after inactivity → verify redirect to login
- [ ] Browser back button after logout → verify no access
- [ ] Multiple simultaneous logins → verify single session or conflict handling
- [ ] Remember me functionality → verify persistence

---

## Section 2: Property Management

### Test Case 2.1: Add Property
- [ ] Add property with all required fields → verify success, display on dashboard
- [ ] Add property with missing address → verify validation error
- [ ] Add property with invalid postcode → verify format validation
- [ ] Add duplicate property address → verify conflict handling
- [ ] Add property with special characters in name → verify encoding
- [ ] Upload property documents → verify file size limit (10MB), type validation
- [ ] Cancel mid-form → verify data loss warning
- [ ] Bulk import properties from CSV → verify validation, error reporting

### Test Case 2.2: Property Display & Filtering
- [ ] View property list → verify sorting (default, A-Z, newest)
- [ ] Filter by property type → verify results accuracy
- [ ] Search property by address → verify case-insensitive, partial match
- [ ] View property detail page → verify all fields display correctly
- [ ] Edit property details → verify changes persist, audit trail created
- [ ] Delete property → verify soft delete, recovery option, cascade handling
- [ ] Pagination on property list → verify page navigation, item count
- [ ] Empty state (no properties) → verify helpful message, CTA to add

---

## Section 3: Tenant Management

### Test Case 3.1: Add Tenant
- [ ] Add tenant to property → verify required fields enforced
- [ ] Add tenant with invalid email → verify email validation
- [ ] Add tenant with duplicate email → verify conflict handling
- [ ] Set tenancy dates (start before end) → verify date logic
- [ ] Set future tenancy start date → verify lease not yet active
- [ ] Add tenant without lease end date → verify open-ended tenancy support
- [ ] Upload tenant documents → verify file handling
- [ ] Pre-fill tenant from contact form → verify data mapping

### Test Case 3.2: Tenant Portal Access
- [ ] Generate tenant invite link → verify link works once, expires appropriately
- [ ] Tenant accepts invite → verify account created, permissions set
- [ ] Tenant views rent status → verify accuracy vs backend
- [ ] Tenant reports maintenance → verify form submits, ticket created
- [ ] Tenant uploads document → verify file size, type, virus scan
- [ ] Tenant views notifications → verify email + portal sync
- [ ] Inactive tenant access → verify no access after tenancy ends
- [ ] Multi-tenant per property → verify isolation, correct data display

---

## Section 4: Rent Management & Payments

### Test Case 4.1: Rent Entry & Tracking
- [ ] Record rent payment (paid, on-time) → verify status updated, dashboard reflects
- [ ] Record partial payment → verify balance calculation
- [ ] Record late payment → verify days-overdue calculation
- [ ] Mark payment as missed → verify alert generation
- [ ] Edit payment record → verify audit trail, reason tracked
- [ ] Bulk import payments from CSV/bank → verify validation, conflict resolution
- [ ] View payment history by tenant → verify chronological order, filtering
- [ ] View payment history by property → verify aggregation accuracy

### Test Case 4.2: Automated Rent Reminders
- [ ] Pre-rent reminder (3 days before) → verify email sent, content correct
- [ ] Late payment email (3 days overdue) → verify sent automatically
- [ ] Multiple reminders (7, 14 days late) → verify escalation, no spam
- [ ] Tenant marks payment as made → verify reminder stops
- [ ] Payment received after reminder sent → verify email log accurate
- [ ] Customize reminder template → verify changes apply to new emails
- [ ] Unsubscribe from reminders → verify tenant preference honored
- [ ] SMS reminders (if enabled) → verify SMS sent, content brief

---

## Section 5: Maintenance Management

### Test Case 5.1: Tenant-Reported Issues
- [ ] Report maintenance issue with all fields → verify ticket created, number assigned
- [ ] Report with photo → verify image upload, size limit, format support
- [ ] Report with missing description → verify validation error
- [ ] Select priority → verify label assigned, SLA calculated
- [ ] Select category → verify correct categorization
- [ ] Report duplicate issue same day → verify allow or flag
- [ ] Tenant receives confirmation → verify email + portal notification
- [ ] View issue in tenant portal → verify limited data (no cost, contractor details)

### Test Case 5.2: Landlord Ticket Management
- [ ] View all pending tickets → verify status filter works
- [ ] Sort tickets by priority → verify emergency, high, medium, low order
- [ ] Sort tickets by age → verify oldest first
- [ ] Acknowledge ticket → verify tenant notified, status changes
- [ ] Update ticket status → verify progression (pending → in progress → completed)
- [ ] Add internal notes → verify not visible to tenant
- [ ] Assign to contractor → verify contractor notified, work order created
- [ ] View SLA status → verify color coding (on-track, urgent, overdue)

### Test Case 5.3: Work Orders
- [ ] Create work order from ticket → verify all ticket data pre-populated
- [ ] Enter contractor details → verify required fields, contact validation
- [ ] Set scheduled dates → verify start <= end date logic
- [ ] Estimate cost → verify number validation, currency symbol
- [ ] Add access instructions → verify text formatting, security
- [ ] Send to contractor → verify email delivery, portal link valid
- [ ] Contractor uploads photos → verify image storage, security
- [ ] Mark work complete → verify status, tenant notified
- [ ] Upload invoice → verify file type, size limit
- [ ] Track payment status → verify pending → invoiced → paid flow

---

## Section 6: Document Management

### Test Case 6.1: Upload Documents
- [ ] Upload Gas Safety Certificate → verify type detected, date extracted
- [ ] Upload EPC → verify expiration date captured, renewal alert set
- [ ] Upload EICR → verify document stored, date tracked
- [ ] Upload insurance → verify policy number optional
- [ ] Upload custom document → verify categorization
- [ ] File size limit → verify rejection of >10MB
- [ ] Invalid file type → verify rejection with helpful error
- [ ] Duplicate upload → verify version control or overwrite confirmation
- [ ] Concurrent uploads → verify queuing, no data loss

### Test Case 6.2: Document Expiration & Renewal
- [ ] Document with expiration date → verify deadline calculated
- [ ] 30 days before expiry → verify reminder sent
- [ ] Document expires → verify status changes to "expired", alert escalates
- [ ] Renewal alert → verify email + portal notification
- [ ] Upload renewal → verify old version archived, new version active
- [ ] Download document → verify file integrity
- [ ] Bulk document renewal workflow → verify batch operations

---

## Section 7: Email Templates & Automation

### Test Case 7.1: Template Management
- [ ] Edit rent reminder template → verify placeholders work
- [ ] Test placeholder: {{tenant_name}} → verify substituted correctly
- [ ] Test placeholder: {{property_address}} → verify substituted correctly
- [ ] Test placeholder: {{rent_amount}} → verify currency formatting
- [ ] Save template changes → verify applied to future emails only
- [ ] Create custom template → verify categories available
- [ ] Delete template → verify not used by active automations
- [ ] Duplicate template → verify copy created with unique name
- [ ] Preview email → verify HTML rendering, responsive design

### Test Case 7.2: Automation Execution
- [ ] Trigger rent reminder → verify email sent immediately
- [ ] Scheduled automation → verify runs at correct time
- [ ] Conditional automation → verify only sends when condition met
- [ ] Email log shows all sends → verify timestamp, status, delivery
- [ ] Bounce handling → verify bounced emails tracked
- [ ] Retry failed sends → verify automatic retry mechanism
- [ ] Unsubscribe link → verify tenant can opt out
- [ ] Email from address → verify correct sender, reply-to valid

---

## Section 8: Compliance & Deadlines

### Test Case 8.1: Compliance Dashboard
- [ ] View all deadlines → verify grouped by urgency
- [ ] Deadline approaching → verify color coding (green, yellow, red)
- [ ] Click deadline → verify details displayed
- [ ] Mark completed → verify removed from pending
- [ ] Deadline passes → verify escalation alert
- [ ] Document expiry → verify linked to deadline
- [ ] Generate compliance report → verify PDF/CSV export works
- [ ] Compliance status by property → verify aggregation

### Test Case 8.2: Deposit Protection
- [ ] Record deposit received → verify deadline calculated (30 days)
- [ ] Register with scheme → verify protection_date set
- [ ] Prescribed info not sent → verify flag/reminder
- [ ] Send prescribed information → verify email template correct, tenant receives
- [ ] 14 days before deadline → verify alert sent to landlord
- [ ] 7 days before deadline → verify urgent reminder
- [ ] Deadline passes without protection → verify critical alert, legal warning
- [ ] View all deposits → verify compliance status shown

---

## Section 9: Financial Insights

### Test Case 9.1: Income Aggregation
- [ ] Total rental income → verify sum correct across all properties
- [ ] Income by property → verify filtered accurately
- [ ] Income by month → verify grouped by payment date
- [ ] Income vs expected → verify collection rate calculated
- [ ] Filter by date range → verify results updated
- [ ] Export income report → verify CSV/PDF format correct

### Test Case 9.2: Overdue Tracking
- [ ] Overdue rent displayed → verify by property, by tenant
- [ ] Days overdue calculated → verify accuracy
- [ ] Overdue alert sent → verify escalation at 7, 14 days
- [ ] Overdue resolve → verify removed from alert list
- [ ] Partial payment handling → verify balance recalculated

### Test Case 9.3: Maintenance Visualization
- [ ] Monthly income vs maintenance chart → verify data accuracy
- [ ] Trend line → verify shows direction
- [ ] Maintenance by category → verify breakdown
- [ ] High-cost properties flagged → verify highlighted
- [ ] ROI calculation → verify formula correct, negative cases handled

---

## Section 10: User Experience & Performance

### Test Case 10.1: Responsive Design
- [ ] Desktop view (1920px) → verify layout, no overflow
- [ ] Tablet view (768px) → verify responsive, readable
- [ ] Mobile view (375px) → verify touch-friendly, no horizontal scroll
- [ ] Portrait orientation → verify readability
- [ ] Landscape orientation → verify full use of space
- [ ] Test on actual devices → verify rendering, touch targets

### Test Case 10.2: Performance
- [ ] Page load time < 2s → verify acceptable
- [ ] Dashboard with 100+ properties → verify no lag
- [ ] List with 1000+ rent records → verify pagination, filtering fast
- [ ] Chart rendering → verify smooth, no jank
- [ ] Image upload → verify progress indicator, success feedback
- [ ] Concurrent API calls → verify no race conditions

### Test Case 10.3: Accessibility
- [ ] Keyboard navigation → verify Tab, Enter, Escape work
- [ ] Screen reader → verify labels, alt text present
- [ ] Color contrast → verify WCAG AA minimum
- [ ] Font size → verify readable on zoom
- [ ] Error messages → verify clear, helpful, accessible
- [ ] Form labels → verify associated with inputs

---

## Section 11: Data Integrity & Security

### Test Case 11.1: Data Validation
- [ ] Negative rent amount → verify rejected
- [ ] Future date as payment date → verify rejected or flagged
- [ ] Special characters in property name → verify encoded, no injection
- [ ] Long text fields → verify max length enforced
- [ ] Email format → verify RFC 5322 compliant
- [ ] Phone number → verify international format supported
- [ ] Currency values → verify decimal precision (2 places)

### Test Case 11.2: Audit Trail
- [ ] Create property → verify audit entry created, user + timestamp
- [ ] Edit tenant → verify old and new values logged
- [ ] Delete document → verify soft delete, recoverable
- [ ] Export audit → verify complete history downloadable
- [ ] Audit immutable → verify cannot be edited/deleted
- [ ] Sensitive data → verify not logged (passwords, payment details)

### Test Case 11.3: Error Handling
- [ ] Network error during form submit → verify error shown, data saved locally
- [ ] Server returns 500 → verify graceful error message, not technical details
- [ ] Invalid response from API → verify fallback, retry available
- [ ] Rate limiting → verify user notified, not error loop
- [ ] Database connection lost → verify queued operations resume
- [ ] Email delivery failure → verify retry, manual resend option

---

## Section 12: Edge Cases & Boundary Conditions

### Test Case 12.1: Boundary Values
- [ ] Rent amount = £0 → verify allowed or rejected per business logic
- [ ] Rent amount = £99,999.99 → verify stored correctly, displays correctly
- [ ] Property with 0 tenants → verify not error
- [ ] Tenant with 0 payments → verify summary shows "N/A" not error
- [ ] Deadline = today → verify status "due today", alert sent
- [ ] Deadline = yesterday → verify status "overdue", critical alert

### Test Case 12.2: Concurrent Operations
- [ ] Two users edit same property → verify last-write-wins or conflict warning
- [ ] User A records payment while User B views tenant → verify eventual consistency
- [ ] Tenant reports issue while landlord marks issue resolved → verify no orphaning
- [ ] Multiple file uploads → verify queuing, progress accurate

### Test Case 12.3: Data Cleanup
- [ ] Delete property with tenants → verify cascade delete or prevent
- [ ] Delete tenant with active tenancy → verify prevent or warning
- [ ] Archive old payment → verify still queryable for reports
- [ ] Purge old maintenance tickets → verify retain for compliance

---

## Section 13: Cross-Browser & Cross-Device

### Test Case 13.1: Browsers
- [ ] Chrome (latest) → verify full functionality
- [ ] Safari (latest) → verify CSS rendering, form inputs
- [ ] Firefox (latest) → verify console no errors
- [ ] Edge (latest) → verify compatibility
- [ ] Mobile Safari (iOS) → verify input modals, video playback
- [ ] Chrome Mobile (Android) → verify touch interactions

### Test Case 13.2: Network Conditions
- [ ] 4G connection → verify loads, interactive
- [ ] 3G connection → verify acceptable delays, no timeout
- [ ] Offline mode → verify graceful degradation or offline message
- [ ] High latency (2s delay) → verify no double-submit, loading states

---

## Section 14: Code Quality Review

### Review Checklist
- [ ] **Imports**: All imports present, no circular dependencies
- [ ] **Unused Code**: No dead code, commented-out blocks removed
- [ ] **Error Handling**: Try-catch blocks, null checks, validation
- [ ] **Performance**: No N+1 queries, efficient loops, memoization
- [ ] **Security**: No hardcoded secrets, no direct DB queries, SQL injection prevention
- [ ] **Naming**: Variables/functions clear, consistent, English
- [ ] **Comments**: Complex logic explained, no obvious redundancy
- [ ] **DRY**: No code duplication, reusable components/utilities
- [ ] **Testing**: Edge cases handled, boundary conditions tested
- [ ] **Accessibility**: ARIA labels, semantic HTML, keyboard nav
- [ ] **Responsive**: Mobile-first, CSS breakpoints correct
- [ ] **Performance**: Bundle size reasonable, lazy loading where needed
- [ ] **TypeScript**: No `any` types, proper interfaces defined
- [ ] **React**: Proper hooks, no memory leaks, key prop on lists
- [ ] **State Management**: Single source of truth, no prop drilling

---

## Section 15: Regression Testing

After each fix, re-test:
- [ ] Feature that was fixed
- [ ] Features dependent on that feature
- [ ] Related features (e.g., if rent reminder broke, test all email features)
- [ ] Dashboard summaries that depend on the data
- [ ] All automated reports using that data

---

## Issue Reporting Template

When you find an issue, report it as:

```
**Title**: [Feature] - [Brief Description]
**Severity**: Critical | High | Medium | Low
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 

**Actual Result**: 

**Environment**: 
- Browser/Device: 
- OS: 
- Screen Size: 

**Screenshots**: [Attach if visual issue]
**Code Reference**: [File/Line if known]
```

---

## Testing Sign-Off

- [ ] All test cases executed
- [ ] No critical or high issues remaining
- [ ] All issues documented
- [ ] Fixes validated with regression testing
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Accessibility compliant
- [ ] Cross-browser verified
- [ ] Code quality acceptable

**Date Tested**: ___________
**Tester Name**: ___________
**Status**: ☐ Ready for Release | ☐ Issues Remaining

---

*Last updated: May 2026*