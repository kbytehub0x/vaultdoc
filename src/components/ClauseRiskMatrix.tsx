'use client';

import React, { useState } from 'react';
import { ContractClause, RiskLevel } from '@/types';
import { DiffViewer } from './DiffViewer';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  TrendingUp,
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

  // Compute live contract risk health score
  const criticalCount = clauses.filter((c) => c.riskLevel === 'critical').length;
  const highCount = clauses.filter((c) => c.riskLevel === 'high').length;
  const mediumCount = clauses.filter((c) => c.riskLevel === 'medium').length;

  const totalWeightedRisk = criticalCount * 30 + highCount * 18 + mediumCount * 10;
  const healthScore = Math.max(15, 100 - totalWeightedRisk);

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
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved / Low
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
      {/* Risk Health Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Clause Risk Matrix & Redline Suite</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                On-Device Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated legal risk triage & instant mutual redlines</p>
          </div>
        </div>

        {/* Dynamic Health Score Gauge */}
        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Contract Safety Score
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                healthScore >= 75
                  ? 'text-emerald-400'
                  : healthScore >= 50
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {healthScore}/100 {healthScore >= 75 ? '(Secured)' : '(High Exposure)'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center p-1 bg-slate-950">
            <TrendingUp
              className={`w-5 h-5 ${
                healthScore >= 75
                  ? 'text-emerald-400'
                  : healthScore >= 50
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Flagged Clauses List */}
      <div className="divide-y divide-slate-800/80">
        {clauses.map((clause) => {
          const isExpanded = expandedId === clause.id;
          return (
            <div key={clause.id} className="transition-colors hover:bg-slate-850/30">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {getRiskBadge(clause.riskLevel)}
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                    {clause.sectionNumber}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{clause.title}</span>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 bg-slate-950/40 border-t border-slate-850 text-xs">
                  {/* Risk Analysis Explanation */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Legal Risk Analysis:
                    </div>
                    <p className="text-slate-200 leading-relaxed">{clause.riskReason}</p>
                  </div>

                  {/* Word-by-Word Diff View */}
                  {clause.suggestedRedline && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Interactive Redline Diff
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDraftRedline(clause)}
                            disabled={isGeneratingRedline}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Re-Draft On-Device</span>
                          </button>
                          <button
                            onClick={() => onAcceptRedline(clause.id, clause.suggestedRedline!)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Redline</span>
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
