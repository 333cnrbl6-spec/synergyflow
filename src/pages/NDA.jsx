import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Shield, AlertTriangle, Download, Lock } from 'lucide-react';

const COMPANY_NAME = "SynergyFlow Group Ltd";
const COMPANY_NUMBER = "[COMPANY_NUMBER_TO_BE_INSERTED]";
const COMPANY_ADDRESS = "[REGISTERED_OFFICE_ADDRESS_TO_BE_INSERTED]";
const EFFECTIVE_DATE = "28 April 2026";

const PRODUCTS = [
  { name: "DataWinder", description: "Conservation & biodiversity intelligence platform" },
  { name: "Premiso", description: "Property portfolio management platform" },
  { name: "CharityHub", description: "Charity operations management platform" },
  { name: "CaseNarrative", description: "AI-powered legal case documentation platform" },
];

const NDA_TEXT = `NON-DISCLOSURE AGREEMENT (MULTI-PRODUCT TRIAL & ACCESS)

This Non-Disclosure Agreement ("Agreement") is entered into as of the date of electronic acceptance ("Effective Date") between:

DISCLOSING PARTY:
${COMPANY_NAME}, a company incorporated and registered in England and Wales under company number ${COMPANY_NUMBER}, with a registered office at ${COMPANY_ADDRESS} ("Company"), and its affiliated entities, subsidiaries, officers, directors, employees, contractors, and agents.

RECEIVING PARTY:
The individual or organisation accessing the trial, test, or free-access version of one or more of the Company's software platforms ("Recipient"), as identified upon registration or sign-up.

COLLECTIVELY referred to as the "Parties."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECITALS

WHEREAS, the Company has developed and continues to develop proprietary software platforms including, but not limited to: DataWinder, Premiso, CharityHub, and CaseNarrative (collectively, the "Platforms"), together with associated technologies, artificial intelligence systems, algorithms, data models, workflows, business methodologies, and commercial strategies;

WHEREAS, the Recipient wishes to access one or more of the Platforms on a trial, test, or free-access basis for the purpose of evaluating such Platforms ("Permitted Purpose");

WHEREAS, in the course of such access, the Recipient will necessarily be exposed to Confidential Information belonging to the Company;

NOW, THEREFORE, in consideration of the mutual covenants herein and other good and valuable consideration, the sufficiency of which is acknowledged, the Parties agree as follows:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DEFINITION OF CONFIDENTIAL INFORMATION

1.1 "Confidential Information" means any and all information, data, materials, or knowledge — in whatever form or medium, whether oral, written, electronic, visual, or otherwise — disclosed by or on behalf of the Company to the Recipient, or accessed by the Recipient in connection with the Platforms, including but not limited to:

(a) TECHNICAL INFORMATION: source code, object code, algorithms, machine learning models, artificial intelligence architectures, training data, data pipelines, APIs, database schemas, system architectures, software design documents, technical specifications, product roadmaps, prototypes, wireframes, and all other technical materials;

(b) TRADE SECRETS: any formula, pattern, compilation, program, device, method, technique, or process that derives independent economic value from not being generally known, including proprietary AI prompt engineering, model fine-tuning methods, and data processing methodologies;

(c) BUSINESS INFORMATION: business plans, financial projections, revenue models, pricing strategies, customer lists, prospect lists, sales pipelines, marketing strategies, partnership agreements, supplier relationships, investor materials, valuations, and acquisition strategies;

(d) PRODUCT INFORMATION: features, functionality, user interface designs, UX flows, product strategy, competitive positioning, go-to-market plans, and any unreleased or beta features accessible during the trial period;

(e) OPERATIONAL INFORMATION: internal processes, workflows, organisational structures, staffing plans, operational methodologies, and any information relating to the Company's management of its software portfolio;

(f) THIRD-PARTY INFORMATION: any information the Company holds in confidence from third parties and discloses to the Recipient;

(g) DERIVATIVE WORKS: any analyses, notes, summaries, memoranda, or other materials prepared by or for the Recipient that contain, reflect, or are derived from any of the foregoing.

1.2 Confidential Information includes, without limitation, all information accessible via or through the Platforms during the trial or free-access period, whether or not explicitly marked as "confidential" or "proprietary."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. COVERED PLATFORMS

2.1 This Agreement covers all current and future platforms operated by the Company, including but not limited to:

(a) DataWinder — a SaaS platform for wildlife conservation intelligence, field survey management, species tracking, AI-generated field reports, and conservation compliance management;

(b) Premiso — a SaaS platform for property portfolio management, AI-generated tenancy documentation, compliance alerting, and property analytics;

(c) CharityHub — a SaaS platform for third-sector organisations providing donor management, grant application assistance, impact analytics, and charity compliance management;

(d) CaseNarrative — a SaaS platform for legal practitioners providing AI-powered case narrative generation, limitation date management, legal compliance dashboards, and practice analytics;

(e) Any future platforms, products, or features developed, acquired, or operated by the Company during the term of this Agreement.

2.2 Trial, test, and free-access users of any one Platform are bound by this Agreement in respect of all Platforms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. OBLIGATIONS OF THE RECIPIENT

3.1 CONFIDENTIALITY: The Recipient shall:

(a) hold all Confidential Information in strict confidence;
(b) not disclose, publish, transmit, or reveal any Confidential Information to any third party without the prior written consent of the Company;
(c) use the Confidential Information solely for the Permitted Purpose;
(d) apply no less than the same standard of care to protect the Confidential Information as it applies to its own confidential information, and in any event no less than reasonable care;
(e) promptly notify the Company in writing upon becoming aware of any unauthorised disclosure, access, or use of any Confidential Information.

3.2 RESTRICTED USES: The Recipient shall not:

(a) use any Confidential Information to develop, reverse-engineer, replicate, or assist in the development of any product or service that competes, directly or indirectly, with any of the Platforms;
(b) reverse engineer, disassemble, decompile, or otherwise attempt to derive the source code, algorithms, or underlying methodologies of any Platform;
(c) benchmark any Platform against a competitor's product and disclose the results publicly or to any third party;
(d) use any Confidential Information for any commercial purpose other than the Permitted Purpose;
(e) register any intellectual property rights (including trade marks, patents, or designs) that are derived from or relate to the Confidential Information;
(f) train, fine-tune, or incorporate any Confidential Information into any artificial intelligence or machine learning model without prior written consent.

3.3 PERMITTED DISCLOSURES: The Recipient may disclose Confidential Information to its employees, consultants, or professional advisers on a strict need-to-know basis, provided that:

(a) such persons are subject to binding confidentiality obligations no less restrictive than those in this Agreement;
(b) the Recipient remains fully liable for any breach by such persons.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION

4.1 The obligations in Clause 3 shall not apply to information that the Recipient can demonstrate by contemporaneous written evidence:

(a) was in the public domain at the time of disclosure through no fault of the Recipient;
(b) becomes part of the public domain after disclosure through no fault of the Recipient;
(c) was already rightfully in the Recipient's possession at the time of disclosure, free of any obligation of confidentiality;
(d) is received from a third party who is lawfully entitled to disclose it without restriction; or
(e) is required to be disclosed by applicable law, regulation, or court order, provided that the Recipient gives the Company as much prior written notice as practicable and cooperates with the Company in seeking a protective order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. INTELLECTUAL PROPERTY

5.1 All Confidential Information remains the exclusive property of the Company. Nothing in this Agreement grants the Recipient any licence, right, title, or interest in or to any Confidential Information, intellectual property, or any Platform.

5.2 Any feedback, suggestions, ideas, or improvements provided by the Recipient in connection with the Platforms ("Feedback") shall be the sole and exclusive property of the Company. The Recipient hereby assigns to the Company all right, title, and interest in such Feedback, including all intellectual property rights therein.

5.3 The Recipient waives any moral rights in relation to Feedback to the fullest extent permitted by law.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. TERM AND TERMINATION

6.1 This Agreement shall commence on the Effective Date and shall remain in force for a period of five (5) years, or until terminated by written notice by either Party, whichever is later.

6.2 The obligations of confidentiality in respect of Trade Secrets (as defined under the Trade Secrets (Enforcement, etc.) Regulations 2018) shall survive termination of this Agreement indefinitely.

6.3 Upon termination of this Agreement, or upon request by the Company, the Recipient shall promptly:
(a) return or permanently destroy all documents, materials, and records containing Confidential Information;
(b) confirm in writing that such return or destruction has been completed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. REMEDIES

7.1 The Recipient acknowledges that breach of this Agreement would cause the Company irreparable harm for which monetary damages would be an inadequate remedy.

7.2 Accordingly, the Company shall be entitled, without prejudice to any other rights or remedies, to seek injunctive relief, specific performance, or other equitable relief to prevent or restrain any actual or threatened breach of this Agreement, without the need to prove actual damage or post any bond.

7.3 All rights and remedies of the Company under this Agreement are cumulative and not alternative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. GOVERNING LAW AND JURISDICTION

8.1 This Agreement shall be governed by and construed in accordance with the laws of England and Wales.

8.2 Each Party irrevocably submits to the exclusive jurisdiction of the courts of England and Wales in respect of any dispute or claim arising out of or in connection with this Agreement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. GENERAL PROVISIONS

9.1 ENTIRE AGREEMENT: This Agreement constitutes the entire agreement between the Parties with respect to its subject matter and supersedes all prior or contemporaneous discussions, representations, or agreements.

9.2 SEVERABILITY: If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.

9.3 NO WAIVER: No failure or delay by the Company in exercising any right shall constitute a waiver of that right.

9.4 VARIATION: No amendment or variation of this Agreement shall be effective unless made in writing and signed by both Parties.

9.5 ASSIGNMENT: The Recipient may not assign or transfer any of its rights or obligations under this Agreement without the prior written consent of the Company.

9.6 ELECTRONIC ACCEPTANCE: The Recipient acknowledges and agrees that electronic acceptance of this Agreement (including by clicking "I Agree", checking a box, or continuing to access a Platform after being presented with this Agreement) constitutes a valid, binding signature for all purposes and shall have the same legal effect as a handwritten signature under the Electronic Communications Act 2000 and applicable UK law.

9.7 THIRD PARTY RIGHTS: Nothing in this Agreement is intended to confer any rights on any third party under the Contracts (Rights of Third Parties) Act 1999.

9.8 TRADE SECRETS: This Agreement is intended to comply with and operate in accordance with the Trade Secrets (Enforcement, etc.) Regulations 2018 (SI 2018/597). The definition of Confidential Information includes all matters that constitute a "trade secret" under those Regulations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTICE TO RECIPIENT

By accessing any trial, test, or free version of any Platform operated by ${COMPANY_NAME}, you confirm that:

✓ You have read and understood this Agreement in full
✓ You agree to be bound by all of its terms
✓ You have authority to enter into this Agreement on behalf of yourself and/or your organisation
✓ You understand that this Agreement is legally binding and enforceable under English law

If you do not agree to these terms, you must not access or use any Platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${COMPANY_NAME}
Company Number: ${COMPANY_NUMBER}
Registered Office: ${COMPANY_ADDRESS}
Date: ${EFFECTIVE_DATE}

This document is the property of ${COMPANY_NAME}. Unauthorised reproduction or distribution is prohibited.`;

