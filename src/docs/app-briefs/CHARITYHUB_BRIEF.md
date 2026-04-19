# 💛 CharityHub — Board-Approved Implementation Brief
**Drop this file into the CharityHub app's AI assistant to begin implementation.**
**Date:** April 2026 | **Priority:** #3 (Third app in rollout sequence)
**Architecture Rule:** Every improvement below must be built NATIVELY into THIS app only. No shared services. No external dependencies on other portfolio apps.

---

## 🎯 WHO YOU ARE & WHAT THIS APP DOES

You are the AI assistant for **CharityHub** — a production-ready SaaS platform for UK charities and third-sector organisations. The app manages volunteers, donors, fundraising campaigns, grant applications, and Charity Commission compliance workflows.

**Target customers:** 168,000 registered charities in England & Wales, charitable incorporated organisations, community interest companies, voluntary sector organisations.
**Pricing:** £29/mo Starter | £79/mo Professional | £199/mo Enterprise

---

## 📋 BOARD-APPROVED IMPROVEMENTS — IMPLEMENT IN THIS ORDER

### 1. 🤖 AI Grant Application & Communications Assistant (CRITICAL)
**What to build:** Native AI that drafts grant applications, donor thank-you letters, volunteer recruitment posts, and annual report sections.

**Where to add it:**
- "AI Draft Application" button on grant opportunity records
- "Generate Thank You Letter" on donation records
- "Draft Campaign Description" on fundraising campaign creation
- "Write Annual Report Section" in reporting module

**Code pattern to adapt:**
```javascript
import { base44 } from "@/api/base44Client";

const generateGrantApplication = async (grantData) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an experienced charity fundraising professional specialising in UK grant applications. 
    
Write a compelling grant application for:

Charity Name: ${grantData.charity_name}
Charity Number: ${grantData.charity_number}
Grant Fund: ${grantData.grant_name} (${grantData.funder_name})
Grant Amount Requested: £${grantData.amount_requested}
Project Title: ${grantData.project_title}
Project Description: ${grantData.project_description}
Beneficiaries: ${grantData.beneficiaries}
Outcomes: ${grantData.intended_outcomes}
Budget Summary: ${grantData.budget_summary}

Write a structured application with: Executive Summary, Need Statement, Project Description, Outcomes & Impact, Organisation Background, and Budget Justification. Tone: professional, evidence-based, outcomes-focused.`,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        need_statement: { type: "string" },
        project_description: { type: "string" },
        outcomes_impact: { type: "string" },
        organisation_background: { type: "string" },
        budget_justification: { type: "string" }
      }
    }
  });
  return result;
};
```

**Acceptance criteria:** Charity manager can generate a full grant application draft in under 30 seconds. Output is editable and saveable.

---

### 2. 🔍 Smart Search Across Donors, Volunteers & Campaigns (HIGH)
**Filter options for CharityHub:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  entity_type: 'all',          // 'donor', 'volunteer', 'campaign', 'grant'
  donor_status: 'all',         // 'active', 'lapsed', 'major_donor'
  volunteer_availability: 'all',
  campaign_status: 'all',      // 'active', 'completed', 'draft'
  donation_amount_min: '',
  donation_amount_max: '',
  date_from: '',
  date_to: '',
});
```

**Acceptance criteria:** Charity manager can find all lapsed donors from the last 12 months, or all available volunteers for a specific date.

---

### 3. 📊 Impact & Fundraising Analytics Dashboard (HIGH)
**Metrics to show:**
```javascript
// KPI Cards:
// - Total Funds Raised (YTD)
// - Active Volunteers (count)
// - Donor Retention Rate (%)
// - Open Grant Applications (count + total value)
// - Upcoming Campaign Deadlines

// Charts (recharts):
// - Monthly donations trend (area chart)
// - Donor acquisition by source (pie chart: events, online, direct mail, major gifts)
// - Volunteer hours by month (bar chart)
// - Grant pipeline funnel (applied → shortlisted → awarded → received)
// - Campaign performance comparison (horizontal bar)
```

---

### 4. 📄 PDF Annual Report & Campaign Report Export (HIGH)
**What to build:** Export formatted reports for Charity Commission filing, trustee meetings, and donor reporting.

```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportAnnualReport = async (reportRef) => {
  const canvas = await html2canvas(reportRef.current, {
    scale: 2, useCORS: true, backgroundColor: '#ffffff',
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const imgH = (canvas.height * pageW) / canvas.width;
  let heightLeft = imgH, position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
  heightLeft -= pdf.internal.pageSize.getHeight();
  while (heightLeft > 0) {
    position -= pdf.internal.pageSize.getHeight();
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }
  pdf.save(`charityhub-report-${Date.now()}.pdf`);
};
```

**Export types needed:** Annual impact report, donor statement, campaign summary, volunteer activity log, grant pipeline report.

---

### 5. 🚀 Onboarding Wizard (HIGH)
**3-step first-time flow:**
1. **Set up your charity profile** — name, charity number, registered address, cause area
2. **Add your first campaign** — title, target amount, deadline, description
3. **Invite a trustee or volunteer** — email, role

```javascript
// Mark complete: base44.auth.updateMe({ onboarding_complete: true })
```

---

### 6. 💳 Stripe Subscription & Paywall (CRITICAL)
**Tier structure:**
- **Starter £29/mo:** 1 campaign, 50 donors, 10 volunteers, basic reports
- **Professional £79/mo:** Unlimited campaigns, AI grant assistant, PDF export, 5 team seats
- **Enterprise £199/mo:** Unlimited everything, Charity Commission integration, API, priority support

**Gate behind Professional+:** AI grant applications, AI donor letters, PDF annual reports, advanced analytics, bulk communications.

---

### 7. 🔔 Smart Alerts & Notifications (MEDIUM)
**Alert types native to CharityHub:**
- Donor lapsed (no donation in X months)
- Grant application deadline approaching
- Campaign target milestone reached (25%, 50%, 75%, 100%)
- Volunteer shift uncovered
- Trustee meeting due
- Charity Commission filing deadline

---

## 🏗️ ARCHITECTURE RULES
1. **Standalone only.** Do NOT depend on Species Explorer, Premiso, CaseNarrative, or SynergyFlow at runtime.
2. **Copy patterns, don't import.** All code patterns above are adapted for CharityHub's domain — build natively.
3. **Preserve existing functionality.** All current volunteer/donor/campaign management must continue working.
4. **Test each feature before the next.**

## 📦 PACKAGES AVAILABLE (no install needed)
`recharts`, `html2canvas`, `jspdf`, `framer-motion`, `@tanstack/react-query`, `base44.integrations.Core.InvokeLLM`, `sonner`, `lucide-react`, `@stripe/react-stripe-js`

## ✅ IMPLEMENTATION SEQUENCE
1. Analytics Dashboard → 2. Smart Search → 3. AI Grant Assistant → 4. PDF Export → 5. Stripe Subscription → 6. Onboarding Wizard → 7. Notifications