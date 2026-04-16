# APP PROFILE: CaseNarrative

## Overview
CaseNarrative is a professional case analysis and evidence management platform designed for building factual, evidence-backed narratives in complex disputes. It synthesizes incident reports, communications, and evidence into structured case documentation for legal action.

**Current Status:** MVP ready for commercial testing  
**Development Stage:** Fully functional prototype with core features complete  
**Target Launch:** Q2 2026

---

## Core Functions

### 1. Evidence Management
- Upload and categorize evidence (documents, communications, reports, photographs, recordings, valuations)
- Evidence types: `document`, `communication`, `report`, `valuation`, `contract`, `witness_statement`, `photograph`, `recording_transcript`, `other`
- Evidence strength ratings: `weak`, `moderate`, `strong`, `critical`
- Relevance categorization: `RICS_violation`, `legal_violation`, `pattern`, `credibility`, `context`, `other`
- File storage with URLs and searchable metadata

### 2. Incident Logging
- Record incident events with dates, descriptions, and witnesses
- Incident types: `communication`, `professional_conduct`, `document_issue`, `gatekeeping`, `information_control`, `harassment`, `other`
- Severity levels: `low`, `medium`, `high`, `critical`
- Link incidents to RICS Code violations and potential legal issues
- Status tracking: `open`, `reviewed`, `assessed`, `escalated`

### 3. Communications Tracking
- Log all communications (email, letter, phone_call, in_person, message, other)
- Tone assessment: `neutral`, `professional`, `dismissive`, `aggressive`, `threatening`, `unprofessional`
- Capture concerning elements and witness lists
- Link communications to related incidents

### 4. Case Party Management
- Track persons, companies, properties, organizations involved in the case
- Party types: `person`, `company`, `location`, `property`, `organisation`, `other`
- Information gaps tracking (auto-filled from evidence)
- Automated background verification via LLM search
- Confirmation workflow for party details

### 5. RICS Assessment
- Analyze surveyor conduct against RICS Professional Standards
- Track violations and misconduct patterns
- Profile RICS surveyors (registration, disciplinary history, qualifications)
- Evidence-linking to violations
- Generates compliance reports

### 6. Legal Analysis
- Identify potential legal violations from evidence
- Cross-reference incidents with legal theories
- Build legal risk assessment
- Evidence clustering by legal theory

### 7. Case Narrative Generation
- Chronological synthesis of all case elements
- Grouped by case phases (Engagement & Scope, Commissioning Concerns, etc.)
- Includes evidence snippets, communication excerpts, incident summaries
- Damage analysis with financial impact charts
- Export-ready professional document format

### 8. Narrative Query Resolution
- Sequential, guided evidence-based decision workflow
- Resolves specific factual queries one at a time
- Provides supporting evidence and incident context
- Tracks user answers and completion status
- Completion confirmation with export option

### 9. Legal Action Bundle
- Final exportable package for legal proceedings
- Structured evidence compilation
- Professional formatting ready for submission

### 10. Bundle Processor
- Batch PDF upload and processing
- AI-based document fragment extraction
- Metadata extraction (parties, dates, summaries)
- Processing status tracking

---

## Data Model (Entities)

### Incident
```
- id (auto)
- created_date (auto)
- date: date
- title: string
- description: string
- incident_type: enum [communication, professional_conduct, document_issue, gatekeeping, information_control, harassment, other]
- severity: enum [low, medium, high, critical]
- witnesses: array of strings
- evidence_notes: string
- rics_violations: array of strings
- legal_issues: array of strings
- status: enum [open, reviewed, assessed, escalated]
```

### Communication
```
- id (auto)
- created_date (auto)
- date: date
- type: enum [email, letter, phone_call, in_person, message, other]
- from: string
- to: string
- subject: string
- content: string
- file_url: string
- tone: enum [neutral, professional, dismissive, aggressive, threatening, unprofessional]
- concerning_elements: string
- witnesses: array of strings
- related_incidents: array of incident IDs
```

### Evidence
```
- id (auto)
- created_date (auto)
- date_collected: date
- title: string
- description: string
- evidence_type: enum [document, communication, report, valuation, contract, witness_statement, photograph, recording_transcript, other]
- file_url: string
- relevance: enum [RICS_violation, legal_violation, pattern, credibility, context, other]
- related_incidents: array of incident IDs
- strength: enum [weak, moderate, strong, critical]
- notes: string
```

### CaseParty
```
- id (auto)
- created_date (auto)
- name: string
- party_type: enum [person, company, location, property, organisation, other]
- role_in_case: string
- confirmed: boolean
- contact_details: string
- address: string
- relationship_to: array of party IDs
- notes: string
- first_mentioned_in: incident/evidence ID
- information_gaps: array of strings (auto-filled)
```