export default function NDA() {
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [email, setEmail] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [acceptedDate, setAcceptedDate] = useState(null);

  const handleScroll = (e) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (atBottom) setScrolledToBottom(true);
  };

  const handleSign = () => {
    if (!fullName.trim() || !email.trim()) return;
    setSigned(true);
    setAcceptedDate(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }));
  };

  const handleDownload = () => {
    const blob = new Blob([NDA_TEXT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SynergyFlow_NDA_Trial_Access.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (signed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">NDA Accepted</h2>
          <p className="text-slate-500 text-sm mb-6">Your acceptance has been recorded. You may now access the trial platforms.</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm mb-6 space-y-1">
            <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{fullName}</span></div>
            {organisation && <div><span className="text-slate-500">Organisation:</span> <span className="font-semibold text-slate-800">{organisation}</span></div>}
            <div><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{email}</span></div>
            <div><span className="text-slate-500">Accepted:</span> <span className="font-semibold text-slate-800">{acceptedDate}</span></div>
            <div><span className="text-slate-500">Agreement:</span> <span className="font-semibold text-slate-800">SynergyFlow Multi-Product NDA</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" /> Download NDA Copy
            </Button>
            <Button onClick={() => window.location.href = '/'} className="w-full bg-slate-900 hover:bg-slate-800">
              Continue to Platform
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            A copy of this agreement has been recorded. By your acceptance you are bound by the terms of the Non-Disclosure Agreement in perpetuity with respect to Trade Secrets and for 5 years in respect of all other Confidential Information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm mb-4">
            <Shield className="w-4 h-4 text-blue-300" />
            Legally Binding Document — Please Read Carefully
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Non-Disclosure Agreement</h1>
          <p className="text-slate-300 text-sm">Multi-Product Trial & Free Access — {COMPANY_NAME}</p>
        </div>

        {/* Covered products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {PRODUCTS.map(p => (
            <div key={p.name} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <div className="font-semibold text-white text-sm">{p.name}</div>
              <div className="text-xs text-slate-300 mt-0.5">{p.description}</div>
            </div>
          ))}
        </div>

        {/* Warning banner */}
        <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-4 flex gap-3 mb-4 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Important:</strong> This is a legally binding Non-Disclosure Agreement. By accepting, you agree to keep all information about the Company's technology, products, trade secrets, and business operations strictly confidential. Please read the full document before accepting.
          </div>
        </div>

        {/* NDA Scroll area */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
          <div className="bg-slate-800 px-6 py-3 flex items-center justify-between">
             <div className="flex items-center gap-2 text-white text-sm font-semibold">
               <FileText className="w-4 h-4" />
               SynergyFlow Group Ltd — Non-Disclosure Agreement (Multi-Product)
             </div>
             <Badge className="bg-blue-600 text-white border-0 text-xs">England & Wales Law</Badge>
           </div>

          <div
            onScroll={handleScroll}
            className="h-[400px] overflow-y-auto p-6 font-mono text-xs text-slate-700 leading-relaxed bg-slate-50 whitespace-pre-wrap"
          >
            {NDA_TEXT}
          </div>

          {!scrolledToBottom && (
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-2 text-xs text-slate-500 text-center">
              ↓ Please scroll to the bottom to read the full agreement before accepting
            </div>
          )}
        </div>

        {/* Download */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Download a copy of this NDA
          </button>
        </div>

        {/* Acceptance form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h3 className="font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-600" /> Electronic Acceptance
          </h3>
          <p className="text-slate-500 text-sm mb-5">
            Completing this form constitutes a legally valid electronic signature under the Electronic Communications Act 2000.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. jane@yourorg.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Organisation / Company <span className="text-slate-400">(optional — required if signing on behalf of an entity)</span></label>
              <input
                type="text"
                value={organisation}
                onChange={e => setOrganisation(e.target.value)}
                placeholder="e.g. Woodland Trust"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-slate-800"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              I confirm that I have read, understood, and agree to be legally bound by the terms of this Non-Disclosure Agreement. I have the authority to enter into this Agreement on behalf of myself and, where applicable, my organisation. I understand this Agreement is governed by the laws of England and Wales.
            </span>
          </label>

          {/* Sign button */}
          <Button
            onClick={handleSign}
            disabled={!agreed || !fullName.trim() || !email.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            I Accept — Sign NDA Electronically
          </Button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Your acceptance, name, email, and timestamp will be recorded. This constitutes a binding legal agreement.
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4 pb-6">
          {COMPANY_NAME} · Registered in England & Wales · Governed by English Law · {EFFECTIVE_DATE}
        </p>
      </div>
    </div>
  );
}