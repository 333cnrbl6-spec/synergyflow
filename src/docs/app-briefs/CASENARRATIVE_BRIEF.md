# ⚖️ CaseNarrative — Board-Approved Implementation Brief
**Drop this file into the CaseNarrative app's AI assistant to begin implementation.**
**Date:** April 2026 | **Priority:** #4 (Fourth app in rollout sequence — already has strongest AI foundation)
**Architecture Rule:** Every improvement below must be built NATIVELY into THIS app only. No shared services. No external dependencies on other portfolio apps.

---

## 🎯 WHO YOU ARE & WHAT THIS APP DOES

You are the AI assistant for **CaseNarrative** — a production-ready SaaS platform for UK legal practitioners and insurance claims professionals. The app manages case files, builds structured legal narratives from evidence, assists with document drafting, and manages client workflows.

**Target customers:** Solicitors, barristers, paralegals, insurance claims handlers, personal injury firms, employment law practices, 200,000+ UK legal professionals.
**Pricing:** £59/mo Starter | £149/mo Professional | £349/mo Enterprise

---

## 📋 BOARD-APPROVED IMPROVEMENTS — IMPLEMENT IN THIS ORDER

### 1. 🤖 Enhanced AI Narrative & Document Intelligence (CRITICAL)
**CaseNarrative likely already has some AI. Enhance and extend it with:**

**New AI capabilities to add:**
- **Structured Narrative Builder** — given chronological facts, auto-build a legal narrative with proper structure (background, liability, quantum, remedy)
- **Precedent Matching** — given case type and facts, suggest applicable legal precedents and statutes
- **Evidence Summarisation** — paste in a document or description, get a concise legal summary
- **Correspondence Drafting** — draft letters before action, settlement proposals, client update letters

**Enhanced code pattern:**
```javascript
import { base44 } from "@/api/base44Client";

const buildLegalNarrative = async (caseData) => {
  const result = await base44.integrations.Core.InvokeLLM({
    model: "claude_sonnet_4_6",  // Use higher quality model for legal work
    prompt: `You are a senior UK solicitor specialising in ${caseData.case_type}. 

Build a structured legal case narrative from the following facts:

Case Reference: ${caseData.case_ref}
Case Type: ${caseData.case_type}
Client: ${caseData.client_name}
Opponent: ${caseData.opponent_name}
Incident Date: ${caseData.incident_date}
Chronological Facts: ${caseData.facts}
Evidence Available: ${caseData.evidence_list}
Client Instructions: ${caseData.client_instructions}
Applicable Jurisdiction: England & Wales

Produce a structured narrative with:
1. Background & Parties
2. Chronology of Events  
3. Liability Analysis
4. Quantum Assessment
5. Legal Framework & Applicable Statutes
6. Recommended Course of Action
7. Risk Assessment

Use precise legal language appropriate for a solicitor's file note.`,
    response_json_schema: {
      type: "object",
      properties: {
        background_parties: { type: "string" },
        chronology: { type: "string" },
        liability_analysis: { type: "string" },
        quantum_assessment: { type: "string" },
        legal_framework: { type: "string" },
        recommended_actions: { type: "array", items: { type: "string" } },
        risk_assessment: { type: "string" },
        applicable_statutes: { type: "array", items: { type: "string" } }
      }
    }
  });
  return result;
};

// Correspondence drafting
const draftLegalLetter = async (letterData) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Draft a ${letterData.letter_type} on behalf of ${letterData.client_name} 
    addressed to ${letterData.recipient}. Case: ${letterData.case_summary}. 
    Key points to include: ${letterData.key_points}. 
    Tone: ${letterData.tone}. Jurisdiction: England & Wales.`,
  });
  return result;
};
```

**Note:** CaseNarrative justifies the `claude_sonnet_4_6` model for legal accuracy — it uses more AI credits but the output quality is significantly better for legal work.

---

### 2. 🔍 Smart Case Search & Matter Filtering (HIGH)
**Filter options for CaseNarrative:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  case_type: 'all',            // 'personal_injury', 'employment', 'property', 'family', 'commercial'
  case_status: 'all',          // 'active', 'settled', 'closed', 'on_hold'
  assigned_fee_earner: 'all',
  limitation_date_within: 'all', // 30, 60, 90 days — CRITICAL for legal compliance
  client_name: '',
  opponent_name: '',
  date_opened_from: '',
  date_opened_to: '',
  value_min: '',
  value_max: '',
});
```

**Critical feature:** Filter by limitation date approaching — this is a legal compliance necessity that buyers will value highly.

---

### 3. 📊 Practice Analytics Dashboard (HIGH)
**Metrics for legal practice:**
```javascript
// KPI Cards:
// - Active Cases (total)
// - Cases Settled This Month (+ avg settlement value)
// - Limitation Dates in Next 30 Days (CRITICAL alert)
// - Outstanding Client Actions (count)
// - Average Case Duration (days)

