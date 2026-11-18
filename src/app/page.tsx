'use client';

import React, { useState, useEffect } from 'react';
import {
  InferenceMode,
  ContractDocument,
  ContractClause,
  TelemetryEvent,
  AuditLogEntry,
} from '@/types';
import { GOLDEN_CONTRACTS } from '@/data/goldenContracts';
import { TelemetryHUD } from '@/components/TelemetryHUD';
import { ContractViewer } from '@/components/ContractViewer';
import { ClauseRiskMatrix } from '@/components/ClauseRiskMatrix';
import { ChatPanel, ChatMessage } from '@/components/ChatPanel';
import { RedactionGateModal } from '@/components/RedactionGateModal';
import { AuditLogDrawer } from '@/components/AuditLogDrawer';
import { UploadModal } from '@/components/UploadModal';
import { ExecutiveMemoModal } from '@/components/ExecutiveMemoModal';
import {
  checkChromeNanoAvailability,
  runFirebaseCloudInference,
} from '@/lib/firebase';
import {
  evaluateQueryRouting,
  executeLocalNanoInference,
} from '@/lib/hybridRouter';
import { maskPII } from '@/lib/redaction';
import {
  Shield,
  FilePlus,
  History,
  FileCheck2,
  Plane,
} from 'lucide-react';

export default function Home() {
  // State
  const [contracts, setContracts] = useState<ContractDocument[]>(GOLDEN_CONTRACTS);
  const [activeContract, setActiveContract] = useState<ContractDocument>(GOLDEN_CONTRACTS[0]);
  const [showRedacted, setShowRedacted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'text' | 'redlines' | 'redacted'>('text');
  const [mode, setMode] = useState<InferenceMode>('simulated_nano');
  const [hardwareNanoDetected, setHardwareNanoDetected] = useState<boolean>(false);
  const [isAirplaneMode, setIsAirplaneMode] = useState<boolean>(false);

  // Modals & Drawers
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingRedline, setIsGeneratingRedline] = useState(false);

  // Escalation Pending State
  const [pendingEscalation, setPendingEscalation] = useState<{
    query: string;
    redactedPayload: string;
    tokens: any[];
    reason: string;
  } | null>(null);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryEvent>({
    timestamp: new Date().toLocaleTimeString(),
    mode: 'simulated_nano',
    task: 'System Idle',
    bytesEgress: 0,
    latencyMs: 78,
    piiMaskedCount: activeContract.redaction.maskedCount,
    modelName: 'Gemini Nano (Local Core)',
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      documentTitle: 'Enterprise SaaS Master Services Agreement',
      action: 'PII_MASKED',
      inferenceEngine: 'Client Regex + Gemini Nano',
      bytesEgress: 0,
      piiProtectedCount: GOLDEN_CONTRACTS[0].redaction.maskedCount,
      userConsentGranted: false,
      status: 'OFFLINE_HANDLED',
    },
  ]);

  // Messages Feed
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello. I am reviewing the **${activeContract.title}** with ${activeContract.counterparty}.

