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
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
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
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/30 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Moderate
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved / Low
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm">Clause Risk Matrix & Redline Suite</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                On-Device Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated legal risk triage & instant mutual redlines
            </p>
          </div>
        </div>

        {/* Dynamic Safety Score Gauge */}
        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-sm">
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
          <div className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center p-1 bg-slate-950 shadow-inner">
            <TrendingUp
              className={`w-4 h-4 ${
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

      {/* Accordion Clauses */}
      <div className="divide-y divide-slate-800/80">
        {clauses.map((clause) => {
          const isExpanded = expandedId === clause.id;
          return (
            <div key={clause.id} className="transition-colors hover:bg-slate-850/40">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {getRiskBadge(clause.riskLevel)}
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {clause.sectionNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{clause.title}</span>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3.5 bg-slate-950/40 border-t border-slate-850 text-xs">
                  {/* Counsel Explanation */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Legal Risk Analysis:
                    </div>
                    <p className="text-slate-200 leading-relaxed">{clause.riskReason}</p>
                  </div>

                  {/* Redline Diff */}
                  {clause.suggestedRedline && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          Interactive Redline Diff (Drafted On-Device):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDraftRedline(clause)}
                            disabled={isGeneratingRedline}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            <RotateCcw className="w-3 h-3 text-purple-400" />
                            <span>Re-Draft</span>
                          </button>
                          <button
                            onClick={() => onAcceptRedline(clause.id, clause.suggestedRedline!)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
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