// Charts (recharts):
// - New cases by month (bar chart — last 12 months)
// - Cases by type distribution (pie chart)
// - Settlement value trend (line chart)
// - Fee earner workload (horizontal bar — cases per person)
// - Case age distribution (histogram: 0-30, 30-90, 90-180, 180+ days)
```

---

### 4. 📄 Legal Document PDF Export (HIGH)
**Export types for CaseNarrative:**
- Full case narrative (structured legal document)
- Evidence bundle index
- Chronology timeline
- Client care letter
- Settlement proposal
- Court bundle preparation checklist

```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportCaseDocument = async (documentRef, caseRef, docType) => {
  const canvas = await html2canvas(documentRef.current, {
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
  pdf.save(`${caseRef}-${docType}-${Date.now()}.pdf`);
};
```

---

### 5. 🚀 Onboarding Wizard (HIGH)
**3-step first-time flow for legal professionals:**
1. **Create your practice profile** — firm name, SRA number, practice areas, jurisdiction
2. **Open your first case** — case type, client details, incident date, initial instructions
3. **Set limitation date alert** — configure how many days' warning for upcoming limitation dates

```javascript
// Mark complete: base44.auth.updateMe({ onboarding_complete: true })
```

---

### 6. 💳 Stripe Subscription & Paywall (CRITICAL)
**Tier structure:**
- **Starter £59/mo:** Up to 10 active cases, basic narrative builder, manual documents
- **Professional £149/mo:** Unlimited cases, full AI narrative suite, PDF export, 3 fee earners
- **Enterprise £349/mo:** Unlimited everything, multi-office, API access, court bundle automation, priority support

**Gate behind Professional+:** AI narrative builder, precedent matching, correspondence drafting, PDF export, advanced analytics, limitation date alerts.

**Note:** Legal professionals have high willingness to pay — the £149/mo Professional tier is very competitive vs. existing legal software (Clio: $49-99/user, LEAP: £100+/user/mo).

---

### 7. 🔔 Smart Alerts & Legal Compliance Notifications (MEDIUM)
**Alert types native to CaseNarrative — many are legal compliance obligations:**
- ⚠️ **Limitation date approaching** (30/14/7/3/1 days — CRITICAL)
- Client care letter not sent within 14 days of instruction
- No client contact in last 30 days
- Opponent response overdue
- Court deadline approaching
- Settlement authority not obtained
- File review due

**The limitation date alert is a genuine compliance tool** — solicitors can face negligence claims for missing limitation. This feature alone justifies the subscription price.

---

## 🏗️ ARCHITECTURE RULES
1. **Standalone only.** Do NOT depend on Species Explorer, Premiso, CharityHub, or SynergyFlow at runtime.
2. **This app has the strongest AI foundation** — extend it further rather than rebuild from scratch.
3. **Legal accuracy matters** — use `model: "claude_sonnet_4_6"` for narrative generation where quality is critical.
4. **Preserve existing functionality.** All current case management, document handling, and user flows must continue working exactly as before.
5. **Test each feature before the next.**

## 📦 PACKAGES AVAILABLE (no install needed)
`recharts`, `html2canvas`, `jspdf`, `framer-motion`, `@tanstack/react-query`, `base44.integrations.Core.InvokeLLM` (supports `model: "claude_sonnet_4_6"`), `sonner`, `lucide-react`, `@stripe/react-stripe-js`

## ✅ IMPLEMENTATION SEQUENCE
1. Enhanced AI Narrative Builder (extend existing) → 2. Smart Case Search with limitation date filter → 3. Practice Analytics Dashboard → 4. PDF Legal Document Export → 5. Stripe Subscription → 6. Onboarding Wizard → 7. Compliance Notifications (limitation alerts)

## 💡 COMPETITIVE POSITIONING NOTE
CaseNarrative with AI narrative building + limitation date alerts + PDF bundle export at £149/mo is **significantly cheaper** than Clio, LEAP, or Osprey. This is the strongest commercial story in the portfolio.