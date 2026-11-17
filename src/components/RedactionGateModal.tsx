'use client';

import React from 'react';
import { PIIToken } from '@/types';
import { ShieldCheck, X, ArrowRight, Lock, Eye } from 'lucide-react';

interface RedactionGateModalProps {
  isOpen: boolean;
  query: string;
  redactedPayload: string;
  tokens: PIIToken[];
  reason: string;
  onApprove: () => void;
  onCancel: () => void;
}

export const RedactionGateModal: React.FC<RedactionGateModalProps> = ({
  isOpen,
  query,
  redactedPayload,
  tokens,
  reason,
  onApprove,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-xl border border-[#443125] bg-[#1a1410] shadow-2xl overflow-hidden text-[#fdfbf7]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#140f0c] border-b border-[#362920] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#fdfbf7]">
                Cloud Escalation Authorization
              </h3>
              <p className="text-xs text-[#aa9688] mt-0.5">{reason}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#aa9688] hover:text-white hover:bg-[#2a201a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Query Summary */}
          <div className="p-3.5 rounded-lg bg-[#140f0c] border border-[#362920]">
            <span className="text-[10px] font-semibold text-[#8c786c] uppercase tracking-wider block mb-1">
              Triggering Inquiry:
            </span>
            <p className="text-xs font-medium text-[#f2e7df] italic">"{query}"</p>
          </div>

          {/* Privacy Diff Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d6c5b8] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                Payload Sanitization Preview ({tokens.length} Confidential Entities Tokenized)
              </span>
              <span className="text-[11px] text-orange-300 font-mono bg-[#341b09] px-2 py-0.5 rounded border border-orange-600/40">
                Zero PII In Transit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Retained Local Box */}
              <div className="p-3.5 rounded-lg bg-[#140f0c] border border-[#362920]">
                <div className="text-[#aa9688] font-semibold mb-2 text-[11px]">
                  Protected Entities (Retained On-Device):
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 text-[#aa9688] pr-1 text-[11px]">
                  {tokens.length === 0 ? (
                    <p className="text-[#8c786c] italic">No direct PII found in query context.</p>
                  ) : (
                    tokens.slice(0, 8).map((t, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-[#261d17]">
                        <span className="text-[#fdfbf7] font-medium truncate max-w-[150px]">{t.original}</span>
                        <span className="text-[#8c786c] text-[10px]">{t.category}</span>
                      </div>
                    ))
                  )}
                  {tokens.length > 8 && (
                    <p className="text-[#8c786c] pt-1">+{tokens.length - 8} additional identifiers protected...</p>
                  )}
                </div>
              </div>

              {/* Redacted Payload */}
              <div className="p-3.5 rounded-lg bg-[#140f0c] border border-[#362920]">
                <div className="text-[#aa9688] font-semibold mb-2 text-[11px]">
                  Transmitted Payload (To Firebase Cloud):
                </div>
                <div className="max-h-44 overflow-y-auto text-amber-200/90 whitespace-pre-wrap leading-relaxed pr-1 text-[11px]">
                  {redactedPayload || 'Only anonymized legal structural queries will be transmitted.'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#140f0c] border border-[#362920] text-xs text-[#aa9688] flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By authorizing, only the anonymized clause structure above will be processed by{' '}
              <strong className="text-orange-200">Firebase AI Logic</strong> in Google Cloud. All names, financial
              amounts, tax IDs, and direct client identifiers remain protected in browser memory.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#140f0c] border-t border-[#362920] flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#aa9688] hover:text-[#fdfbf7] hover:bg-[#2a201a] transition-colors cursor-pointer"
          >
            Keep Local Only
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition-all cursor-pointer"
          >
            <span>Authorize Escalation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
