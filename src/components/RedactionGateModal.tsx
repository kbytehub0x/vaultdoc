'use client';

import React from 'react';
import { PIIToken } from '@/types';
import { ShieldAlert, ArrowRight, Check, X, Lock, Eye, AlertTriangle } from 'lucide-react';

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
      <div className="relative w-full max-w-3xl rounded-xl border border-amber-500/30 bg-slate-900 shadow-2xl overflow-hidden text-slate-200">
        {/* Header Alert */}
        <div className="px-6 py-4 bg-amber-950/40 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Privacy Escalation Gate
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Human-In-The-Loop Consent
                </span>
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">{reason}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* User Query Banner */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Triggering Query:
            </span>
            <p className="text-sm font-medium text-white italic">"{query}"</p>
          </div>

          {/* Redaction Comparison Diff */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Payload Sanitization Preview ({tokens.length} Confidential Entities Tokenized)
              </span>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Zero PII Transmitted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Raw Preview Box */}
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                <div className="text-red-400 font-bold mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Raw Unredacted (Stays On-Device)
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 text-slate-300 pr-1 leading-relaxed">
                  {tokens.length === 0 ? (
                    <p className="text-slate-500 italic">No explicit PII tokens detected in query.</p>
                  ) : (
                    tokens.slice(0, 8).map((t, i) => (
                      <div key={i} className="flex justify-between py-0.5 border-b border-red-900/30">
                        <span className="text-red-300 font-semibold">{t.original}</span>
                        <span className="text-slate-500">{t.category}</span>
                      </div>
                    ))
                  )}
                  {tokens.length > 8 && (
                    <p className="text-slate-500 pt-1">+{tokens.length - 8} more confidential items secured...</p>
                  )}
                </div>
              </div>

              {/* Redacted Payload Box */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <div className="text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Minimized Payload (Sent to Firebase AI Logic)
                </div>
                <div className="max-h-48 overflow-y-auto text-emerald-300/90 whitespace-pre-wrap leading-relaxed pr-1">
                  {redactedPayload || 'Only anonymized structural tokens and legal questions will be transmitted.'}
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              By authorizing, only the anonymized clause structure above will be processed by{' '}
              <strong className="text-slate-200">Firebase AI Logic</strong> in Google Cloud. All names, financial
              amounts, tax IDs, and direct client identifiers remain protected in browser memory.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel (Keep 100% Local)
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all font-sans"
          >
            <span>Authorize Minimized Cloud Escalation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
