'use client';

import React from 'react';
import { ContractDocument, InferenceMode } from '@/types';
import {
  FileText,
  Shield,
  History,
  Plus,
  Lock,
  Wifi,
  WifiOff,
  Cpu,
  ChevronRight,
  FolderGit2,
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarProps {
  contracts: ContractDocument[];
  activeContractId: string;
  onSelectContract: (contract: ContractDocument) => void;
  onOpenUpload: () => void;
  onOpenAudit: () => void;
  mode: InferenceMode;
  onModeChange: (mode: InferenceMode) => void;
  isAirplaneMode: boolean;
  onToggleAirplaneMode: (val: boolean) => void;
  bytesEgress: number;
  totalPIIProtected: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  contracts,
  activeContractId,
  onSelectContract,
  onOpenUpload,
  onOpenAudit,
  mode,
  onModeChange,
  isAirplaneMode,
  onToggleAirplaneMode,
  bytesEgress,
  totalPIIProtected,
}) => {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-screen shrink-0 text-zinc-300 select-none">
      {/* Brand & Workspace */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-bold text-sm shadow-sm">
              <Lock className="w-3.5 h-3.5 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-100 text-sm tracking-tight">VaultDoc</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                  v1.2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Pill */}
        <div className="px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-zinc-200 truncate">Acme Legal Ops</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Enterprise</span>
        </div>
      </div>

      {/* Navigation / Contract Repository */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Contracts ({contracts.length})
            </span>
            <button
              onClick={onOpenUpload}
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
              title="Add agreement"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {contracts.map((c) => {
              const isActive = c.id === activeContractId;
              const criticalRisks = c.clauses.filter((cl) => cl.riskLevel === 'critical').length;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectContract(c)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 group ${
                    isActive
                      ? 'bg-zinc-850 text-zinc-100 font-medium shadow-sm border border-zinc-750'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`} />
                  <div className="truncate flex-1">
                    <div className="truncate font-medium">{c.title}</div>
                    <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <span>{c.type}</span>
                      <span>•</span>
                      <span>{c.counterparty}</span>
                    </div>
                  </div>
                  {criticalRisks > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-900/60">
                      {criticalRisks}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compliance & Audit Link */}
        <div>
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 block mb-2">
            Governance
          </span>
          <button
            onClick={onOpenAudit}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              <span>Audit Trail & Receipts</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Privacy & Engine Telemetry Widget (Clean & Human) */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-925 space-y-3">
        {/* Network & Egress Status */}
        <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${bytesEgress === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              Inference Egress
            </span>
            <span className="font-mono text-zinc-200 font-semibold">
              {bytesEgress === 0 ? '0 B (Local)' : `${bytesEgress} B`}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-500 pt-1 border-t border-zinc-800/60 text-[10px]">
            <span>PII Shielded:</span>
            <span className="text-zinc-300 font-mono font-medium">{totalPIIProtected} entities</span>
          </div>
        </div>

        {/* Offline Toggle */}
        <button
          onClick={() => onToggleAirplaneMode(!isAirplaneMode)}
          className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center justify-between transition-colors ${
            isAirplaneMode
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAirplaneMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{isAirplaneMode ? 'Air-Gapped (Offline)' : 'Online Mode'}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
            {isAirplaneMode ? 'Active' : 'Live'}
          </span>
        </button>

        {/* Engine Selector */}
        <div className="pt-1">
          <label className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1 px-0.5">
            AI Engine
          </label>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as InferenceMode)}
            className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="simulated_nano">Gemini Nano (Local Sandbox)</option>
            <option value="local_nano">Chrome Prompt API (Native Nano)</option>
            <option value="cloud_gemini">Firebase AI Logic (Cloud Fallback)</option>
          </select>
        </div>
      </div>
    </aside>
  );
};
