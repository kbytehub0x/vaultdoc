import { ContractDocument } from '@/types';
import { maskPII } from '@/lib/redaction';

export const GOLDEN_CONTRACTS: ContractDocument[] = [
  {
    id: 'contract-saas-msa',
    title: 'Enterprise SaaS Master Services Agreement',
    type: 'SaaS MSA',
    counterparty: 'Nexus Cloud Solutions LLC',
    effectiveDate: 'November 1, 2026',
    isPreloaded: true,
    rawText: `MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into as of November 1, 2026 ("Effective Date"), by and between Acme Technologies Inc., a Delaware corporation with offices at 500 Market St, San Francisco, CA ("Customer"), and Nexus Cloud Solutions LLC, with offices at 120 Wall Street, New York, NY ("Vendor"). Representative Contact: Johnathan Vance (jvance@nexuscloud.io, +1 415-555-0199). Tax EIN: 12-3456789.

1. SCOPE OF SERVICES
Vendor shall provide Customer access to its cloud infrastructure platform as specified in Order Forms.

2. FEES AND PAYMENT TERMS
Customer shall pay fees within thirty (30) days of invoice receipt. Overdue invoices accrue interest at 1.5% per month. Total estimated annual subscription is $2,400,000 USD.

3. TERM AND AUTOMATIC RENEWAL
The initial term shall be thirty-six (36) months. This Agreement shall automatically renew for additional consecutive twelve (12) month periods unless Customer provides written notice of non-renewal at least ninety (90) days prior to the expiration of the current term.

4. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES. VENDOR'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL FEES PAID BY CUSTOMER IN THE PRECEDING ONE (1) MONTH PERIOD, ESTIMATED AT $200,000 USD. CUSTOMER'S LIABILITY UNDER THIS AGREEMENT IS UNCAPPED.

5. INDEMNIFICATION
Customer shall defend, indemnify, and hold harmless Vendor, its affiliates, and officers from and against any third-party claims, damages, liabilities, and expenses (including attorneys' fees) arising out of Customer's use of the Services or breach of this Agreement. Vendor provides NO reciprocal indemnity for intellectual property infringement.

6. DATA OWNERSHIP AND SECURITY
Customer retains ownership of all data ingested. Vendor shall implement commercially reasonable administrative safeguards. Vendor disclaims any liability for unauthorized third-party exfiltration resulting from zero-day vulnerabilities.

7. TERMINATION FOR CONVENIENCE
Vendor may terminate this Agreement at any time with thirty (30) days written notice without penalty. Customer holds no right of termination for convenience and must pay out all remaining fees through the end of the 36-month term upon early cancellation.

8. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of the State of New York. Any dispute shall be resolved through binding arbitration in New York County, with each party bearing its own legal expenses.`,
    clauses: [
      {
        id: 'c-saas-1',
        title: 'Asymmetric Limitation of Liability Cap',
        sectionNumber: 'Section 4',
        originalText: "Vendor's total aggregate liability arising out of or related to this Agreement shall be strictly capped at the total fees paid by Customer in the preceding one (1) month period ($200,000 USD). Customer's liability under this Agreement is uncapped.",
        summary: 'Vendor liability is severely constrained to only 1 month of trailing fees ($200,000), while Customer liability remains completely uncapped.',
        riskLevel: 'critical',
        riskReason: 'Extreme asymmetry exposes Customer to massive catastrophic loss during vendor outage or security breach with near-zero vendor accountability.',
        suggestedRedline: "Each party's total aggregate liability shall be mutually capped at the total fees paid or payable by Customer in the preceding twelve (12) month period, excluding breaches of confidentiality or gross negligence.",
      },
      {
        id: 'c-saas-2',
        title: 'One-Sided Indemnification',
        sectionNumber: 'Section 5',
        originalText: "Customer shall defend, indemnify, and hold harmless Vendor... Vendor provides NO reciprocal indemnity for intellectual property infringement.",
        summary: 'Customer must indemnify Vendor, but Vendor refuses to indemnify Customer if Vendor software infringes third-party patents or copyrights.',
        riskLevel: 'critical',
        riskReason: 'Customer risks having to defend vendor software against multi-million dollar third-party patent lawsuits without vendor defense.',
        suggestedRedline: "Vendor shall defend and indemnify Customer against any claims alleging that the Vendor platform or software infringes any third-party intellectual property rights.",
      },
      {
        id: 'c-saas-3',
        title: '90-Day Auto-Renewal Trap',
        sectionNumber: 'Section 3',
        originalText: "This Agreement shall automatically renew... unless Customer provides written notice of non-renewal at least ninety (90) days prior.",
        summary: 'Requires a restrictive 90-day non-renewal notification window to prevent automatic 12-month lock-in.',
        riskLevel: 'high',
        riskReason: 'Missing the 90-day window locks Customer into an additional $2.4M USD annual expenditure.',
        suggestedRedline: "Renewal shall require mutual written affirmative agreement, or non-renewal notice may be provided within thirty (30) days prior to expiration.",
      },
      {
        id: 'c-saas-4',
        title: 'Unilateral Vendor Termination for Convenience',
        sectionNumber: 'Section 7',
        originalText: "Vendor may terminate this Agreement at any time with thirty (30) days written notice without penalty. Customer holds no right of termination for convenience and must pay out all remaining fees.",
        summary: 'Vendor can walk away with 30 days notice, but Customer is locked into paying all 36 months ($7.2M USD).',
        riskLevel: 'critical',
        riskReason: 'Cripples operational continuity if Vendor cancels critical cloud infrastructure while Customer is barred from exiting early.',
        suggestedRedline: "Either party may terminate this Agreement for convenience with sixty (60) days prior written notice, subject to prorated refund of unearned prepaid fees.",
      },
    ],
    redaction: maskPII(
      `Acme Technologies Inc. and Nexus Cloud Solutions LLC entered into this agreement on November 1, 2026. Contact: Johnathan Vance (jvance@nexuscloud.io, +1 415-555-0199). Annual fee $2,400,000 USD. 1-month cap $200,000 USD.`
    ),
  },
  {
    id: 'contract-dpa',
    title: 'Enterprise Data Processing Addendum (GDPR/CCPA)',
    type: 'DPA',
    counterparty: 'Apex Enterprise Systems',
    effectiveDate: 'October 15, 2026',
    isPreloaded: true,
    rawText: `DATA PROCESSING ADDENDUM (DPA)
This Data Processing Addendum supplements the Principal Agreement between Acme Technologies Inc. ("Controller") and Apex Enterprise Systems ("Processor"). Authorized DPO: Sarah Jenkins (s.jenkins@apexenterprise.com, +1 212-555-0144). Tax ID: 98-7654321.

1. PROCESSING OF PERSONAL DATA
Processor shall process Personal Data solely on documented instructions from Controller, including with respect to international transfers.

2. SUB-PROCESSORS
Controller grants Processor general authorization to appoint Sub-processors. Processor may add or replace Sub-processors without prior written notice to Controller. Controller holds no audit or objection mechanism regarding new Sub-processors.

3. SECURITY MEASURES & BREACH NOTIFICATION
Processor shall notify Controller of any confirmed Security Incident affecting Personal Data within seventy-two (72) business hours of confirmation. Notification is not required for unsuccessful attempts, probing, or denial-of-service spikes.

4. DATA SUBJECT RIGHTS & COOPERATION
Processor shall assist Controller in responding to data subjects' requests to exercise their rights under Data Protection Law. Controller shall reimburse Processor at Processor's standard hourly consulting rates ($450 USD/hr) for all cooperation activities.

5. AUDITS AND INSPECTIONS
Controller may conduct an audit of Processor's compliance no more than once every three (3) calendar years, provided Controller gives at least ninety (90) days advance notice and pays an upfront audit facilitation fee of $25,000 USD to Processor.

6. DATA RETURN AND DELETION
Upon termination, Processor shall delete all Customer Personal Data within one hundred eighty (180) days, unless applicable statutory retention laws mandate longer retention.`,
    clauses: [
      {
        id: 'c-dpa-1',
        title: 'Unrestricted Sub-processor Appointment',
        sectionNumber: 'Section 2',
        originalText: "Processor may add or replace Sub-processors without prior written notice to Controller. Controller holds no audit or objection mechanism regarding new Sub-processors.",
        summary: 'Processor can outsource personal data to unknown third-party sub-processors without notifying Controller.',
        riskLevel: 'critical',
        riskReason: 'Direct violation of GDPR Article 28(2), exposing Controller to massive regulatory fines up to €20M or 4% of global turnover.',
        suggestedRedline: "Processor shall provide at least thirty (30) days prior written notice of any intended appointment of new Sub-processors, granting Controller the right to object on reasonable data protection grounds.",
      },
      {
        id: 'c-dpa-2',
        title: 'Delayed 72 "Business Hours" Breach Notification',
        sectionNumber: 'Section 3',
        originalText: "Processor shall notify Controller of any confirmed Security Incident affecting Personal Data within seventy-two (72) business hours of confirmation.",
        summary: '72 business hours can equal 9 calendar days over weekends and holidays.',
        riskLevel: 'high',
        riskReason: 'GDPR mandates notification to supervisory authorities within 72 calendar hours of awareness. 9 days delays controller past legal deadline.',
        suggestedRedline: "Processor shall notify Controller without undue delay and in any event within twenty-four (24) calendar hours of becoming aware of any Personal Data Breach.",
      },
      {
        id: 'c-dpa-3',
        title: 'Extortionate Audit Fee & Restriction',
        sectionNumber: 'Section 5',
        originalText: "Controller may conduct an audit... no more than once every three (3) calendar years... pays an upfront audit facilitation fee of $25,000 USD.",
        summary: 'Limits audits to once every 3 years with a mandatory $25,000 penalty fee.',
        riskLevel: 'high',
        riskReason: 'Blocks regular annual compliance reviews and security certifications required by enterprise enterprise customers.',
        suggestedRedline: "Controller may conduct an annual audit upon thirty (30) days notice without facilitation fees, or immediately following any confirmed security incident.",
      },
    ],
    redaction: maskPII(
      `Acme Technologies Inc. and Apex Enterprise Systems DPA entered on October 15, 2026. DPO: Sarah Jenkins (s.jenkins@apexenterprise.com, +1 212-555-0144). Consulting rate $450 USD/hr. Audit fee $25,000 USD.`
    ),
  },
  {
    id: 'contract-consulting',
    title: 'Executive Consulting & Intellectual Property Agreement',
    type: 'Consulting / IP',
    counterparty: 'Dr. Aris Thorne',
    effectiveDate: 'September 1, 2026',
    isPreloaded: true,
    rawText: `CONSULTING AND IP ASSIGNMENT AGREEMENT
Between Acme Technologies Inc. ("Company") and Dr. Aris Thorne ("Consultant"), living at 742 Evergreen Terrace, Seattle, WA. Tax ID: 01-9876543. Phone: +1 206-555-0182. Email: athorne@biogenix-research.org.

1. SERVICES AND COMPENSATION
Consultant will provide AI architecture and patent consulting at $350,000 USD annually.

2. INTELLECTUAL PROPERTY RIGHTS & WORK PRODUCT
Consultant assigns to Company all right, title, and interest in Work Product created solely within the designated scope. However, any core AI algorithms, weights, and pre-existing mathematical models remain the sole property of Consultant, with Company granted a non-exclusive, revocable license.

3. NON-COMPETE RESTRICTIONS
Consultant agrees not to engage with any competing generative AI enterprise in North America for twenty-four (24) months following termination.

4. CONFIDENTIALITY
Each party shall maintain confidential information for five (5) years.`,
    clauses: [
      {
        id: 'c-con-1',
        title: 'Revocable License on Core AI Algorithms',
        sectionNumber: 'Section 2',
        originalText: "Any core AI algorithms, weights, and pre-existing mathematical models remain the sole property of Consultant, with Company granted a non-exclusive, revocable license.",
        summary: 'Consultant owns the AI model weights and can revoke Company license at will.',
        riskLevel: 'critical',
        riskReason: 'Consultant could shut down company product line by revoking AI algorithm license post-launch.',
        suggestedRedline: "Company shall receive an irrevocable, perpetual, worldwide, fully paid-up, royalty-free license to use, modify, and commercialize all underlying models and inventions.",
      },
      {
        id: 'c-con-2',
        title: 'Unenforceable 24-Month Non-Compete',
        sectionNumber: 'Section 3',
        originalText: "Consultant agrees not to engage with any competing generative AI enterprise in North America for twenty-four (24) months following termination.",
        summary: '24-month broad geographic non-compete.',
        riskLevel: 'medium',
        riskReason: 'Overly restrictive non-competes in tech jurisdictions (such as WA and CA) are frequently voided by courts, leaving zero post-employment protection.',
        suggestedRedline: "A targeted 12-month non-solicitation of clients and key technical personnel, tied to reasonable trade-secret covenants.",
      },
    ],
    redaction: maskPII(
      `Acme Technologies Inc. and Dr. Aris Thorne entered agreement on September 1, 2026. Address: 742 Evergreen Terrace, Seattle, WA. Tax ID: 01-9876543. Phone: +1 206-555-0182. Email: athorne@biogenix-research.org. Compensation: $350,000 USD.`
    ),
  },
];
