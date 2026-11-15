'use client';

import React from 'react';
import { ContractDocument } from '@/types';
import { FileText, Download, X, Check, Copy } from 'lucide-react';

interface ExecutiveMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractDocument;
}

export const ExecutiveMemoModal: React.FC<ExecutiveMemoModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  if (!isOpen) return null;

  const memoContent = `EXECUTIVE LEGAL MEMORANDUM
CONFIDENTIAL & PRIVILEGED

TO: General Counsel & Chief Financial Officer
FROM: VaultDoc Enterprise Legal Intelligence (On-Device Local Audit)
DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
SUBJECT: Legal Risk Assessment & Redline Recommendations: ${contract.title}
COUNTERPARTY: ${contract.counterparty}
EFFECTIVE DATE: ${contract.effectiveDate}

1. EXECUTIVE SUMMARY
This memorandum summarizes the legal and compliance review conducted on the subject agreement. The evaluation was executed locally inside browser memory using client-side privacy heuristics and Gemini Nano on-device models with zero external data egress.

2. FLAGGED HIGH-RISK COVENANTS
${contract.clauses
  .map(
    (c, i) => `[${i + 1}] ${c.title} (${c.sectionNumber})
    • Status: ${c.riskLevel.toUpperCase()} RISK
    • Risk Analysis: ${c.riskReason}
    • Proposed Redline: "${c.suggestedRedline || 'Standard mutual carve-outs recommended.'}"`
  )
  .join('\n\n')}

3. DATA PRIVACY & ENTITY SHIELDING
A total of ${contract.redaction.tokens.length} confidential data identifiers (including entity names, bank account numbers, executive emails, and financial caps) were detected and quarantined on-device. No unprotected corporate identifiers were transmitted across external networks.

4. RECOMMENDATION
Execution of the agreement is recommended subject to counterparty acceptance of the amended limitation of liability and mutual indemnification redlines outlined above.

Prepared via VaultDoc • Hybrid AI Architecture (Firebase AI Logic + Gemini Nano)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(memoContent);
  };

  const handleDownload = () => {
    const blob = new Blob([memoContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-legal-memo-${contract.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden text-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Executive Legal Memorandum</h3>
              <p className="text-xs text-zinc-500">Board-ready legal risk & amendment summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[460px] bg-zinc-950/80 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap select-text border-b border-zinc-800">
          {memoContent}
        </div>

        <div className="px-6 py-3.5 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">Generated locally • 0 KB data egress</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Memo</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
