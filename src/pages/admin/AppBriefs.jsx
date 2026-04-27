import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const BRIEFS = [
  {
    id: 'species_explorer',
    name: 'DataWinder (Species Explorer)',
    priority: 1,
    priorityLabel: '🌟 Priority Sale — First',
    color: 'green',
    description: 'Conservation & biodiversity intelligence platform',
    path: '/src/docs/app-briefs/SPECIES_EXPLORER_BRIEF.md',
    improvements: ['AI Field Reports', 'Smart Search', 'Analytics Dashboard', 'PDF Export', 'Stripe Paywall', 'Onboarding Wizard', 'Notifications', 'Compliance Dashboard'],
    instruction: 'Open DataWinder (Species Explorer) in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'premiso',
    name: 'Premiso',
    priority: 2,
    priorityLabel: 'Second',
    color: 'blue',
    description: 'Property portfolio management',
    path: '/src/docs/app-briefs/PREMISO_BRIEF.md',
    improvements: ['AI Document Drafting', 'Smart Search', 'Portfolio Analytics', 'PDF Export', 'Stripe Paywall', 'Onboarding Wizard', 'Compliance Alerts', 'Compliance Dashboard'],
    instruction: 'Open Premiso in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'charityhub',
    name: 'CharityHub',
    priority: 3,
    priorityLabel: 'Third',
    color: 'orange',
    description: 'Charity operations management',
    path: '/src/docs/app-briefs/CHARITYHUB_BRIEF.md',
    improvements: ['AI Grant Assistant', 'Smart Search', 'Impact Analytics', 'PDF Reports', 'Stripe Paywall', 'Onboarding Wizard', 'Deadline Alerts', 'Compliance Dashboard'],
    instruction: 'Open CharityHub in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'casenarrative',
    name: 'CaseNarrative',
    priority: 4,
    priorityLabel: 'Fourth',
    color: 'purple',
    description: 'AI-assisted legal case documentation',
    path: '/src/docs/app-briefs/CASENARRATIVE_BRIEF.md',
    improvements: ['Enhanced AI Narratives', 'Smart Case Search', 'Practice Analytics', 'PDF Legal Export', 'Stripe Paywall', 'Onboarding Wizard', 'Limitation Alerts', 'Compliance Audit Dashboard'],
    instruction: 'Open CaseNarrative in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
];

const COLOR_STYLES = {
  green: { header: 'bg-green-900', badge: 'bg-green-100 text-green-800', border: 'border-green-300', btn: 'bg-green-700 hover:bg-green-800' },
  blue: { header: 'bg-blue-900', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-300', btn: 'bg-blue-700 hover:bg-blue-800' },
  orange: { header: 'bg-orange-900', badge: 'bg-orange-100 text-orange-800', border: 'border-orange-300', btn: 'bg-orange-700 hover:bg-orange-800' },
  purple: { header: 'bg-purple-900', badge: 'bg-purple-100 text-purple-800', border: 'border-purple-300', btn: 'bg-purple-700 hover:bg-purple-800' },
};

// The actual brief content embedded for copy-to-clipboard
const BRIEF_CONTENT = {
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

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £39/mo: 3 surveys, 50 species observations. Professional £99/mo: unlimited surveys + AI reports + PDF export + 5 team seats. Enterprise £249/mo: unlimited everything + API access.
Gate "AI Generate Report" and "Export PDF" behind Professional+. Show an upgrade modal with pricing for free/starter users who try to access gated features.

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

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £49/mo: up to 3 properties. Professional £129/mo: unlimited properties + AI document drafting + PDF export + 3 user seats. Enterprise £299/mo: unlimited everything + API + white-label reports.
Gate AI drafting and PDF export behind Professional+. Show upgrade modal with clear ROI messaging (e.g. "One AI-drafted tenancy agreement saves 2 hours of solicitor time").

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

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £29/mo: 1 active campaign, 50 donor records. Professional £79/mo: unlimited + AI grant assistant + PDF reports + 5 user seats. Enterprise £199/mo: unlimited everything + API + white-label reports + Charity Commission integration.
Gate AI assistant and PDF exports behind Professional+. Note: many charities qualify for discounted/free tiers — add "Apply for charity discount" link.

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

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £59/mo: 10 active cases, basic AI narrative. Professional £149/mo: unlimited cases + full AI suite (claude_sonnet_4_6) + PDF export + 3 fee earner seats + priority support. Enterprise £349/mo: unlimited all + court bundle automation + API access + white-label.
Gate: AI narrative builder (claude model), PDF export, precedent matching → behind Professional+.
Competitive positioning: Clio = $49-99/user/mo. LEAP = £100+/user/mo. CaseNarrative at £149/mo for the WHOLE FIRM is significantly cheaper. Lead with this in the upgrade modal.

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

PACKAGES AVAILABLE (already installed): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM (use model:"claude_sonnet_4_6" for legal), sonner, lucide-react, @stripe/react-stripe-js`
};

function BriefCard({ brief }) {
  const [copied, setCopied] = useState(false);
  const colors = COLOR_STYLES[brief.color];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BRIEF_CONTENT[brief.id]);
    setCopied(true);
    toast.success(`${brief.name} brief copied to clipboard — paste into the app's AI assistant`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`rounded-xl border-2 ${colors.border} overflow-hidden`}>
      {/* Header */}
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

      {/* Improvements list */}
      <div className="px-5 py-4 bg-white">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">8 Board-Approved Improvements</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {brief.improvements.map((imp, i) => (
            <Badge key={i} className={`text-xs ${colors.badge}`}>{imp}</Badge>
          ))}
        </div>

        {/* How to use */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 mb-4">
          <strong>How to use:</strong> {brief.instruction}
        </div>

        {/* Copy button */}
        <Button
          onClick={handleCopy}
          className={`w-full ${copied ? 'bg-green-600 hover:bg-green-700' : colors.btn} text-white font-semibold`}
        >
          {copied ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied! Paste into {brief.name} AI Assistant</>
          ) : (
            <><Copy className="w-4 h-4 mr-2" /> Copy {brief.name} Brief to Clipboard</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AppBriefs() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">App Implementation Briefs</h1>
        <p className="text-slate-300 text-sm max-w-2xl">
          One-click copy of each app's complete implementation brief — ready to paste directly into that app's AI assistant.
          Each brief contains the board-approved improvements, exact code patterns adapted for that domain, and architecture rules.
        </p>
        <div className="mt-4 bg-white/10 rounded-xl p-4 text-sm">
          <strong className="text-amber-400">How to use:</strong>
          <ol className="mt-2 space-y-1 text-slate-300 list-decimal list-inside text-xs">
            <li>Click "Copy Brief" for the app you're working on (start with Species Explorer)</li>
            <li>Open that app in a new Base44 browser tab</li>
            <li>Click the AI assistant chat in that app</li>
            <li>Paste the brief as your first message</li>
            <li>The AI assistant will implement each improvement in sequence</li>
            <li>Test each feature, then come back and copy the next app's brief</li>
          </ol>
        </div>
      </div>

      {/* App brief cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BRIEFS.map(brief => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>

      {/* Architecture reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <strong>⚠️ Board Architecture Rule (Ratified April 2026):</strong> Every improvement is implemented natively inside each app's own codebase.
        No shared runtime dependencies. No cross-app API calls. Each app must work completely standalone — independently saleable at any point.
        Species Explorer is the priority sale candidate and should be completed first.
      </div>
    </div>
  );
}