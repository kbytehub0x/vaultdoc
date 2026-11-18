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
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-950/80 text-orange-200 border border-red-700/50 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#3d1a08] text-amber-300 border border-amber-600/50 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2a201a] text-[#d6c5b8] border border-[#443125] shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> Moderate
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#261f12] text-amber-200 border border-amber-700/40 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Resolved / Low
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-[#3b2d24] bg-[#1d1612]/90 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-[#3b2d24] bg-[#18120e]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-[#fdfbf7] text-sm">Clause Risk Matrix & Redline Suite</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#341b09] text-orange-200 border border-orange-600/40">
                Gemini Nano On-Device
              </span>
            </div>
            <p className="text-xs text-orange-200/80 mt-0.5 font-medium">
              Automated on-device legal risk triage & instant mutual redlines
            </p>
          </div>
        </div>

        {/* Dynamic Safety Score Gauge */}
        <div className="flex items-center gap-3 bg-[#241a14] px-3.5 py-1.5 rounded-lg border border-[#3b2d24] shadow-sm">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#aa9688]">
              Contract Safety Score
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                healthScore >= 75
                  ? 'text-amber-300'
                  : healthScore >= 50
                  ? 'text-orange-400'
                  : 'text-red-400'
              }`}
            >
              {healthScore}/100 {healthScore >= 75 ? '(Secured)' : '(High Exposure)'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full border border-[#443125] flex items-center justify-center p-1 bg-[#140f0c] shadow-inner">
            <TrendingUp
              className={`w-4 h-4 ${
                healthScore >= 75
                  ? 'text-amber-300'
                  : healthScore >= 50
                  ? 'text-orange-400'
                  : 'text-red-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Accordion Clauses */}
      <div className="divide-y divide-[#30241c]">
        {clauses.map((clause) => {
          const isExpanded = expandedId === clause.id;
          return (
            <div key={clause.id} className="transition-colors hover:bg-[#261d17]">
              <button
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {getRiskBadge(clause.riskLevel)}
                  <span className="text-xs font-mono text-[#d6c5b8] bg-[#2a201a] px-2 py-0.5 rounded border border-[#443125]">
                    {clause.sectionNumber}
                  </span>
                  <span className="text-xs font-semibold text-[#fdfbf7]">{clause.title}</span>
                </div>
                <div className="text-[#aa9688]">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-3.5 bg-[#140f0c]/60 border-t border-[#30241c] text-xs">
                  {/* Counsel Explanation */}
                  <div className="p-3.5 rounded-lg bg-[#1f1813] border border-[#382a20] space-y-1">
                    <div className="text-[#aa9688] font-semibold uppercase tracking-wider text-[10px]">
                      Legal Risk Analysis:
                    </div>
                    <p className="text-[#ded5ce] leading-relaxed">{clause.riskReason}</p>
                  </div>

                  {/* Redline Diff */}
                  {clause.suggestedRedline && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-orange-400 font-semibold flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          Interactive Redline Diff (Drafted On-Device):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDraftRedline(clause)}
                            disabled={isGeneratingRedline}
                            className="px-2.5 py-1 rounded bg-[#2a201a] hover:bg-[#382b22] text-[#f2e7df] text-[11px] font-medium border border-[#443125] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            <RotateCcw className="w-3 h-3 text-orange-400" />
                            <span>Re-Draft</span>
                          </button>
                          <button
                            onClick={() => onAcceptRedline(clause.id, clause.suggestedRedline!)}
                            className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-orange-950/40 transition-all cursor-pointer"
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
