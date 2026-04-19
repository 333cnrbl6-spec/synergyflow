# 🏠 Premiso — Board-Approved Implementation Brief
**Drop this file into the Premiso app's AI assistant to begin implementation.**
**Date:** April 2026 | **Priority:** #2 (Second app in rollout sequence)
**Architecture Rule:** Every improvement below must be built NATIVELY into THIS app only. No shared services. No external dependencies on other portfolio apps.

---

## 🎯 WHO YOU ARE & WHAT THIS APP DOES

You are the AI assistant for **Premiso** — a production-ready SaaS platform for UK property professionals. The app manages property portfolios, tenancy agreements, rent collection, maintenance requests, and landlord compliance workflows.

**Target customers:** UK private landlords (2.65M+), letting agencies (15,000+), estate managers, property portfolio investors.
**Pricing:** £49/mo Starter | £129/mo Professional | £299/mo Enterprise

---

## 📋 BOARD-APPROVED IMPROVEMENTS — IMPLEMENT IN THIS ORDER

### 1. 🤖 AI Document Intelligence (CRITICAL)
**What to build:** Native AI assistant that auto-generates tenancy documents, inspection reports, and landlord notices.

**Where to add it:**
- "AI Draft" button on tenancy agreement creation
- "Generate Inspection Report" on property inspection pages
- "Draft Notice" button for section 21/8 notices, rent increase letters

**Code pattern to adapt:**
```javascript
import { base44 } from "@/api/base44Client";

const generateTenancyDocument = async (tenancyData) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a UK property law expert and letting agent. Generate a professional ${tenancyData.document_type} for:

Property: ${tenancyData.property_address}
Landlord: ${tenancyData.landlord_name}
Tenant(s): ${tenancyData.tenant_names}
Tenancy Start: ${tenancyData.start_date}
Monthly Rent: £${tenancyData.monthly_rent}
Deposit: £${tenancyData.deposit_amount}
Special Conditions: ${tenancyData.special_conditions}

Generate a complete, legally-worded document compliant with current UK housing law including relevant statutory obligations.`,
    response_json_schema: {
      type: "object",
      properties: {
        document_title: { type: "string" },
        document_body: { type: "string" },
        key_clauses: { type: "array", items: { type: "string" } },
        compliance_notes: { type: "string" }
      }
    }
  });
  return result;
};
```

**Acceptance criteria:** User can generate a tenancy notice or inspection report draft within 10 seconds. Output is editable before saving/printing.

---

### 2. 🔍 Smart Property Search & Filtering (HIGH)
**What to build:** Powerful search across properties, tenants, and maintenance records.

**Filter options for Premiso:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  property_status: 'all',       // 'occupied', 'vacant', 'maintenance'
  rent_status: 'all',           // 'current', 'overdue', 'partial'
  postcode_area: '',
  tenancy_expiring_days: 'all', // 30, 60, 90 days
  property_type: 'all',         // 'flat', 'house', 'hmo', 'commercial'
});
```

**Acceptance criteria:** Landlord can instantly find all properties with overdue rent, or all tenancies expiring in 30 days.

---

### 3. 📊 Portfolio Analytics Dashboard (HIGH)
**What to build:** Financial and operational KPI dashboard for property portfolios.

**Metrics to show:**
```javascript
// KPI Cards
// - Total Portfolio Value (estimated)
// - Monthly Rent Collection Rate (%)
// - Vacant Properties (count + %)
// - Open Maintenance Requests (count)
// - Tenancies Expiring This Month

// Charts (recharts):
// - Rent collection by month (bar chart — last 6 months)
// - Property occupancy rate over time (line chart)
// - Maintenance requests by type (pie chart)
// - Yield by property (horizontal bar chart)
```

**Acceptance criteria:** Dashboard gives landlord an instant financial health overview of their portfolio.

---

### 4. 📄 PDF Document Export (HIGH)
**What to build:** Export tenancy agreements, inspection reports, and rent statements as professional PDFs.

**Code pattern (html2canvas + jsPDF — same pattern as SynergyFlow):**
```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportDocumentPDF = async (documentRef, filename) => {
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
  pdf.save(filename);
};
```

---

### 5. 🚀 Onboarding Wizard (HIGH)
**3-step first-time user flow:**
1. **Add your first property** — address, type, bedrooms, estimated value
2. **Add your first tenant** — name, email, tenancy start, monthly rent
3. **Set up rent collection** — due day of month, bank details or Stripe

```javascript
// Mark complete: base44.auth.updateMe({ onboarding_complete: true })
```

---

### 6. 💳 Stripe Subscription & Paywall (CRITICAL)
**Tier structure:**
- **Starter £49/mo:** Up to 3 properties, basic rent tracking, manual documents
- **Professional £129/mo:** Unlimited properties, AI document drafting, PDF export, maintenance workflow
- **Enterprise £299/mo:** Unlimited everything, multi-user, HMO tools, API access

**Gate behind Professional+:** AI document drafting, PDF export, bulk operations, advanced analytics.

---

### 7. 🔔 Smart Alerts & Notifications (MEDIUM)
**Alert types native to Premiso:**
- Rent overdue (tenant X, property Y, N days overdue)
- Tenancy expiring in 30/60/90 days
- Maintenance request raised by tenant
- Gas safety certificate expiring
- EPC expiry approaching

---

## 🏗️ ARCHITECTURE RULES
1. **Standalone only.** Do NOT depend on Species Explorer, CharityHub, CaseNarrative, or SynergyFlow at runtime.
2. **Copy patterns, don't import.** Code patterns above are adapted from the portfolio — replicate natively in Premiso.
3. **Preserve existing functionality.** All current property/tenancy management features must continue working.
4. **Test each feature before the next.**

## 📦 PACKAGES AVAILABLE (no install needed)
`recharts`, `html2canvas`, `jspdf`, `framer-motion`, `@tanstack/react-query`, `base44.integrations.Core.InvokeLLM`, `sonner`, `lucide-react`, `@stripe/react-stripe-js`

## ✅ IMPLEMENTATION SEQUENCE
1. Analytics Dashboard → 2. Smart Search → 3. AI Document Intelligence → 4. PDF Export → 5. Stripe Subscription → 6. Onboarding Wizard → 7. Notifications