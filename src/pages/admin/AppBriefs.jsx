import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, FileText, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

// ─── IMPLEMENTATION BRIEFS ───────────────────────────────────────────────────

const BRIEFS = [
  {
    id: 'species_explorer',
    name: 'DataWinder (Species Explorer)',
    priority: 1,
    priorityLabel: '🌟 Priority Sale — First',
    color: 'green',
    description: 'Conservation & biodiversity intelligence platform',
    improvements: ['AI Field Reports', 'Smart Search', 'Analytics Dashboard', 'PDF Export', 'Stripe Connect', 'Onboarding Wizard', 'Notifications', 'Compliance Dashboard'],
    instruction: 'Open DataWinder (Species Explorer) in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'premiso',
    name: 'Premiso',
    priority: 2,
    priorityLabel: 'Second',
    color: 'blue',
    description: 'Property portfolio management',
    improvements: ['AI Document Drafting', 'Smart Search', 'Portfolio Analytics', 'PDF Export', 'Stripe Connect', 'Onboarding Wizard', 'Compliance Alerts', 'Compliance Dashboard'],
    instruction: 'Open Premiso in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'charityhub',
    name: 'CharityHub',
    priority: 3,
    priorityLabel: 'Third',
    color: 'orange',
    description: 'Charity operations management',
    improvements: ['AI Grant Assistant', 'Smart Search', 'Impact Analytics', 'PDF Reports', 'Stripe Connect', 'Onboarding Wizard', 'Deadline Alerts', 'Compliance Dashboard'],
    instruction: 'Open CharityHub in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    priority: 4,
    priorityLabel: 'Fourth',
    color: 'purple',
    description: 'AI-assisted legal case documentation',
    improvements: ['Enhanced AI Narratives', 'Smart Case Search', 'Practice Analytics', 'PDF Legal Export', 'Stripe Connect', 'Onboarding Wizard', 'Limitation Alerts', 'Compliance Audit Dashboard'],
    instruction: 'Open CaseNarrative in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
];

const COLOR_STYLES = {
  green:  { header: 'bg-green-900',  badge: 'bg-green-100 text-green-800',  border: 'border-green-300',  btn: 'bg-green-700 hover:bg-green-800' },
  blue:   { header: 'bg-blue-900',   badge: 'bg-blue-100 text-blue-800',    border: 'border-blue-300',   btn: 'bg-blue-700 hover:bg-blue-800' },
  orange: { header: 'bg-orange-900', badge: 'bg-orange-100 text-orange-800', border: 'border-orange-300', btn: 'bg-orange-700 hover:bg-orange-800' },
  purple: { header: 'bg-purple-900', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-300', btn: 'bg-purple-700 hover:bg-purple-800' },
};

const IMPL_BRIEF_CONTENT = {
  species_explorer: `# 🌿 DataWinder (Species Explorer) — Board-Approved Implementation Brief
Drop this into the DataWinder app AI assistant as your FIRST message.
Date: 27 April 2026 | Priority: #1 (First standalone sale candidate)
⚠️ ARCHITECTURE RULE: Build NATIVELY into THIS app only. No shared services. No cross-app API calls. No imports from other portfolio apps. This app must work 100% standalone — independently saleable at any point.

YOU ARE: The AI assistant for DataWinder — a SaaS platform for UK wildlife conservation professionals, zoos, universities, and environmental consultancies.
Brand name: DataWinder. Target customers: UK conservation orgs, zoological societies, Natural England, wildlife trusts, universities.
Pricing: £39/mo Starter | £99/mo Professional | £249/mo Enterprise

⚠️ AVATAR / HELPER BOT RULES (IMPORTANT):
The in-app AI helper bot avatar MUST be a generic, friendly cartoon conservation scientist character — NOT based on any real person, photograph, or specific individual's likeness. Use an illustrated owl, a stylised field researcher silhouette, or a friendly abstract scientist icon. Do NOT use any real person's name, image, or biography as the avatar identity. The persona should be: warm, knowledgeable, field-science focused — but entirely fictional and original.

⚠️ CONTENT / IP RULES (IMPORTANT):
- Do NOT reference specific named researchers, academics, or scientists in the UI, copy, or AI prompts
- Do NOT cite or reproduce specific published research papers, datasets, or methodologies that would require permission
- Use general conservation science best practices as the knowledge base — publicly available IUCN, Natural England, and statutory guidance is fine
- Species conservation status data should reference IUCN Red List categories (publicly available) — not proprietary datasets
- Any sample/demo data must be entirely fictional (invented species names for demos, fictional survey locations)

IMPLEMENT THESE 8 IMPROVEMENTS IN ORDER. Complete and test each before moving to the next.

1. AI FIELD REPORT GENERATION (CRITICAL)
Add "AI Generate Report" button on observation/survey detail pages.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are an experienced wildlife conservation field scientist. Using standard conservation reporting practices (IUCN guidelines, UK BAP methodology), generate a detailed field survey report for: Species: [name], Location: [loc], Date: [date], Observer: [name], Observations: [notes], Habitat type: [habitat]. Include: Executive Summary, Detailed Field Observations, Behavioural Notes, IUCN Conservation Status Assessment, Habitat Condition Notes, Recommended Conservation Actions.", response_json_schema: { type: "object", properties: { executive_summary: {type:"string"}, detailed_observations: {type:"string"}, behavioural_notes: {type:"string"}, conservation_assessment: {type:"string"}, habitat_notes: {type:"string"}, recommended_actions: {type:"array",items:{type:"string"}} } } })
Store the generated report on the entity record. Show a loading spinner during generation.

2. SMART SEARCH & FILTERING (HIGH)
Add a prominent search bar + collapsible filter panel to the species list and observations pages.
Filters: search text (name/notes), conservation_status (all/critically_endangered/endangered/vulnerable/least_concern), habitat_type (all/woodland/wetland/coastal/grassland/urban), survey_date_from/to, observer name.
Show active filter count badge. Include "Clear all filters" button.

3. ANALYTICS DASHBOARD (HIGH)
Add a dedicated Analytics page (or enhance the home dashboard) using recharts.
KPI cards: Total Species Recorded, Surveys This Month, Active Researchers, Species Requiring Urgent Action.
Charts: Species sightings over last 12 months (AreaChart), Species by conservation status (PieChart), Top survey locations (BarChart), Researcher activity (BarChart).

4. PDF SURVEY REPORT EXPORT (HIGH)
Add "Export PDF" button on survey detail and observation detail pages.
Use html2canvas + jsPDF (both already installed): const canvas = await html2canvas(ref.current, {scale:2}); then add to jsPDF A4 with pagination. Include app logo, date, and page numbers.

5. ONBOARDING WIZARD (HIGH)
Show a 3-step wizard to new users who haven't completed onboarding (check user.onboarding_complete).
Step 1: Create your first survey (name, location, date). Step 2: Add your first species observation. Step 3: Invite a team member.
On complete: await base44.auth.updateMe({ onboarding_complete: true }). Dismissable but tracked.

6. SUBSCRIBER STRIPE CONNECT — REVENUE FOR THE ORGANISATION (CRITICAL)
This app is deployed to organisations (wildlife trusts, zoos, consultancies) who charge their OWN end-users or members. Each subscriber organisation connects THEIR OWN Stripe account.
Implement a "Connect Stripe Account" step in the admin/settings area using Stripe Connect (OAuth):
- Show a "Connect your Stripe account" card in Settings for admin users
- Use Stripe Connect OAuth link: https://connect.stripe.com/oauth/authorize?response_type=code&client_id=[PLATFORM_CLIENT_ID]&scope=read_write
- Store the returned stripe_account_id on the organisation/user record
- All payments taken in the app route to the subscriber's connected Stripe account (not the platform)
- Show connection status: Connected (with last 4 of account) or "Not connected — connect Stripe to accept payments"
Feature gating within the app (for the subscriber's own tiers) — let the subscriber configure their own pricing tiers and what features to gate for their end-users. Provide a simple "Pricing Settings" page where the admin can set tier names, prices, and which features are gated.

7. IN-APP NOTIFICATIONS (MEDIUM)
Bell icon in the navbar showing unread count. Notification types: survey deadline approaching (3 days), new observation added by team member, species conservation status changed, approaching species count limit (starter tier).
Mark as read on click. "View all" panel.

8. COMPLIANCE DASHBOARD (HIGH — NEW)
Add a Compliance page showing: Surveys overdue for review, Species not updated in 90+ days, Missing required data fields (location, observer, date), Data quality score per researcher.
This is a key differentiator for institutional buyers (Natural England, wildlife trusts) — they need audit trails.

ARCHITECTURE RULES:
- Every feature built natively in THIS codebase only
- No cross-app imports or shared runtime services
- Test each feature before moving to the next
- Do not break any existing functionality
- This is the #1 priority sale candidate — make it polished, complete, and production-ready

PACKAGES AVAILABLE (already installed — do not npm install anything new): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  premiso: `# 🏠 Premiso — Board-Approved Implementation Brief
Drop this into the Premiso app AI assistant as your FIRST message.
Date: 27 April 2026 | Priority: #2
⚠️ ARCHITECTURE RULE: Build NATIVELY into THIS app only. No shared services. No cross-app API calls. No imports from other portfolio apps. This app must work 100% standalone — independently saleable at any point.

YOU ARE: The AI assistant for Premiso — a SaaS platform for UK property professionals.
Target customers: UK private landlords (2.65M+), letting agencies (15,000+), estate managers, property management companies.
Pricing: £49/mo Starter | £129/mo Professional | £299/mo Enterprise

IMPLEMENT THESE 8 IMPROVEMENTS IN ORDER. Complete and test each before moving to the next.

1. AI DOCUMENT INTELLIGENCE (CRITICAL)
Add "AI Draft" button on tenancy agreements, inspection reports, section 21/8 notices, and rent review letters.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are a UK property law expert. Generate a professional [document_type] for: Property: [address], Landlord: [name], Tenant: [name], Tenancy start: [date], Rent: £[amount]/month, Deposit: £[amount]. Include all UK housing law obligations (Housing Act 1988, Deregulation Act 2015, Tenant Fees Act 2019). Flag any compliance requirements.", response_json_schema: { type:"object", properties: { document_title:{type:"string"}, document_body:{type:"string"}, key_clauses:{type:"array",items:{type:"string"}}, compliance_notes:{type:"string"}, legal_warnings:{type:"array",items:{type:"string"}} } } })
Show a loading spinner. Store the generated document on the record.

2. SMART SEARCH & FILTERING (HIGH)
Add search + filter panel to properties, tenancies, and maintenance pages.
Filters: search text, property_status (occupied/vacant/maintenance), rent_status (current/overdue/partial), postcode_area, tenancy_expiring_within (30/60/90 days), property_type (flat/house/HMO/commercial).
Show result count. Active filter badges. Clear all button.

3. PORTFOLIO ANALYTICS DASHBOARD (HIGH)
Dedicated Analytics page using recharts.
KPI cards: Total Portfolio Value (£), Rent Collection Rate (%), Vacant Units, Open Maintenance Jobs, Tenancies Expiring in 90 Days.
Charts: Rent collection by month (BarChart), Occupancy rate trend (LineChart), Maintenance by category (PieChart), Yield by property (horizontal BarChart).

4. PDF DOCUMENT EXPORT (HIGH)
Export: tenancy agreement, inspection report, rent statement, deposit protection certificate, section notice.
Use html2canvas + jsPDF (already installed). Include Premiso branding, property address header, date, page numbers.

5. ONBOARDING WIZARD (HIGH)
3-step wizard for new users (check user.onboarding_complete).
Step 1: Add your first property (address, type, purchase price, rental value). Step 2: Add your first tenant (name, email, tenancy dates, rent amount). Step 3: Set your rent collection day and late payment threshold.
On complete: await base44.auth.updateMe({ onboarding_complete: true })

6. SUBSCRIBER STRIPE CONNECT — REVENUE FOR THE ORGANISATION (CRITICAL)
This app is deployed to property businesses (letting agents, landlords, estate managers) who charge their OWN clients or tenants. Each subscriber organisation connects THEIR OWN Stripe account.
Implement a "Connect Stripe Account" step in the admin/settings area using Stripe Connect (OAuth):
- Show a "Connect your Stripe account" card in Settings for admin users
- Use Stripe Connect OAuth link to connect their account
- Store the returned stripe_account_id on the organisation/user record
- All payments (rent collection, fees, deposits) taken in the app route to the subscriber's connected Stripe account
- Show connection status with clear "Connected" / "Not connected" indicator
- Provide a "Rent Collection" feature that uses the connected Stripe account to request rent payments from tenants via payment link or direct charge
Feature gating: Let the admin configure which features their team members can access. Provide a simple "Plan Settings" page in admin.

7. SMART COMPLIANCE ALERTS (MEDIUM)
Alert types: rent overdue (day 1, 7, 14), tenancy expiring in 90/60/30/14 days, gas safety certificate expiring, EPC expiring, HMO licence renewal due, right-to-rent check due, deposit not protected within 30 days.
Bell icon in navbar with unread count. Panel with dismiss/action buttons.

8. PROPERTY COMPLIANCE DASHBOARD (HIGH — NEW)
Dedicated Compliance page: Properties missing gas safety cert, Properties with expired EPC (below E rating), Tenancies without protected deposits, Upcoming HMO licence renewals.
Red/amber/green status. One-click "Mark as resolved". This is table-stakes for letting agents managing multiple properties and a strong Professional tier differentiator.

ARCHITECTURE RULES:
- Every feature built natively in THIS codebase only
- No cross-app imports or shared runtime services
- Test each feature before moving to the next
- Do not break any existing functionality

PACKAGES AVAILABLE (already installed): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  charityhub: `# 💛 CharityHub — Board-Approved Implementation Brief
Drop this into the CharityHub app AI assistant as your FIRST message.
Date: 27 April 2026 | Priority: #3
⚠️ ARCHITECTURE RULE: Build NATIVELY into THIS app only. No shared services. No cross-app API calls. No imports from other portfolio apps. This app must work 100% standalone — independently saleable at any point.

YOU ARE: The AI assistant for CharityHub — a SaaS platform for UK charities and third-sector organisations.
Target customers: 168,000 registered charities in England & Wales, CICs, voluntary organisations, grant-making foundations.
Pricing: £29/mo Starter | £79/mo Professional | £199/mo Enterprise

IMPLEMENT THESE 8 IMPROVEMENTS IN ORDER. Complete and test each before moving to the next.

1. AI GRANT APPLICATION & COMMUNICATIONS ASSISTANT (CRITICAL)
Add "AI Draft Application" on grant records, "Generate Thank You Letter" on donations, "Draft Campaign Description" on campaigns, "Write Impact Report Section" on activities.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are an experienced UK charity fundraising professional with 15 years of grant writing experience. Write a compelling grant application for: Charity: [name] (registered number: [charity_number]), Grant: [grant_name] from [funder_name], Amount requested: £[amount], Project title: [title], Project description: [description], Target beneficiaries: [description], Intended outcomes: [outcomes], Project duration: [duration]. Write in formal but accessible UK English. Include: Executive Summary, Statement of Need, Project Description, Outcomes & Impact Measurement, Organisation Background & Track Record, Budget Justification.", response_json_schema: { type:"object", properties: { executive_summary:{type:"string"}, need_statement:{type:"string"}, project_description:{type:"string"}, outcomes_impact:{type:"string"}, organisation_background:{type:"string"}, budget_justification:{type:"string"} } } })

2. SMART SEARCH & FILTERING (HIGH)
Global search + filters across donors, volunteers, campaigns, grants.
Filters: search text, record_type (donor/volunteer/campaign/grant), donor_status (active/lapsed/major_donor/new), volunteer_availability (weekdays/weekends/evenings), campaign_status (active/draft/completed), donation_amount_min/max, grant_deadline_within (30/60/90 days).

3. IMPACT ANALYTICS DASHBOARD (HIGH)
Dedicated Analytics page using recharts.
KPI cards: Total Funds Raised YTD, Active Volunteers (hours this month), Donor Retention Rate (%), Open Grant Applications (total value £), Upcoming Deadlines (next 30 days).
Charts: Monthly donations vs target (AreaChart), Donor acquisition by source (PieChart), Volunteer hours by month (BarChart), Grant pipeline by stage (funnel/BarChart), Campaign performance comparison (horizontal BarChart).

4. PDF REPORT EXPORT (HIGH)
Export types: Annual Impact Report (full), Donor Statement (individual), Campaign Summary, Volunteer Activity Log, Grant Application (formatted for submission).
Use html2canvas + jsPDF (already installed). Include charity branding, registered number, date.

5. ONBOARDING WIZARD (HIGH)
3-step wizard for new users (check user.onboarding_complete).
Step 1: Set up charity profile (name, registered charity number, cause area, Charity Commission link). Step 2: Create your first fundraising campaign (name, target, end date). Step 3: Invite your first trustee or volunteer.
On complete: await base44.auth.updateMe({ onboarding_complete: true })

6. SUBSCRIBER STRIPE CONNECT — DONATIONS & PAYMENTS FOR THE CHARITY (CRITICAL)
This app is deployed to charities who collect donations and payments from THEIR OWN donors. Each charity subscriber connects THEIR OWN Stripe account.
Implement a "Connect Stripe Account" step in onboarding and settings using Stripe Connect (OAuth):
- Show a "Connect your Stripe account" card in Settings for admin users
- Use Stripe Connect OAuth to link the charity's own Stripe account
- Store the returned stripe_account_id on the organisation record
- All donations, event payments, and campaign contributions route to the charity's own Stripe account
- Show a "Donate Now" button on campaigns that uses the charity's connected Stripe account to process payments
- Display running total of donations received via Stripe on the campaign dashboard
- Show connection status clearly — charities need confidence their funds go to THEM not a third party
Note: Stripe has a verified charity/nonprofit programme — add a note in the UI pointing charities to apply for reduced Stripe fees.

7. SMART DEADLINE & COMPLIANCE ALERTS (MEDIUM)
Alert types: grant application deadline approaching (30/14/7 days), donor lapsed (no gift in 12 months), campaign milestone reached (25/50/75/100% of target), volunteer shift uncovered, Charity Commission annual return due, Gift Aid submission due.
Bell icon in navbar. Mark as actioned. Email digest option.

8. CHARITY COMPLIANCE DASHBOARD (HIGH — NEW)
Dedicated Compliance page: Annual return filing status (Charity Commission), Gift Aid claims outstanding, Safeguarding policy review due, Trustee declaration dates, GDPR data audit status.
Red/amber/green RAG status. This is essential for professional users (charity CEOs, finance officers) and a strong Enterprise tier feature.

ARCHITECTURE RULES:
- Every feature built natively in THIS codebase only
- No cross-app imports or shared runtime services
- Test each feature before moving to the next
- Do not break any existing functionality

PACKAGES AVAILABLE (already installed): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  casenarrative: `# ⚖️ CaseNarrative — Board-Approved Implementation Brief
Drop this into the CaseNarrative app AI assistant as your FIRST message.
Date: 27 April 2026 | Priority: #4 (Strongest AI foundation — extend rather than rebuild)
⚠️ ARCHITECTURE RULE: Build NATIVELY into THIS app only. No shared services. No cross-app API calls. No imports from other portfolio apps. This app must work 100% standalone — independently saleable at any point.

YOU ARE: The AI assistant for CaseNarrative — a SaaS platform for UK legal practitioners and insurance claims professionals.
Target customers: Solicitors, paralegals, insurance claims handlers, personal injury firms, employment law practices, barristers' chambers.
Pricing: £59/mo Starter | £149/mo Professional | £349/mo Enterprise

IMPLEMENT THESE 8 IMPROVEMENTS IN ORDER. Complete and test each before moving to the next.

1. ENHANCED AI LEGAL NARRATIVE BUILDER (CRITICAL — EXTEND EXISTING, DO NOT REPLACE)
Enhance the existing AI functionality with four new modes: Structured Narrative Builder, Precedent Cross-Reference, Evidence Summarisation, and Correspondence Drafting.
Use model:"claude_sonnet_4_6" — this is required for legal work quality:
base44.integrations.Core.InvokeLLM({ model: "claude_sonnet_4_6", prompt: "You are a senior UK solicitor specialising in [case_type] with 20 years of experience. Build a structured legal case narrative for: Case Reference: [ref], Client: [full_name], Opponent: [name], Date of Incident: [date], Jurisdiction: England & Wales, Facts: [facts], Evidence available: [evidence_list], Client instructions: [instructions]. Produce a comprehensive legal narrative including: Background & Parties, Chronology of Events, Liability Analysis, Quantum Assessment, Applicable Legal Framework & Statutes, Recommended Next Steps, Risk Assessment (prospects of success %).", response_json_schema: { type:"object", properties: { background_parties:{type:"string"}, chronology:{type:"string"}, liability_analysis:{type:"string"}, quantum_assessment:{type:"string"}, legal_framework:{type:"string"}, recommended_actions:{type:"array",items:{type:"string"}}, risk_assessment:{type:"string"}, prospects_percentage:{type:"number"}, applicable_statutes:{type:"array",items:{type:"string"}} } } })
NOTE: claude_sonnet_4_6 uses more AI credits but is essential for legal accuracy. Inform users of this in the UI.

2. SMART CASE SEARCH WITH LIMITATION DATE FILTER (HIGH — CRITICAL LEGAL COMPLIANCE)
Add search + filter panel to the cases list page.
Filters: search text (client name, case ref, opponent), case_type, case_status, assigned_fee_earner, limitation_date_within (7/14/30/60/90 days — show in RED for <30 days), client_name, opponent_name, case_value_min/max.
⚠️ The limitation date filter is a LEGAL COMPLIANCE tool. Missing a limitation date is professional negligence. Make this filter visually prominent with a red warning badge.

3. PRACTICE ANALYTICS DASHBOARD (HIGH)
Dedicated Analytics page using recharts.
KPI cards: Active Cases, Cases Settled This Month (count + avg value £), Limitation Dates in Next 30 Days (show in RED if >0), Outstanding Client Care Letters, Average Case Duration (days).
Charts: New cases opened by month (BarChart), Cases by type (PieChart), Settlement value trend (LineChart), Fee earner workload (horizontal BarChart), Case age distribution (BarChart: 0-30/31-90/91-180/180+ days).

4. PDF LEGAL DOCUMENT EXPORT (HIGH)
Export types: Full Case Narrative (formatted), Evidence Bundle Index, Chronology Timeline, Client Care Letter template, Settlement Proposal, Court Bundle Checklist.
Use html2canvas + jsPDF (already installed). Include firm name, SRA number, case reference, date, page numbers. Professional legal formatting.

5. ONBOARDING WIZARD (HIGH)
3-step wizard for new users (check user.onboarding_complete).
Step 1: Create practice profile (firm name, SRA number, primary practice areas, limitation date alert preferences). Step 2: Open your first case (case type, client name, incident date, limitation date). Step 3: Configure your limitation date alert thresholds (default: 90/30/14/7/3/1 days).
On complete: await base44.auth.updateMe({ onboarding_complete: true })

6. SUBSCRIBER STRIPE CONNECT — BILLING FOR THE LAW FIRM (CRITICAL)
This app is deployed to law firms and legal practices who bill THEIR OWN clients. Each firm subscriber connects THEIR OWN Stripe account.
Implement a "Connect Stripe Account" step in settings using Stripe Connect (OAuth):
- Show a "Connect your Stripe account" card in Settings for admin/managing partner users
- Use Stripe Connect OAuth to link the firm's own Stripe account
- Store the returned stripe_account_id on the firm/organisation record
- Enable "Send Invoice" on case records — generates a Stripe payment link sent to the client for disbursements, fees, or deposits on account
- Show payment status on each case: Unpaid / Payment Requested / Paid, with amount
- Dashboard widget: Outstanding client invoices (total £ and count)
- Show connection status clearly in settings
This turns CaseNarrative into a billing tool as well as a case management tool — major stickiness and upsell for firms already using it for narratives.

7. COMPLIANCE NOTIFICATIONS (HIGH VALUE — DO THIS BEFORE ANYTHING ELSE IF LIMITATION ALERTS DON'T EXIST)
⚠️ Alert types in PRIORITY ORDER:
- Limitation date approaching: 90/30/14/7/3/1 days before — show as CRITICAL RED banner for ≤7 days
- Client care letter not sent within 14 days of instruction
- No client contact recorded in 30 days
- Court directions deadline approaching
- Settlement authority not obtained before negotiation
Bell icon in navbar with count. In-app banner for critical (≤7 day) limitation alerts. Email notification option.
The limitation date alert alone is worth the subscription price to a solicitor — this is the #1 selling point.

8. CASE COMPLIANCE AUDIT DASHBOARD (HIGH — NEW)
Dedicated Compliance page: Cases missing client care letters, Cases with limitation dates in next 90 days (RAG status), Cases with no activity in 30+ days, Missing evidence bundle items, Overdue court deadlines.
This is essential for compliance officers and managing partners at larger firms. Strong Enterprise tier differentiator. Include a "Compliance Score" per fee earner.

ARCHITECTURE RULES:
- Every feature built natively in THIS codebase only
- No cross-app imports or shared runtime services  
- PRESERVE ALL existing AI and case management functionality — extend, never replace
- Test each feature before moving to the next

PACKAGES AVAILABLE (already installed): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM (use model:"claude_sonnet_4_6" for legal), sonner, lucide-react, @stripe/react-stripe-js`,
};

// ─── MARKETING ASSET BRIEFS ──────────────────────────────────────────────────

const MARKETING_BRIEFS = [
  {
    id: 'species_explorer',
    name: 'DataWinder (Species Explorer)',
    emoji: '🌿',
    color: 'green',
    instruction: 'Open DataWinder in Base44 → AI assistant chat → paste this as your FIRST message.',
  },
  {
    id: 'premiso',
    name: 'Premiso',
    emoji: '🏠',
    color: 'blue',
    instruction: 'Open Premiso in Base44 → AI assistant chat → paste this as your FIRST message.',
  },
  {
    id: 'charityhub',
    name: 'CharityHub',
    emoji: '💛',
    color: 'orange',
    instruction: 'Open CharityHub in Base44 → AI assistant chat → paste this as your FIRST message.',
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    emoji: '⚖️',
    color: 'purple',
    instruction: 'Open CaseNarrative in Base44 → AI assistant chat → paste this as your FIRST message.',
  },
];

const MARKETING_CONTENT = {
  species_explorer: `# 🌿 DataWinder — Marketing Assets Brief
Paste this into the DataWinder app AI assistant as a STANDALONE task. Do not build any features — only generate marketing assets.

YOU ARE generating a complete set of sales and marketing assets for DataWinder — a UK-focused SaaS platform for wildlife conservation professionals, zoological societies, wildlife trusts, universities, and environmental consultancies.

PRODUCT FACTS TO USE:
- App name: DataWinder
- Tagline ideas to choose the best from: "The Intelligence Layer for Conservation", "Field Science, Supercharged", "Data-Driven Conservation for UK Professionals"
- Target customers: Wildlife trusts, zoological societies, Natural England, RSPB-style NGOs, environmental consultancies, universities with ecology departments
- Pricing: £39/mo Starter | £99/mo Professional | £249/mo Enterprise
- Key features: AI-generated field survey reports, species observation tracking, IUCN compliance dashboards, smart search & filtering, PDF export, team collaboration, compliance audit trails

GENERATE ALL OF THE FOLLOWING — output each section clearly labelled:

## 1. LANDING PAGE HERO COPY
Write a hero headline (max 10 words, punchy), sub-headline (1–2 sentences, benefit-led), and 3 supporting bullet points. Tone: professional, scientific credibility, modern.

## 2. FEATURE SECTION COPY (3 FEATURES)
For each of the 3 main features, write: Feature name, one-line description, 2-sentence benefit paragraph. Features to cover: AI Field Reports, Compliance Dashboard, Smart Search.

## 3. PRICING PAGE COPY
For each tier (Starter £39/mo, Professional £99/mo, Enterprise £249/mo): tier name, who it's for (1 sentence), 5 bullet point features, CTA button text. Make the Professional tier most compelling.

## 4. EMAIL OUTREACH SEQUENCE (3 EMAILS)
Write 3 cold outreach emails targeting Wildlife Trust operations managers / Head of Conservation at UK NGOs:
- Email 1: Problem-focused intro (subject line + body, ~120 words)
- Email 2: Social proof / feature highlight follow-up (subject + body, ~100 words)  
- Email 3: Last-chance nudge with free trial offer (subject + body, ~80 words)
Tone: peer-to-peer, not salesy. Reference real UK conservation sector pain points (manual reporting, IUCN compliance burden, team coordination across field sites).

## 5. LINKEDIN POST (3 VARIATIONS)
Write 3 LinkedIn posts for organic reach. Mix of: thought leadership, product launch announcement, customer pain point story. Each 150–200 words with relevant hashtags (#UKConservation #WildlifeTrust #FieldScience #BiodiversityNet).

## 6. ONE-PAGE SALES SHEET (TEXT ONLY)
Structure: Logo placeholder | Headline | Problem statement | Solution | 3 key benefits | Pricing summary | Contact/CTA | Social proof placeholder ("Trusted by [X] conservation teams"). Suitable for PDF formatting.

## 7. OBJECTION HANDLING GUIDE
List 6 likely sales objections from conservation professionals + a confident, evidence-based response to each. Example objections: "We already use spreadsheets", "Our budget is restricted", "We need regulatory approval to change systems", "Our field staff aren't tech-savvy".

## 8. DEMO SCRIPT (5 MINUTES)
Write a structured 5-minute demo script for a live or recorded video demo. Sections: Hook (30s), Problem statement (45s), Live feature walkthrough — AI reports, compliance dashboard, search (2.5 min), Pricing + CTA (45s), Q&A prompt (30s).

OUTPUT FORMAT: Use clear markdown headers for each section. Make all copy UK English. Avoid Americanisms. Do not use placeholder "[Company name]" — use "your organisation" instead.`,

  premiso: `# 🏠 Premiso — Marketing Assets Brief
Paste this into the Premiso app AI assistant as a STANDALONE task. Do not build any features — only generate marketing assets.

YOU ARE generating a complete set of sales and marketing assets for Premiso — a UK property management SaaS for private landlords, letting agencies, and estate managers.

PRODUCT FACTS TO USE:
- App name: Premiso
- Tagline ideas: "Property Management, Reimagined", "Your Portfolio, Under Control", "The Smart Way to Manage UK Property"
- Target customers: UK private landlords (2.65M+), letting agencies (15,000+), estate managers, HMO operators, property companies
- Pricing: £49/mo Starter | £129/mo Professional | £299/mo Enterprise
- Key features: AI-drafted tenancy agreements & legal notices, compliance alerts (gas safety, EPC, deposit protection), portfolio analytics, rent collection via Stripe, PDF document export, team access controls

GENERATE ALL OF THE FOLLOWING — output each section clearly labelled:

## 1. LANDING PAGE HERO COPY
Hero headline (max 10 words), sub-headline (1–2 sentences, benefit-led), 3 supporting bullets. Tone: confident, time-saving, stress-reducing.

## 2. FEATURE SECTION COPY (3 FEATURES)
Feature name, one-line description, 2-sentence benefit paragraph for: AI Document Drafting, Compliance Dashboard, Portfolio Analytics.

## 3. PRICING PAGE COPY
For each tier (Starter £49/mo, Professional £129/mo, Enterprise £299/mo): tier name, who it's for, 5 bullet features, CTA text. Professional tier should be the most compelling.

## 4. EMAIL OUTREACH SEQUENCE (3 EMAILS)
Cold outreach targeting landlords with 3+ properties and letting agency managers:
- Email 1: Problem-focused (subject + body ~120 words) — focus on compliance risk (missed gas certs, deposit disputes)
- Email 2: Feature proof follow-up (subject + body ~100 words) — AI document drafting angle
- Email 3: Free trial nudge (subject + body ~80 words)
Reference real UK pain points: Section 21 compliance complexity, HMO licensing, right-to-rent checks, deposit scheme deadlines.

## 5. LINKEDIN POST (3 VARIATIONS)
3 posts for organic reach. Mix: landlord pain point story, product announcement, compliance tip with product mention. 150–200 words each. Hashtags: #UKLandlord #PropertyManagement #LettingAgency #HMO #PropertyTech.

## 6. ONE-PAGE SALES SHEET (TEXT ONLY)
Logo placeholder | Headline | Problem | Solution | 3 key benefits | Pricing summary | CTA | Social proof placeholder.

## 7. OBJECTION HANDLING GUIDE
6 objections from landlords/agents + confident responses. Example objections: "I only have a few properties", "My accountant handles everything", "What about GDPR?", "I don't trust cloud software with tenancy data", "I already use Rightmove/Zoopla".

## 8. DEMO SCRIPT (5 MINUTES)
Structured script: Hook (30s — compliance horror story), Problem (45s), Feature walkthrough — AI tenancy draft, compliance alerts, analytics (2.5 min), Pricing + CTA (45s), Q&A prompt (30s).

OUTPUT FORMAT: Clear markdown headers per section. UK English throughout. Use "your portfolio" not "your company".`,

  charityhub: `# 💛 CharityHub — Marketing Assets Brief
Paste this into the CharityHub app AI assistant as a STANDALONE task. Do not build any features — only generate marketing assets.

YOU ARE generating a complete set of sales and marketing assets for CharityHub — a UK charity operations SaaS for registered charities, CICs, and third-sector organisations.

PRODUCT FACTS TO USE:
- App name: CharityHub
- Tagline ideas: "Run Your Charity. Not Your Spreadsheets.", "Built for Charity. Powered by Purpose.", "The Operations Platform for UK Charities"
- Target customers: UK registered charities (168,000+), community interest companies, grant-making foundations, hospices, housing associations with charitable arms, faith-based organisations
- Pricing: £29/mo Starter | £79/mo Professional | £199/mo Enterprise
- Key features: AI grant application drafting, donor & volunteer management, impact analytics dashboard, Stripe Connect for donations, compliance dashboard (Charity Commission, Gift Aid, GDPR), campaign management, PDF impact reports

GENERATE ALL OF THE FOLLOWING — output each section clearly labelled:

## 1. LANDING PAGE HERO COPY
Hero headline (max 10 words), sub-headline (1–2 sentences), 3 supporting bullets. Tone: warm, mission-aligned, empowering — NOT corporate.

## 2. FEATURE SECTION COPY (3 FEATURES)
Feature name, one-line description, 2-sentence benefit paragraph for: AI Grant Writing Assistant, Compliance Dashboard, Impact Analytics.

## 3. PRICING PAGE COPY
For each tier (Starter £29/mo, Professional £79/mo, Enterprise £199/mo): tier name, who it's for, 5 bullet features, CTA. Note the Starter price is accessible for small charities — lead with this.

## 4. EMAIL OUTREACH SEQUENCE (3 EMAILS)
Cold outreach targeting charity CEOs, operations managers, and fundraising managers:
- Email 1: Problem-focused (~120 words) — time wasted on admin instead of mission delivery
- Email 2: AI grant writing angle follow-up (~100 words) — "what if your next application wrote itself?"
- Email 3: Free trial nudge (~80 words)
Reference real sector pain points: Charity Commission filing deadlines, Gift Aid claim complexity, volunteer coordination, grant reporting burden.

## 5. LINKEDIN POST (3 VARIATIONS)
3 posts. Mix: sector pain point, product launch, impact story angle. 150–200 words. Hashtags: #UKCharity #ThirdSector #CharityTech #FundraisingUK #CharityCommission #GiftAid.

## 6. ONE-PAGE SALES SHEET (TEXT ONLY)
Logo placeholder | Headline | Problem | Solution | 3 key benefits | Pricing | CTA | "Trusted by charities across England & Wales" placeholder.

## 7. OBJECTION HANDLING GUIDE
6 objections from charity professionals + responses. Examples: "We don't have budget for software", "Our trustees need to approve any new tools", "We use a legacy CRM", "Is our donor data safe?", "We're too small to need this", "GDPR concerns around donor records".

## 8. DEMO SCRIPT (5 MINUTES)
Hook (30s — grant deadline stress story), Problem (45s), Feature walkthrough — AI grant draft live, compliance dashboard, donation analytics (2.5 min), Pricing + CTA (45s), Q&A (30s).

OUTPUT FORMAT: Clear markdown headers. UK English. Warm, mission-first tone throughout. Avoid corporate language.`,

  casenarrative: `# ⚖️ CaseNarrative — Marketing Assets Brief
Paste this into the CaseNarrative app AI assistant as a STANDALONE task. Do not build any features — only generate marketing assets.

YOU ARE generating a complete set of sales and marketing assets for CaseNarrative — a UK legal case management SaaS with AI-powered narrative building for solicitors, paralegals, and insurance claims handlers.

PRODUCT FACTS TO USE:
- App name: CaseNarrative
- Tagline ideas: "Case Management, Elevated by AI", "Never Miss a Limitation Date Again", "The AI-Powered Case Narrative Platform for UK Law"
- Target customers: UK solicitors (150,000+ practising), personal injury firms, employment law practices, insurance claims teams, barristers' chambers, paralegals
- Pricing: £59/mo Starter | £149/mo Professional | £349/mo Enterprise
- Key features: AI legal narrative builder (Claude Sonnet — senior solicitor quality), limitation date alerts (critical compliance), practice analytics, PDF legal document export, Stripe Connect for client billing, compliance audit dashboard, client care letter tracking
- Key differentiator: Limitation date alerts alone prevent professional negligence claims — this is the #1 selling point

GENERATE ALL OF THE FOLLOWING — output each section clearly labelled:

## 1. LANDING PAGE HERO COPY
Hero headline (max 10 words — must reference either AI or limitation date risk), sub-headline (1–2 sentences), 3 bullets. Tone: authoritative, risk-aware, efficiency-focused.

## 2. FEATURE SECTION COPY (3 FEATURES)
Feature name, one-line description, 2-sentence benefit paragraph for: AI Legal Narrative Builder, Limitation Date Alert System, Case Compliance Audit Dashboard.

## 3. PRICING PAGE COPY
For each tier (Starter £59/mo, Professional £149/mo, Enterprise £349/mo): tier name, who it's for, 5 bullet features, CTA. Note: Clio = $49–99/user/mo, LEAP = £100+/user/mo — position CaseNarrative as significantly cheaper for the whole firm.

## 4. EMAIL OUTREACH SEQUENCE (3 EMAILS)
Cold outreach targeting PI firm practice managers, legal operations managers, and managing partners at SME law firms:
- Email 1: Limitation date risk hook (~120 words) — professional negligence angle, one missed date = SRA complaint
- Email 2: AI efficiency angle (~100 words) — "What takes your fee earner 3 hours takes CaseNarrative 3 minutes"
- Email 3: Free trial / ROI nudge (~80 words)
Reference real sector pain points: SRA compliance, client care letter obligations, court directions deadlines, indemnity insurance costs.

## 5. LINKEDIN POST (3 VARIATIONS)
3 posts. Mix: limitation date risk warning (educational), AI demo teaser, cost-vs-Clio comparison. 150–200 words each. Hashtags: #UKLaw #LegalTech #SolicitorUK #PILaw #LegalAI #SRACompliance.

## 6. ONE-PAGE SALES SHEET (TEXT ONLY)
Logo placeholder | Headline ("Never miss a limitation date") | Problem | Solution | 3 key benefits | Pricing vs competitors | CTA | "Trusted by UK law firms" placeholder.

## 7. OBJECTION HANDLING GUIDE
6 objections from legal professionals + responses. Examples: "We use a legacy case management system", "Our partners are sceptical of AI in legal work", "GDPR / client confidentiality concerns", "SRA compliance — is this approved?", "We can't switch mid-case", "The price is too high compared to our current Excel system".

## 8. DEMO SCRIPT (5 MINUTES)
Hook (30s — "What happens if you miss a limitation date?"), Problem (45s — compliance risk + time drain), Feature walkthrough — AI narrative generation live, limitation alerts in red, practice analytics (2.5 min), Pricing vs Clio + CTA (45s), Q&A (30s).

OUTPUT FORMAT: Clear markdown headers. UK English. Authoritative, credible legal sector tone. Never use generic phrases like "streamline your workflow" — be specific to legal practice.`,
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function CopyButton({ content, label, colorClass }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`Copied — paste into the app's AI assistant`);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <Button
      onClick={handleCopy}
      className={`w-full ${copied ? 'bg-green-600 hover:bg-green-700' : colorClass} text-white font-semibold`}
    >
      {copied
        ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied! Paste into AI Assistant</>
        : <><Copy className="w-4 h-4 mr-2" /> {label}</>}
    </Button>
  );
}

// ─── IMPLEMENTATION BRIEF CARD ───────────────────────────────────────────────

function ImplBriefCard({ brief }) {
  const colors = COLOR_STYLES[brief.color];
  return (
    <div className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
      <div className={`${colors.header} text-white px-5 py-4`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{brief.name}</span>
              <Badge className="bg-white/20 text-white text-xs border-0">#{brief.priority}</Badge>
            </div>
            <div className="text-xs text-white/70 mt-0.5">{brief.priorityLabel}</div>
          </div>
          <FileText className="w-6 h-6 text-white/50" />
        </div>
        <p className="text-sm text-white/80">{brief.description}</p>
      </div>
      <div className="px-5 py-4 bg-white">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">8 Board-Approved Improvements</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {brief.improvements.map((imp, i) => (
            <Badge key={i} className={`text-xs ${colors.badge}`}>{imp}</Badge>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 mb-4">
          <strong>How to use:</strong> {brief.instruction}
        </div>
        <CopyButton
          content={IMPL_BRIEF_CONTENT[brief.id]}
          label={`Copy ${brief.name} Implementation Brief`}
          colorClass={colors.btn}
        />
      </div>
    </div>
  );
}

// ─── MARKETING BRIEF CARD ────────────────────────────────────────────────────

const MARKETING_ASSETS_LIST = [
  'Hero & landing page copy',
  '3 feature section descriptions',
  'Pricing page copy (all tiers)',
  '3-email cold outreach sequence',
  '3 LinkedIn posts',
  'One-page sales sheet (PDF-ready)',
  'Objection handling guide (6 objections)',
  '5-minute demo script',
];

function MarketingBriefCard({ brief }) {
  const colors = COLOR_STYLES[brief.color];
  return (
    <div className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
      <div className={`${colors.header} text-white px-5 py-4`}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{brief.emoji}</span>
          <div>
            <div className="font-bold text-lg">{brief.name}</div>
            <div className="text-xs text-white/70">Marketing Assets Pack</div>
          </div>
          <Megaphone className="w-5 h-5 text-white/40 ml-auto" />
        </div>
      </div>
      <div className="px-5 py-4 bg-white">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assets Generated</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {MARKETING_ASSETS_LIST.map((a, i) => (
            <Badge key={i} className={`text-xs ${colors.badge}`}>{a}</Badge>
          ))}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 mb-4">
          <strong>How to use:</strong> {brief.instruction} The AI will output all 8 asset sections in one response — copy each into your sales toolkit.
        </div>
        <CopyButton
          content={MARKETING_CONTENT[brief.id]}
          label={`Copy ${brief.name} Marketing Brief`}
          colorClass={colors.btn}
        />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function AppBriefs() {
  const [tab, setTab] = useState('implementation');

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">App Briefs & Marketing Assets</h1>
        <p className="text-slate-300 text-sm max-w-2xl">
          One-click copy of implementation briefs and marketing asset prompts — paste directly into each app's AI assistant.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
        <button
          onClick={() => setTab('implementation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'implementation' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FileText className="w-4 h-4" /> Implementation Briefs
        </button>
        <button
          onClick={() => setTab('marketing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'marketing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Megaphone className="w-4 h-4" /> Marketing Assets
        </button>
      </div>

      {/* Implementation Briefs tab */}
      {tab === 'implementation' && (
        <>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
            <strong className="text-amber-600">How to use:</strong>
            <ol className="mt-2 space-y-1 text-slate-600 list-decimal list-inside text-xs">
              <li>Copy the brief for the app you're building (start with DataWinder)</li>
              <li>Open that app in a new Base44 browser tab</li>
              <li>Paste the brief as your FIRST message in the AI assistant</li>
              <li>The AI will implement each of the 8 improvements in sequence</li>
              <li>Test each feature, then move to the next app</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BRIEFS.map(brief => <ImplBriefCard key={brief.id} brief={brief} />)}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            <strong>⚠️ Board Architecture Rule (Ratified April 2026):</strong> Every improvement is implemented natively inside each app's own codebase. No shared runtime dependencies. No cross-app API calls. Each app must work completely standalone — independently saleable at any point.
          </div>
        </>
      )}

      {/* Marketing Assets tab */}
      {tab === 'marketing' && (
        <>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
            <strong className="text-purple-600">How to use:</strong>
            <ol className="mt-2 space-y-1 text-slate-600 list-decimal list-inside text-xs">
              <li>Copy the marketing brief for the app you want assets for</li>
              <li>Open that app in a new Base44 browser tab</li>
              <li>Paste as your FIRST message in the AI assistant (this is a standalone task — not a build task)</li>
              <li>The AI will generate all 8 asset sections in one response</li>
              <li>Copy each section into your sales toolkit, email tool, LinkedIn, and Canva/Google Docs</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MARKETING_BRIEFS.map(brief => <MarketingBriefCard key={brief.id} brief={brief} />)}
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900">
            <strong>💡 Note:</strong> These prompts instruct the AI to generate ONLY marketing copy — no code changes. Run these in a separate conversation from your implementation briefs. Each pack produces ~2,000 words of product-specific, UK-market copy ready for email, LinkedIn, sales calls, and PDF formatting.
          </div>
        </>
      )}
    </div>
  );
}