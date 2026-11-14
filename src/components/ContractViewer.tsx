'use client';

import React, { useState } from 'react';
import { ContractDocument } from '@/types';
import { FileText, Shield, Eye, Lock, Calendar, Building, Sparkles } from 'lucide-react';

interface ContractViewerProps {
  contract: ContractDocument;
  contracts: ContractDocument[];
  onSelectContract: (contract: ContractDocument) => void;
  showRedacted: boolean;
  onToggleRedacted: (show: boolean) => void;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  contracts,
  onSelectContract,
  showRedacted,
  onToggleRedacted,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Bar / Contract Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <select
            value={contract.id}
            onChange={(e) => {
              const selected = contracts.find((c) => c.id === e.target.value);
              if (selected) onSelectContract(selected);
            }}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle (Raw vs Redacted) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => onToggleRedacted(false)}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              !showRedacted ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Raw Context</span>
          </button>
          <button
            onClick={() => onToggleRedacted(true)}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              showRedacted
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>PII Redacted View</span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
              {contract.redaction.maskedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Contract Metadata Chips */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-850 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>Counterparty:</span>
          <strong className="text-slate-200 font-semibold">{contract.counterparty}</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Effective Date:</span>
          <strong className="text-slate-200 font-semibold">{contract.effectiveDate}</strong>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
          <Shield className="w-3 h-3" />
          <span>Local Ingestion Complete (0 Egress)</span>
        </div>
      </div>

      {/* Contract Text Body */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[480px] bg-slate-950/80 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
        {showRedacted ? (
          <div className="text-emerald-300/90">{contract.redaction.redactedText}</div>
        ) : (
          <div>{contract.rawText}</div>
        )}
      </div>
    </div>
  );
};