### RICSSurveyorProfile
```
- id (auto)
- created_date (auto)
- surveyor_name: string
- rics_registration_number: string
- specialism: string
- qualifications: array of strings
- disciplinary_history: string
- scope_of_work: string
- years_in_profession: integer
- notes: string
```

---

## Key Workflows

1. **Evidence Pipeline**
   - Upload Evidence → Auto-categorize → Link to Incidents/Communications → Strength Rating

2. **Party Management**
   - Party Detected → Background Verification → User Confirmation → Track in Timeline

3. **Case Building**
   - Log Incidents → Log Communications → Upload Evidence → Cross-Link Data

4. **Narrative Generation**
   - Synthesize All Data → Generate Chronological Timeline → Export Document

5. **Query Resolution**
   - User asks Factual Question → AI Finds Supporting Evidence → Present Step-by-Step → Export Answers

---

## Backend Functions

| Function | Purpose | Triggers |
|----------|---------|----------|
| `verifyPartyDetails` | LLM-based background verification for case parties | On party creation |
| `generateCaseSummary` | Synthesizes case data into structured summary | Manual trigger |
| `generateLegalActionBundle` | Produces final export package for legal proceedings | Manual trigger |
| `processBundleFragment` | Extracts metadata from PDF fragments | Bundle processor upload |
| `analyseEvidencePDF` | Deep analysis of evidence documents (text, tables, metadata) | Evidence upload |
| `uploadLargeFile` | Handles large file uploads (>100MB) | File manager |
| `validateFileUpload` | File validation pipeline (format, size, type) | Pre-upload |

---

## Navigation Structure

```
CaseNarrative Dashboard
├── Home (overview, metrics, quick links)
├── Incidents (create, view, link evidence)
├── Communications (log, track, analyze tone)
├── Evidence (upload, categorize, link)
├── Scanner (batch PDF upload & processing)
├── RICS Assessment (violations tracking)
├── Legal Analysis (legal theory mapping)
├── Case Narrative (chronological synthesis)
├── Action Bundle (final legal package)
└── Bundle Processor (PDF batch processing)
```

---

## Commercial Considerations

### Target Users
- Surveyors in disputes
- Legal professionals (lawyers, solicitors)
- Contractors in property disputes
- Property professionals
- Insurance adjusters
- Expert witnesses

### Value Proposition
- **Reduces** time to build professional case narratives (60-70% faster)
- **Automates** evidence synthesis and organization
- **Improves** legal case quality through systematic analysis
- **Eliminates** manual document compilation errors
- **Strengthens** evidence presentation for legal action

### Monetization Features

**Free Tier**
- 1 active case
- 50 evidence items
- Basic PDF export
- Community support

**Professional Tier** ($99/month)
- 5 active cases
- Unlimited evidence
- Multiple export formats (PDF, Word, HTML)
- Advanced verification searches
- Priority email support
- Narrative query resolution

**Enterprise Tier** (Custom)
- Unlimited cases
- Custom field mapping
- API access
- Dedicated account manager
- 24/7 priority support
- Custom integrations with legal platforms

### Key Differentiators
1. Evidence-first approach (not narrative-first)
2. Automated RICS violation tracking
3. LLM-powered background verification
4. Structured query resolution (not free-form)
5. Export-ready professional formatting
6. Batch processing capabilities

### Licensing Model
- Per-user subscription
- Team discounts (3+ users = 20% off)
- Annual billing option (2 months free)

---

## Integration with Hub

### Hub Routes
```
/case-narrative (public landing)
/case-narrative/app (protected - requires "case_narrative" in subscription)
/case-narrative/docs (public documentation)
```

### Subscription Entitlements
- `case_narrative` app name in AppSubscription.apps_included

### Hub Integration Code
```javascript
// In App.jsx of Hub
import CaseNarrativeDocs from './pages/CaseNarrativeDocs';
import { ProtectedAppRoute } from '@/components/ProtectedAppRoute';

// In Routes:
<Route path="/case-narrative" element={<CaseNarrativeDocs />} />
<Route 
  path="/case-narrative/app" 
  element={<ProtectedAppRoute appName="case_narrative" element={<CaseNarrativeApp />} />}
/>
```

---

## Technical Requirements
- React 18+
- Base44 SDK for entity management
- LLM integration (InvokeLLM) for verification & analysis
- File storage (Base44 integrations)
- PDF processing library

---

## Development Timeline
- **Phase 1 (Complete):** Core entities, incident/communication/evidence logging, party tracking
- **Phase 2 (In Progress):** RICS assessment, legal analysis, narrative generation
- **Phase 3 (Planned):** Bundle processor, export optimization, query resolution
- **Phase 4 (Q2 2026):** Commercial launch, pricing integration, team features

---

**Last Updated:** April 16, 2026  
**App Status:** MVP Ready  
**Next Review:** May 1, 2026