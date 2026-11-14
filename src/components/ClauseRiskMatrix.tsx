'use client';

import React, { useState } from 'react';
import { ContractClause, RiskLevel } from '@/types';
import { DiffViewer } from './DiffViewer';
import {
  FileEdit,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface ClauseRiskMatrixProps {
  clauses: ContractClause[];
  onDraftRedline: (clause: ContractClause) => Promise<void>;
  onAcceptRedline: (clauseId: string, redlinedText: string) => void;
  isGeneratingRedline: boolean;
}

export const ClauseRiskMatrix: React.FC<ClauseRiskMatrixProps> = ({
  clauses,
  onDraftRedline,
  onAcceptRedline,
  isGeneratingRedline,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(clauses[0]?.id || null);

  const criticalCount = clauses.filter((c) => c.riskLevel === 'critical').length;
  const highCount = clauses.filter((c) => c.riskLevel === 'high').length;
  const mediumCount = clauses.filter((c) => c.riskLevel === 'medium').length;

  const totalWeightedRisk = criticalCount * 28 + highCount * 18 + mediumCount * 10;
  const healthScore = Math.max(20, 100 - totalWeightedRisk);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Moderate
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Standard / Low
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-zinc-100 text-sm">Risk Assessment & Amendments</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {clauses.length} Flagged
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Key covenants evaluated against enterprise contracting guidelines
          </p>
        </div>

        {/* Minimal Score Tag */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 font-medium">Compliance Index:</span>
          <span
            className={`font-semibold font-mono ${
              healthScore >= 75
                ? 'text-emerald-400'
                : healthScore >= 50
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {healthScore}/100
          </span>
        </div>
      </div>

      {/* Accordion Clauses */}
      <div className="divide-y divide-zinc-800/60">
        {clauses.map((clause) => {
          const isExpanded = expandedId === clause.id;
          return (
            <div key={clause.id} className="transition-colors hover:bg-zinc-850/30">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {getRiskBadge(clause.riskLevel)}
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
                    {clause.sectionNumber}
                  </span>
                  <span className="text-xs font-medium text-zinc-200">{clause.title}</span>
                </div>
                <div className="text-zinc-500">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3.5 bg-zinc-950/40 border-t border-zinc-850 text-xs">
                  {/* Counsel Explanation */}
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 space-y-1">
                    <div className="text-zinc-400 font-medium text-[11px]">Counsel Notes:</div>
                    <p className="text-zinc-300 leading-relaxed">{clause.riskReason}</p>
                  </div>

                  {/* Redline Diff */}
                  {clause.suggestedRedline && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-zinc-400 font-medium text-[11px]">
                          Proposed Contract Redline:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDraftRedline(clause)}
                            disabled={isGeneratingRedline}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[11px] border border-zinc-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3 text-zinc-400" />
                            <span>Re-Draft</span>
                          </button>
                          <button
                            onClick={() => onAcceptRedline(clause.id, clause.suggestedRedline!)}
                            className="px-3 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-zinc-950" />
                            <span>Accept Amendment</span>
                          </button>
                        </div>
                      </div>

                      <DiffViewer original={clause.originalText} revised={clause.suggestedRedline} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
