import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const BRIEFS = [
  {
    id: 'species_explorer',
    name: 'Species Explorer',
    priority: 1,
    priorityLabel: '🌟 Priority Sale — First',
    color: 'green',
    description: 'Conservation & field research platform',
    path: '/src/docs/app-briefs/SPECIES_EXPLORER_BRIEF.md',
    improvements: ['AI Field Reports', 'Smart Search', 'Analytics Dashboard', 'PDF Export', 'Stripe Paywall', 'Onboarding Wizard', 'Notifications'],
    instruction: 'Open Species Explorer in Base44 → click the AI assistant chat → paste the entire brief below as your first message.',
  },
  {
    id: 'premiso',
    name: 'Premiso',
    priority: 2,
    priorityLabel: 'Second',
    color: 'blue',
    description: 'Property portfolio management',
    path: '/src/docs/app-briefs/PREMISO_BRIEF.md',
    improvements: ['AI Document Drafting', 'Smart Search', 'Portfolio Analytics', 'PDF Export', 'Stripe Paywall', 'Onboarding Wizard', 'Rent Alerts'],
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
    improvements: ['AI Grant Assistant', 'Smart Search', 'Impact Analytics', 'PDF Annual Reports', 'Stripe Paywall', 'Onboarding Wizard', 'Deadline Alerts'],
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
    improvements: ['Enhanced AI Narratives', 'Smart Case Search', 'Practice Analytics', 'PDF Legal Export', 'Stripe Paywall', 'Onboarding Wizard', 'Limitation Alerts'],
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
  species_explorer: `# 🌿 Species Explorer — Board-Approved Implementation Brief
Drop this into the Species Explorer app AI assistant.
Date: April 2026 | Priority: #1 (First standalone sale candidate)
Architecture Rule: Build NATIVELY into THIS app only. No shared services. No external dependencies.

YOU ARE: AI assistant for Species Explorer — SaaS for UK wildlife conservation professionals, zoos, universities, environmental consultancies.
Target customers: UK conservation orgs, zoological societies, Natural England, wildlife trusts, universities.
Pricing: £39/mo Starter | £99/mo Professional | £249/mo Enterprise

IMPLEMENT THESE IMPROVEMENTS IN ORDER:

1. AI FIELD REPORT GENERATION (CRITICAL)
Add "AI Generate Report" button on observation/survey detail pages.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are a wildlife conservation scientist. Generate a detailed field report for: Species: [name], Location: [loc], Date: [date], Observer: [name], Observations: [notes]. Include: Executive Summary, Detailed Observations, Behavioural Notes, Conservation Status Assessment, Recommended Actions.", response_json_schema: { type: "object", properties: { executive_summary: {type:"string"}, detailed_observations: {type:"string"}, behavioural_notes: {type:"string"}, conservation_assessment: {type:"string"}, recommended_actions: {type:"array",items:{type:"string"}} } } })

2. SMART SEARCH & FILTERING (HIGH)
Add search bar + filter panel to species list and observations pages.
Filters: search text, conservation_status (all/endangered/vulnerable/least_concern), habitat_type (all/woodland/wetland/coastal), survey_date_from/to, observer.

3. ANALYTICS DASHBOARD (HIGH)
Enhance home/dashboard with recharts. KPIs: Total Species Recorded, Surveys This Month, Active Researchers, Alerts.
Charts: sightings over time (line), species by conservation status (pie), survey areas (bar).

4. PDF SURVEY REPORT EXPORT (HIGH)
Add "Export PDF" on survey and observation detail pages.
Use html2canvas + jsPDF (already installed): html2canvas(ref.current, {scale:2}) → jsPDF a4 → paginate → save.

5. ONBOARDING WIZARD (HIGH)
3-step wizard for new users: Step 1: Create first survey. Step 2: Add first species observation. Step 3: Invite team member.
On complete: base44.auth.updateMe({ onboarding_complete: true })

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £39/mo: 3 surveys, 50 species. Professional £99/mo: unlimited + AI + PDF + 5 seats. Enterprise £249/mo: unlimited all.
Gate AI reports and PDF export behind Professional+. Show upgrade prompt for free users.

7. NOTIFICATIONS (MEDIUM)
Bell icon in navbar. Alert types: survey deadline approaching, new observation by team member, species status changed.

ARCHITECTURE RULES:
- This app MUST work 100% standalone — no imports from other portfolio apps
- Every feature built natively in THIS codebase
- Test each feature before moving to next
- Do not break existing functionality
- This is the #1 priority sale candidate — make it polished and complete

PACKAGES AVAILABLE (no install needed): recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  premiso: `# 🏠 Premiso — Board-Approved Implementation Brief
Drop this into the Premiso app AI assistant.
Date: April 2026 | Priority: #2
Architecture Rule: Build NATIVELY into THIS app only. No shared services. No external dependencies.

YOU ARE: AI assistant for Premiso — SaaS for UK property professionals.
Target customers: UK private landlords (2.65M+), letting agencies (15,000+), estate managers.
Pricing: £49/mo Starter | £129/mo Professional | £299/mo Enterprise

IMPLEMENT THESE IMPROVEMENTS IN ORDER:

1. AI DOCUMENT INTELLIGENCE (CRITICAL)
Add "AI Draft" button on tenancy agreements, inspection reports, section notices.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are a UK property law expert. Generate a professional [document_type] for: Property: [address], Landlord: [name], Tenant: [name], Start: [date], Rent: £[amount], Deposit: £[amount]. Include all UK housing law obligations.", response_json_schema: { type:"object", properties: { document_title:{type:"string"}, document_body:{type:"string"}, key_clauses:{type:"array",items:{type:"string"}}, compliance_notes:{type:"string"} } } })

2. SMART SEARCH & FILTERING (HIGH)
Filters: search, property_status (occupied/vacant/maintenance), rent_status (current/overdue/partial), postcode_area, tenancy_expiring_days (30/60/90), property_type.

3. PORTFOLIO ANALYTICS DASHBOARD (HIGH)
KPIs: Total Portfolio Value, Rent Collection Rate %, Vacant Properties, Open Maintenance Requests, Expiring Tenancies.
Charts (recharts): rent collection by month (bar), occupancy rate (line), maintenance by type (pie), yield by property (horizontal bar).

4. PDF DOCUMENT EXPORT (HIGH)
Export tenancy agreements, inspection reports, rent statements.
Use html2canvas + jsPDF (already installed): html2canvas(ref.current, {scale:2}) → jsPDF a4 → paginate → save.

5. ONBOARDING WIZARD (HIGH)
3 steps: Add first property → Add first tenant → Set rent collection day.
On complete: base44.auth.updateMe({ onboarding_complete: true })

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £49/mo: 3 properties. Professional £129/mo: unlimited + AI docs + PDF. Enterprise £299/mo: unlimited all.
Gate AI drafting and PDF export behind Professional+.

7. SMART ALERTS (MEDIUM)
Alert types: rent overdue, tenancy expiring in 30/60/90 days, maintenance request, gas safety cert expiring, EPC expiry.

ARCHITECTURE RULES: Standalone only. No imports from other apps. Test each feature. Preserve existing functionality.
PACKAGES AVAILABLE: recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  charityhub: `# 💛 CharityHub — Board-Approved Implementation Brief
Drop this into the CharityHub app AI assistant.
Date: April 2026 | Priority: #3
Architecture Rule: Build NATIVELY into THIS app only. No shared services. No external dependencies.

YOU ARE: AI assistant for CharityHub — SaaS for UK charities and third-sector organisations.
Target customers: 168,000 registered charities in England & Wales, CICs, voluntary organisations.
Pricing: £29/mo Starter | £79/mo Professional | £199/mo Enterprise

IMPLEMENT THESE IMPROVEMENTS IN ORDER:

1. AI GRANT APPLICATION & COMMUNICATIONS ASSISTANT (CRITICAL)
Add "AI Draft Application" on grant records, "Generate Thank You Letter" on donations, "Draft Campaign Description" on campaigns.
Use: base44.integrations.Core.InvokeLLM({ prompt: "You are an experienced UK charity fundraising professional. Write a compelling grant application for: Charity: [name] ([charity_number]), Grant: [grant_name] from [funder], Amount: £[amount], Project: [title and description], Beneficiaries: [description], Outcomes: [outcomes]. Write: Executive Summary, Need Statement, Project Description, Outcomes & Impact, Organisation Background, Budget Justification.", response_json_schema: { type:"object", properties: { executive_summary:{type:"string"}, need_statement:{type:"string"}, project_description:{type:"string"}, outcomes_impact:{type:"string"}, organisation_background:{type:"string"}, budget_justification:{type:"string"} } } })

2. SMART SEARCH (HIGH)
Filters: search, entity_type (donor/volunteer/campaign/grant), donor_status (active/lapsed/major), volunteer_availability, campaign_status, donation_amount_min/max.

3. IMPACT ANALYTICS DASHBOARD (HIGH)
KPIs: Total Funds Raised YTD, Active Volunteers, Donor Retention Rate %, Open Grant Applications, Upcoming Deadlines.
Charts (recharts): monthly donations (area), donor by source (pie), volunteer hours (bar), grant pipeline funnel, campaign performance (horizontal bar).

4. PDF REPORT EXPORT (HIGH)
Export: annual impact report, donor statement, campaign summary, volunteer activity log.
Use html2canvas + jsPDF (already installed).

5. ONBOARDING WIZARD (HIGH)
3 steps: Set up charity profile (name, charity number, cause area) → Create first campaign → Invite trustee/volunteer.
On complete: base44.auth.updateMe({ onboarding_complete: true })

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £29/mo: 1 campaign, 50 donors. Professional £79/mo: unlimited + AI + PDF + 5 seats. Enterprise £199/mo: unlimited all.
Gate AI grant assistant, PDF reports behind Professional+.

7. ALERTS (MEDIUM)
Alert types: donor lapsed, grant deadline approaching, campaign milestone (25/50/75/100%), volunteer shift uncovered, Charity Commission filing deadline.

ARCHITECTURE RULES: Standalone only. No imports from other apps. Test each feature. Preserve existing functionality.
PACKAGES AVAILABLE: recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM, sonner, lucide-react, @stripe/react-stripe-js`,

  casenarrative: `# ⚖️ CaseNarrative — Board-Approved Implementation Brief
Drop this into the CaseNarrative app AI assistant.
Date: April 2026 | Priority: #4 (Strongest AI foundation — extend rather than rebuild)
Architecture Rule: Build NATIVELY into THIS app only. No shared services. No external dependencies.

YOU ARE: AI assistant for CaseNarrative — SaaS for UK legal practitioners and insurance claims professionals.
Target customers: Solicitors, paralegals, insurance claims handlers, personal injury firms, employment law practices.
Pricing: £59/mo Starter | £149/mo Professional | £349/mo Enterprise

IMPLEMENT THESE IMPROVEMENTS IN ORDER:

1. ENHANCED AI LEGAL NARRATIVE BUILDER (CRITICAL — EXTEND EXISTING)
Enhance existing AI with: Structured Narrative Builder, Precedent Matching, Evidence Summarisation, Correspondence Drafting.
Use: base44.integrations.Core.InvokeLLM({ model: "claude_sonnet_4_6", prompt: "You are a senior UK solicitor specialising in [case_type]. Build a structured legal case narrative: Case Ref: [ref], Client: [name], Opponent: [name], Incident: [date], Facts: [facts], Evidence: [list], Instructions: [instructions]. Jurisdiction: England & Wales. Produce: Background & Parties, Chronology, Liability Analysis, Quantum Assessment, Legal Framework & Statutes, Recommended Actions, Risk Assessment.", response_json_schema: { type:"object", properties: { background_parties:{type:"string"}, chronology:{type:"string"}, liability_analysis:{type:"string"}, quantum_assessment:{type:"string"}, legal_framework:{type:"string"}, recommended_actions:{type:"array",items:{type:"string"}}, risk_assessment:{type:"string"}, applicable_statutes:{type:"array",items:{type:"string"}} } } })
NOTE: Use model:"claude_sonnet_4_6" for legal work — higher quality output, worth the extra AI credits.

2. SMART CASE SEARCH WITH LIMITATION DATE FILTER (HIGH — CRITICAL LEGAL COMPLIANCE)
Filters: search, case_type, case_status, assigned_fee_earner, limitation_date_within (30/60/90 days — CRITICAL), client_name, opponent_name, value_min/max.
The limitation date filter is a legal compliance tool — solicitors face negligence claims for missing limitation dates.

3. PRACTICE ANALYTICS DASHBOARD (HIGH)
KPIs: Active Cases, Cases Settled This Month + avg value, Limitation Dates in Next 30 Days (CRITICAL), Outstanding Client Actions, Average Case Duration.
Charts (recharts): new cases by month (bar), cases by type (pie), settlement value trend (line), fee earner workload (horizontal bar), case age distribution.

4. PDF LEGAL DOCUMENT EXPORT (HIGH)
Export types: full case narrative, evidence bundle index, chronology timeline, client care letter, settlement proposal, court bundle checklist.
Use html2canvas + jsPDF (already installed).

5. ONBOARDING WIZARD (HIGH)
3 steps: Create practice profile (firm name, SRA number, practice areas) → Open first case (type, client, incident date) → Configure limitation date alerts.
On complete: base44.auth.updateMe({ onboarding_complete: true })

6. STRIPE SUBSCRIPTION PAYWALL (CRITICAL)
Starter £59/mo: 10 active cases, basic narrative. Professional £149/mo: unlimited + full AI suite + PDF + 3 fee earners. Enterprise £349/mo: unlimited all + court bundle automation.
Gate AI narrative builder, precedent matching, PDF export behind Professional+.
Competitive note: Clio charges $49-99/user/mo. LEAP charges £100+/user/mo. CaseNarrative at £149/mo for the whole firm is highly competitive.

7. COMPLIANCE NOTIFICATIONS (MEDIUM — HIGH VALUE)
Alert types: ⚠️ Limitation date approaching (30/14/7/3/1 days — CRITICAL), client care letter not sent within 14 days, no client contact in 30 days, court deadline approaching, settlement authority not obtained.
The limitation date alert alone justifies subscription price for a solicitor.

ARCHITECTURE RULES: Standalone only. No imports from other apps. Preserve ALL existing AI and case management functionality. Test each feature before next.
PACKAGES AVAILABLE: recharts, html2canvas, jspdf, framer-motion, @tanstack/react-query, base44.integrations.Core.InvokeLLM (supports model:"claude_sonnet_4_6"), sonner, lucide-react, @stripe/react-stripe-js`
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
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">7 Board-Approved Improvements</div>
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