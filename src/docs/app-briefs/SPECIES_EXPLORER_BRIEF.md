# 🌿 Species Explorer — Board-Approved Implementation Brief
**Drop this file into the Species Explorer app's AI assistant to begin implementation.**
**Date:** April 2026 | **Priority:** #1 (First standalone sale candidate)
**Architecture Rule:** Every improvement below must be built NATIVELY into THIS app only. No shared services. No external dependencies on other portfolio apps.

---

## 🎯 WHO YOU ARE & WHAT THIS APP DOES

You are the AI assistant for **Species Explorer** — a production-ready SaaS platform for wildlife conservation professionals, zoos, universities, and environmental consultancies in the UK. The app manages species data, field survey records, sighting observations, and conservation research workflows.

**Target customers:** UK conservation organisations, zoological societies, Natural England, wildlife trusts, environmental consultancies, university research departments.
**Pricing:** £39/mo Starter | £99/mo Professional | £249/mo Enterprise

---

## 📋 BOARD-APPROVED IMPROVEMENTS — IMPLEMENT IN THIS ORDER

### 1. 🤖 AI Field Report Generation (CRITICAL)
**What to build:** A native AI assistant inside Species Explorer that auto-generates field survey reports, species observation summaries, and conservation status assessments.

**Where to add it:**
- Add an "AI Generate" button on the survey/observation detail page
- Add a "Generate Report" option when viewing species records
- Add AI narrative completion when filling in observation notes

**Code pattern to adapt (from SynergyFlow's InvokeLLM usage):**
```javascript
import { base44 } from "@/api/base44Client";

const generateFieldReport = async (observationData) => {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a professional wildlife conservation scientist. Generate a detailed field observation report for the following species data:
    
Species: ${observationData.species_name}
Location: ${observationData.location}
Date: ${observationData.observation_date}
Observer: ${observationData.observer_name}
Conditions: ${observationData.weather_conditions}
Observations: ${observationData.raw_notes}

Generate a structured professional report with: Executive Summary, Detailed Observations, Behavioural Notes, Conservation Status Assessment, and Recommended Actions.`,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        detailed_observations: { type: "string" },
        behavioural_notes: { type: "string" },
        conservation_assessment: { type: "string" },
        recommended_actions: { type: "array", items: { type: "string" } }
      }
    }
  });
  return result;
};
```

**Acceptance criteria:** User can click "AI Generate Report" on any observation, get a professional report within 10 seconds, copy or export it.

---

### 2. 🔍 Smart Species Search & Filtering (HIGH)
**What to build:** A powerful search bar and filter panel across all species and observation records.

**Where to add it:**
- Main species list page — add search bar at top
- Observations list — add filter sidebar
- Dashboard — add quick-search widget

**Code pattern to adapt:**
```javascript
// Filter state pattern used across SynergyFlow apps
const [filters, setFilters] = useState({
  search: '',
  conservation_status: 'all',      // e.g. 'endangered', 'vulnerable', 'least_concern'
  habitat_type: 'all',             // e.g. 'woodland', 'wetland', 'coastal'
  survey_date_from: '',
  survey_date_to: '',
  observer: 'all',
});

// Filter function
const filteredSpecies = species.filter(s => {
  const matchSearch = !filters.search || 
    s.common_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    s.scientific_name?.toLowerCase().includes(filters.search.toLowerCase());
  const matchStatus = filters.conservation_status === 'all' || s.conservation_status === filters.conservation_status;
  const matchHabitat = filters.habitat_type === 'all' || s.habitat_type === filters.habitat_type;
  return matchSearch && matchStatus && matchHabitat;
});
```

**Acceptance criteria:** User can search by common name, scientific name, filter by conservation status and habitat. Results update in real-time.

---

### 3. 📊 Analytics Dashboard (HIGH)
**What to build:** A rich home screen dashboard showing species and survey KPIs.

**Where to add it:** Replace or enhance the current home/dashboard page with chart components.

**Code pattern to adapt (recharts — already installed):**
```javascript
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sightings over time
const sightingsTrend = [
  { month: 'Jan', sightings: 12 },
  { month: 'Feb', sightings: 19 },
  // ... derive from your observations entity
];

// Conservation status distribution
const statusDistribution = [
  { name: 'Least Concern', value: 45, color: '#22c55e' },
  { name: 'Near Threatened', value: 18, color: '#f59e0b' },
  { name: 'Vulnerable', value: 12, color: '#f97316' },
  { name: 'Endangered', value: 8, color: '#ef4444' },
  { name: 'Critically Endangered', value: 3, color: '#7f1d1d' },
];

