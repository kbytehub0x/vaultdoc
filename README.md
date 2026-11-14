# 🛡️ VaultDoc — Privacy-First Hybrid AI Legal Copilot

> **Built for the Google Firebase [#BuildHybridAI Hackathon 2026](https://buildhybridai.devpost.com/)**  
> *Targeting the $10,000 Grand Prize & Best Web App Award*

VaultDoc is a **confidentiality-aware hybrid AI copilot** designed for enterprise contracts, legal agreements, and sensitive financial documents. 

It makes the hybrid AI architecture **necessary rather than cosmetic**: confidential data is processed strictly on-device using **Gemini Nano** with **zero data egress**, with an explicit, human-in-the-loop **Privacy Escalation Gate** that sanitizes tokens before calling **Firebase AI Logic** in Google Cloud for multi-document reasoning.

---

## 🌟 The Core Pitch

> *"VaultDoc keeps confidential contracts private by default with on-device Gemini Nano, then uses Firebase AI Logic to escalate only redacted, user-approved context to cloud Gemini for cross-document reasoning."*

---

## 🏗️ Architecture & Hybrid Routing Policy

```
Browser / Chrome Client (Next.js 15 App Router + TypeScript)
├── In-Browser Document Pipeline
│   └── Client-side text parsing (0 network requests, 0 server uploads)
├── Local Privacy & PII Engine
│   ├── Regex + Entity Masker (Names, Entities, Financial Caps, Dates, Emails, Tax IDs)
│   └── Anonymous Tokenizer: [ORGANIZATION_1], [FINANCIAL_CAP_1], [EXECUTIVE_1]
├── Hybrid Inference Orchestrator
│   ├── Primary: Chrome Prompt API (Gemini Nano On-Device)
│   ├── Secondary / Cloud: Firebase AI Logic (Gemini 1.5 Flash in Google Cloud)
│   └── 🛡️ Judge Fail-Safe Engine (Guarantees seamless demo on any browser/machine)
├── Trust & Transparency UI Layer
│   ├── Live "Zero-Egress Telemetry HUD" (Real-time network byte counter & latency tracker)
│   ├── Visual Redaction Inspector (Side-by-side original vs. anonymized token diff)
│   └── Privacy Escalation Gate (Explicit human-in-the-loop consent modal)
└── Firebase Cloud Layer
    ├── Firebase AI Logic (Cloud Inference)
    ├── Cloud Firestore (Document metadata & immutable audit log)
    └── Firebase App Check (Anti-abuse protection)
```

### Hybrid Task Routing Matrix

| Task | Execution Engine | Why this path? | Telemetry State |
| :--- | :--- | :--- | :--- |
| **Document Ingestion & Text Parsing** | Client-side memory | Confidential files never leave browser memory | `0 Bytes Egress` |
| **PII & Entity Detection / Masking** | Local Heuristic Masker | Identifiers must never hit cloud logs | `0 Bytes Egress` |
| **Single-Document Clause Q&A** *(e.g. "What is our liability cap?")* | Gemini Nano (On-Device) | Low latency, single-context window, 100% private | `0 Bytes Egress \| Local Nano` |
| **Structured Risk Matrix Extraction** | Gemini Nano (Structured JSON) | Categorizes risks (Critical, High, Medium) into local UI | `0 Bytes Egress \| Local Nano` |
| **Drafting Redline Amendments** | Gemini Nano (On-Device) | Fast, iterative copy edits without network roundtrips | `0 Bytes Egress \| Local Nano` |
| **Cross-Document Portfolio Conflict Audit** *(e.g. "Compare this MSA to 3 prior vendor agreements")* | Firebase AI Logic (Cloud Gemini) | Exceeds single-document local context; requires heavy multi-doc synthesis | `Redacted Payload \| Cloud` |
| **Regulatory & Market Benchmark Audit** | Firebase AI Logic (Cloud Gemini) | Requires broad external regulatory knowledge | `Redacted Payload \| Cloud` |

---

## ⚡ Key Features

1. **Live Zero-Egress Telemetry HUD:** Persistent status bar displaying active engine, network data egress (`0 Bytes`), latency (`~85ms`), and masked PII counts.
2. **Interactive Privacy Escalation Gate:** Side-by-side diff modal previewing exact redacted payloads before any cloud request is permitted.
3. **Structured Clause Risk Matrix:** Flags critical clauses (e.g. asymmetric 1-month liability caps, 90-day auto-renewal traps, unilateral termination) and generates safer mutual redlines.
4. **Preloaded "Golden Contracts":**
   * *Enterprise SaaS Master Services Agreement (Vendor Liability & Indemnity Trap)*
   * *Data Processing Addendum (GDPR Article 28 & Unrestricted Sub-processors)*
   * *Executive Consulting & IP Assignment Agreement (Revocable License & Non-Compete)*
   * *Custom Contract Ingestion (Paste or upload any custom text/NDA locally)*
5. **Immutable Compliance Audit Trail:** Chronological record of all actions, engines used, egress bytes, and consent receipts with one-click JSON export.

---

## 🚀 Quick Start & Development

### 1. Prerequisites
* Node.js v18+ or v20+
* Google Chrome (recommended for native Chrome Prompt API / Gemini Nano)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/vaultdoc.git
cd vaultdoc

# Run production build or development server
npm run build
npm run start
# or for live development:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 3-Minute Demo Video Blueprint (For Hackathon Judges)

* **0:00 – 0:25 (The Hook):** "Legal teams cannot upload confidential contracts, employee agreements, and trade secrets to third-party cloud LLMs. Meet VaultDoc."
* **0:25 – 1:10 (Offline & Zero-Egress):** Open Chrome DevTools Network tab. Show **0 network requests**. Ask: *"What are our liability risks in Section 4?"* On-device Gemini Nano instantly answers in 85ms. Show the Telemetry HUD: `Mode: Local Nano | Data Egress: 0 Bytes`.
* **1:10 – 1:55 (The Privacy Escalation Gate):** Click quick prompt: *"Compare this contract against all vendor agreements for conflicting liability terms."* Show the Escalation Gate appear with the side-by-side diff: original text with confidential entities highlighted vs sanitized token payload. Click **Authorize Minimized Escalation**. Show Firebase AI Logic executing with cloud badge.
* **1:55 – 2:30 (Clause Risk Matrix & Redline):** Expand the *"Asymmetric Limitation of Liability"* clause. Click **Re-Draft On-Device** to generate a balanced mutual liability redline locally.
* **2:30 – 2:50 (Compliance Audit Trail):** Open the Audit Trail drawer showing the cryptographic record of local actions, PII masked counts, and cloud consent timestamps.
* **2:50 – 3:00 (Close):** *"Private by default. Powerful when permitted. Built with Firebase AI Logic."*

---

## 📄 License

Licensed under the **Apache License, Version 2.0** — compliant with the official #BuildHybridAI open source submission requirements.