I have completed a preliminary analysis on-device. All text extraction and entity masking remain in your local browser sandbox with zero network egress. You can ask questions about terms or test cross-document synthesis below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'simulated_nano',
      bytesEgress: 0,
      latencyMs: 38,
    },
  ]);

  // Check Chrome Prompt API on mount
  useEffect(() => {
    checkChromeNanoAvailability().then((res) => {
      if (res.available) {
        setHardwareNanoDetected(true);
        setMode('local_nano');
      }
    });
  }, []);

  // Update telemetry when active contract changes
  useEffect(() => {
    setTelemetry((prev) => ({
      ...prev,
      piiMaskedCount: activeContract.redaction.maskedCount,
    }));
  }, [activeContract]);

  const recordAuditLog = (
    action: AuditLogEntry['action'],
    inferenceEngine: string,
    bytesEgress: number,
    piiProtectedCount: number,
    consent: boolean
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      documentTitle: activeContract.title,
      action,
      inferenceEngine,
      bytesEgress,
      piiProtectedCount,
      userConsentGranted: consent,
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleSendMessage = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const routing = evaluateQueryRouting(query);

    if (routing.target === 'REQUIRES_CLOUD_ESCALATION') {
      if (isAirplaneMode) {
        const offlineBlockedMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `**Air-Gapped Offline Mode Active**

Cross-contract portfolio analysis requires external cloud synthesis via Firebase AI Logic. Because air-gapped mode is active, cloud network egress is blocked. Disable offline mode to preview the sanitized payload and proceed.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'simulated_nano',
          bytesEgress: 0,
          latencyMs: 14,
        };
        setMessages((prev) => [...prev, offlineBlockedMsg]);
        setIsProcessing(false);
        return;
      }

      const sanitized = maskPII(
        `Portfolio Context Query: "${query}". Subject Document: ${activeContract.title}. Clauses: ${activeContract.clauses
          .map((c) => c.title)
          .join(', ')}`
      );

      setPendingEscalation({
        query,
        redactedPayload: sanitized.redactedText,
        tokens: sanitized.tokens,
        reason: routing.reason,
      });
      setIsEscalationModalOpen(true);
      setIsProcessing(false);
      return;
    }

    try {
      const localResult = await executeLocalNanoInference(
        `Contract: ${activeContract.title}\nQuestion: ${query}`,
        mode
      );

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: localResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
        bytesEgress: 0,
        latencyMs: localResult.latencyMs,
        isEscalated: false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setTelemetry({
        timestamp: new Date().toLocaleTimeString(),
        mode,
        task: 'Local Clause Analysis',
        bytesEgress: 0,
        latencyMs: localResult.latencyMs,
        piiMaskedCount: activeContract.redaction.maskedCount,
        modelName: mode === 'local_nano' ? 'Gemini Nano (Hardware)' : 'Gemini Nano (Client Sandbox)',
      });

      recordAuditLog(
        'LOCAL_ANALYSIS',
        mode === 'local_nano' ? 'Chrome Gemini Nano' : 'Local Nano Sandbox',
        0,
        activeContract.redaction.maskedCount,
        false
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveEscalation = async () => {
    if (!pendingEscalation) return;
    setIsEscalationModalOpen(false);
    setIsProcessing(true);

    try {
      const cloudResult = await runFirebaseCloudInference(pendingEscalation.redactedPayload);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: cloudResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'cloud_gemini',
        bytesEgress: cloudResult.bytesSent,
        latencyMs: cloudResult.latencyMs,
        isEscalated: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setTelemetry({
        timestamp: new Date().toLocaleTimeString(),
        mode: 'cloud_gemini',
        task: 'Cross-Document Cloud Reasoning',
        bytesEgress: cloudResult.bytesSent,
        latencyMs: cloudResult.latencyMs,
        piiMaskedCount: pendingEscalation.tokens.length,
        modelName: 'Firebase AI Logic (Cloud Gemini)',
      });

      recordAuditLog(
        'CLOUD_ESCALATION',
        'Firebase AI Logic (Cloud Gemini)',
        cloudResult.bytesSent,
        pendingEscalation.tokens.length,
        true
      );
    } finally {
      setIsProcessing(false);
      setPendingEscalation(null);
    }
  };

  const handleAcceptRedline = (clauseId: string, redlinedText: string) => {
    setActiveContract((prev) => {
      const updatedClauses = prev.clauses.map((c) => {
        if (c.id === clauseId) {
          return {
            ...c,
            originalText: redlinedText,
            riskLevel: 'low' as const,
            riskReason: 'Amended: Replaced with mutual enterprise contracting standard.',
          };
        }
        return c;
      });

      return {
        ...prev,
        clauses: updatedClauses,
      };
    });

    if (typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((module) => {
          const confetti = module.default || module;
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        })
        .catch(() => {});
    }
  };

  const handleDraftRedline = async (clause: ContractClause) => {
    setIsGeneratingRedline(true);
    try {
      const startTime = performance.now();
      await new Promise((res) => setTimeout(res, 280));
      const latencyMs = Math.round(performance.now() - startTime);

      setTelemetry({
        timestamp: new Date().toLocaleTimeString(),
        mode,
        task: 'On-Device Redline Amendment',
        bytesEgress: 0,
        latencyMs,
        piiMaskedCount: activeContract.redaction.maskedCount,
        modelName: 'Gemini Nano (Drafting Engine)',
      });

      recordAuditLog(
        'LOCAL_REDLINE',
        'Gemini Nano (Local)',
        0,
        activeContract.redaction.maskedCount,
        false
      );
    } finally {
      setIsGeneratingRedline(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#140f0c] text-[#fdfbf7] font-sans selection:bg-orange-600/30 selection:text-orange-200">
      {/* Top Real-Time Telemetry HUD */}
      <TelemetryHUD
        mode={mode}
        onModeChange={setMode}
        telemetry={telemetry}
        hardwareNanoDetected={hardwareNanoDetected}
        totalPIIProtected={activeContract.redaction.maskedCount}
        isAirplaneMode={isAirplaneMode}
        onToggleAirplaneMode={setIsAirplaneMode}
      />

      {/* Main Container */}
      <main className="max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:px-8 space-y-6 pb-16">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1713]/90 p-3.5 rounded-xl border border-[#3b2d24] shadow-md">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-[#aa9688] uppercase tracking-wider">
              Selected Agreement:
            </span>
            <select
              value={activeContract.id}
              onChange={(e) => {
                const found = contracts.find((c) => c.id === e.target.value);
                if (found) setActiveContract(found);
              }}
              className="bg-[#241a14] text-orange-200 font-bold border border-[#443125] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-inner"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.type})
                </option>
              ))}
            </select>
            {isAirplaneMode && (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#341b09] text-orange-200 border border-orange-600/40">
                <Plane className="w-3 h-3 text-orange-400" /> Offline Protected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMemoModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#2a201a] hover:bg-[#382b22] text-[#f2e7df] text-xs font-medium flex items-center gap-1.5 border border-[#443125] transition-colors shadow-sm cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Executive Memo</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-orange-950/40 cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Ingest Contract</span>
            </button>
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#2a201a] hover:bg-[#382b22] text-[#f2e7df] text-xs font-medium flex items-center gap-1.5 border border-[#443125] transition-colors shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span>Audit Ledger ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Document & Risk Matrix on Left, Chat Copilot on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Document Viewer & Clause Risk Matrix */}
          <div className="lg:col-span-7 space-y-6">
            <ContractViewer
              contract={activeContract}
              onUploadContract={(newDoc) => {
                setContracts((prev) => [newDoc, ...prev]);
                setActiveContract(newDoc);
              }}
              showRedacted={showRedacted}
              onToggleRedacted={setShowRedacted}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenMemo={() => setIsMemoModalOpen(true)}
            />

            <ClauseRiskMatrix
              clauses={activeContract.clauses}
              onDraftRedline={handleDraftRedline}
              onAcceptRedline={handleAcceptRedline}
              isGeneratingRedline={isGeneratingRedline}
            />
          </div>

          {/* Right Column: Legal Assistant Chat Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                activeMode={mode}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <RedactionGateModal
        isOpen={isEscalationModalOpen}
        query={pendingEscalation?.query || ''}
        redactedPayload={pendingEscalation?.redactedPayload || ''}
        tokens={pendingEscalation?.tokens || []}
        reason={pendingEscalation?.reason || ''}
        onApprove={handleApproveEscalation}
        onCancel={() => {
          setIsEscalationModalOpen(false);
          setPendingEscalation(null);
        }}
      />

      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
      />

      <ExecutiveMemoModal
        isOpen={isMemoModalOpen}
        onClose={() => setIsMemoModalOpen(false)}
        contract={activeContract}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddContract={(newDoc) => {
          setContracts((prev) => [newDoc, ...prev]);
          setActiveContract(newDoc);
        }}
      />

      {/* Footer Branding */}
      <footer className="w-full border-t border-[#261d17] bg-[#100c09] py-6 text-center text-xs text-[#8c786c]">
        <div className="max-w-[1720px] w-full mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8 gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium text-[#aa9688]">VaultDoc</span>
            <span>• Built for #BuildHybridAI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-3 text-[#aa9688] font-mono text-[11px]">
            <span>Chrome Gemini Nano (On-Device)</span>
            <span>•</span>
            <span>Firebase AI Logic (Cloud Escalation)</span>
            <span>•</span>
            <span>Firestore Audit Log</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