// KPI cards: Total Species Recorded, Surveys This Month, Active Researchers, Alerts
```

**Acceptance criteria:** Dashboard shows sightings trend (line chart), species by conservation status (pie chart), top 5 active survey areas (bar chart), and 4 KPI cards.

---

### 4. 📄 PDF Survey Report Export (HIGH)
**What to build:** Export any species survey or observation record as a professional PDF.

**Where to add it:** Add "Export PDF" button on survey detail pages and observation records.

**Code pattern to adapt (html2canvas + jsPDF — already installed):**
```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportSurveyPDF = async (surveyRef) => {
  const canvas = await html2canvas(surveyRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(`species-survey-${Date.now()}.pdf`);
};
```

**Acceptance criteria:** User clicks "Export PDF" on any survey, gets a formatted A4 PDF within 5 seconds.

---

### 5. 🚀 Onboarding Wizard — First-Time User Flow (HIGH)
**What to build:** A 3-step onboarding wizard shown to new users on first login.

**Steps:**
1. **Create your first Survey** — name, location, date, lead researcher
2. **Add your first Species Observation** — species name, sighting details, photo upload
3. **Invite a team member** — email invite

**Code pattern:**
```javascript
// Check if user has completed onboarding
const hasCompletedOnboarding = user?.onboarding_complete === true;

// Show wizard modal if not completed
// Step 1 → Step 2 → Step 3 → Mark complete: base44.auth.updateMe({ onboarding_complete: true })
```

**Acceptance criteria:** New user is guided through 3 steps. After completion, never shown again. Can skip.

---

### 6. 💳 Stripe Subscription & Paywall (CRITICAL)
**What to build:** Gate premium features behind a paid subscription. Enable Species Explorer to take its first paying customer.

**Tier structure:**
- **Starter £39/mo:** Up to 3 surveys, 50 species records, basic export
- **Professional £99/mo:** Unlimited surveys, AI reports, PDF export, team seats (up to 5)
- **Enterprise £249/mo:** Unlimited everything, API access, priority support

**Features to gate behind Professional+:**
- AI Field Report generation
- PDF export
- Team member invites (>1 user)
- Advanced analytics dashboard

**Code pattern:**
```javascript
// Check subscription tier from user record
const isProfessional = user?.subscription_tier === 'professional' || user?.subscription_tier === 'enterprise';

// Gate component
{isProfessional ? (
  <AIReportButton />
) : (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
    <p className="text-sm text-amber-800">AI Reports are available on the Professional plan (£99/mo)</p>
    <Button onClick={() => navigate('/upgrade')}>Upgrade Now</Button>
  </div>
)}
```

**Acceptance criteria:** Free tier works with limits. Professional features show upgrade prompt for free users. Stripe checkout completes and updates user tier.

---

### 7. 🔔 In-App Notifications & Alerts (MEDIUM)
**What to build:** A notification bell in the navbar that surfaces important alerts native to Species Explorer.

**Alert types to implement:**
- Survey deadline approaching (configurable)
- New observation added by team member
- Species conservation status changed
- Export ready

**Code pattern:**
```javascript
// Notification entity (create in Species Explorer's own schema)
// { user_id, type, message, read: false, created_date }

// Navbar bell with unread count
const unreadCount = notifications.filter(n => !n.read).length;

// Mark all read on open
const markAllRead = () => {
  notifications.forEach(n => base44.entities.Notification.update(n.id, { read: true }));
};
```

---

## 🏗️ ARCHITECTURE RULES — READ BEFORE IMPLEMENTING

1. **This app must work 100% standalone.** Do NOT import anything from another portfolio app (Premiso, CharityHub, CaseNarrative, SynergyFlow).
2. **Every feature above is built natively in THIS app.** If a pattern came from another app, you copy and adapt the logic — you do not call that app's API.
3. **This is the #1 priority sale candidate.** Every improvement should make Species Explorer more polished, more complete, and more impressive to a buyer examining it independently.
4. **Test each feature before moving to the next.** Implement → test in preview → confirm working → move on.
5. **Do not break existing functionality.** If the app currently has working species records, surveys, or user flows — preserve them completely.

---

## 📦 PACKAGES ALREADY AVAILABLE (no install needed)
- `recharts` — charts and analytics
- `html2canvas` + `jspdf` — PDF export
- `framer-motion` — animations
- `@tanstack/react-query` — data fetching
- `base44.integrations.Core.InvokeLLM` — AI generation
- `sonner` — toast notifications
- `lucide-react` — icons
- `@stripe/react-stripe-js` — payments

---

## ✅ IMPLEMENTATION SEQUENCE
Implement in this exact order. Test each before proceeding:
1. Analytics Dashboard (visible value immediately)
2. Smart Search & Filtering (core usability)  
3. AI Field Report Generation (headline feature)
4. PDF Export (professional credibility)
5. Stripe Subscription (commercial readiness)
6. Onboarding Wizard (conversion)
7. Notifications (polish)

**When complete:** Species Explorer is a fully featured, independently saleable SaaS product ready for market.