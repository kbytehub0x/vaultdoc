'use client';

import React, { useState } from 'react';
import { ContractClause, RiskLevel } from '@/types';
import { AlertCircle, AlertTriangle, CheckCircle2, FileEdit, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ClauseRiskMatrixProps {
  clauses: ContractClause[];
  onDraftRedline: (clause: ContractClause) => Promise<void>;
  isGeneratingRedline: boolean;
}

export const ClauseRiskMatrix: React.FC<ClauseRiskMatrixProps> = ({
  clauses,
  onDraftRedline,
  isGeneratingRedline,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(clauses[0]?.id || null);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Critical Risk
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-950/80 text-yellow-400 border border-yellow-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Standard / Low
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Clause Risk Matrix</h2>
            <p className="text-xs text-slate-400">Structured Extracted Obligations & Liability Covenants</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {clauses.length} Flagged Clauses
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {clauses.map((clause) => {
          const isExpanded = expandedId === clause.id;
          return (
            <div key={clause.id} className="transition-colors hover:bg-slate-850/40">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  {getRiskBadge(clause.riskLevel)}
                  <span className="text-xs font-mono text-slate-400">{clause.sectionNumber}</span>
                  <span className="text-sm font-medium text-slate-200">{clause.title}</span>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 bg-slate-950/40 border-t border-slate-850 text-xs">
                  {/* Summary & Risk Analysis */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-slate-400 font-medium">Risk Analysis:</div>
                    <p className="text-slate-300 leading-relaxed">{clause.riskReason}</p>
                  </div>

                  {/* Original Text */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1 font-mono text-slate-400">
                    <span className="text-slate-500 font-sans font-semibold block uppercase tracking-wider text-[10px]">
                      Contract Language:
                    </span>
                    <p className="italic text-slate-300 leading-relaxed">"{clause.originalText}"</p>
                  </div>

                  {/* Redline Draft Section */}
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Suggested Redline Amendment (Drafted Locally on Gemini Nano)
                      </span>
                      <button
                        onClick={() => onDraftRedline(clause)}
                        disabled={isGeneratingRedline}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isGeneratingRedline ? 'Generating On-Device...' : 'Re-Draft On-Device'}
                      </button>
                    </div>
                    <p className="text-emerald-200/90 font-mono text-[11px] leading-relaxed bg-emerald-950/40 p-2.5 rounded border border-emerald-500/20">
                      {clause.suggestedRedline || 'Click Re-Draft to generate an optimized mutual clause on-device.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
