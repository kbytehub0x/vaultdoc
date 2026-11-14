'use client';

import React from 'react';
import { InferenceMode, TelemetryEvent } from '@/types';
import {
  ShieldCheck,
  Cloud,
  Cpu,
  Activity,
  Lock,
  Plane,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface TelemetryHUDProps {
  mode: InferenceMode;
  onModeChange: (mode: InferenceMode) => void;
  telemetry: TelemetryEvent;
  hardwareNanoDetected: boolean;
  totalPIIProtected: number;
  isAirplaneMode: boolean;
  onToggleAirplaneMode: (enabled: boolean) => void;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  mode,
  onModeChange,
  telemetry,
  hardwareNanoDetected,
  totalPIIProtected,
  isAirplaneMode,
  onToggleAirplaneMode,
}) => {
  const isLocal = mode === 'local_nano' || mode === 'simulated_nano';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Purpose */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">VaultDoc</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Hybrid AI Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400">Built for Google Firebase #BuildHybridAI</p>
          </div>
        </div>

        {/* Live Telemetry & Offline Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
          {/* Airplane Mode Demo Simulator */}
          <button
            onClick={() => onToggleAirplaneMode(!isAirplaneMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono transition-all cursor-pointer ${
              isAirplaneMode
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAirplaneMode ? (
              <>
                <Plane className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="font-bold">Offline / Airplane Mode ON</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate Offline Mode</span>
              </>
            )}
          </button>

          {/* Egress Counter */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono transition-colors ${
              telemetry.bytesEgress === 0
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-current shrink-0" />
            <span className="text-slate-400">Data Egress:</span>
            <span className="font-bold">
              {telemetry.bytesEgress === 0 ? '0 Bytes (Pure Local)' : `${telemetry.bytesEgress} Bytes (Redacted)`}
            </span>
          </div>

          {/* Latency Meter */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Latency:</span>
            <span className="font-semibold text-white">{telemetry.latencyMs}ms</span>
          </div>

          {/* PII Protected Count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400">PII Masked:</span>
            <span className="font-bold">{totalPIIProtected} Tokens</span>
          </div>

          {/* Active Engine Selector (Judge Fail-Safe Switch) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as InferenceMode)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="simulated_nano">
                🟢 Simulated Gemini Nano (Offline Sandbox)
              </option>
              <option value="local_nano">
                {hardwareNanoDetected
                  ? '⚡ Chrome Prompt API (Hardware Nano)'
                  : '⚠️ Chrome Prompt API (Flags Req.)'}
              </option>
              <option value="cloud_gemini">
                ☁️ Direct Cloud Escalation (Firebase AI Logic)
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
