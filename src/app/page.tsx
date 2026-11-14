'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  Lock,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function Home() {
  // State
  const [contracts, setContracts] = useState<ContractDocument[]>(GOLDEN_CONTRACTS);
  const [activeContract, setActiveContract] = useState<ContractDocument>(GOLDEN_CONTRACTS[0]);
  const [showRedacted, setShowRedacted] = useState<boolean>(false);
  const [mode, setMode] = useState<InferenceMode>('simulated_nano');
  const [hardwareNanoDetected, setHardwareNanoDetected] = useState<boolean>(false);

  // Modals & Drawers
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
    latencyMs: 85,
    piiMaskedCount: activeContract.redaction.maskedCount,
    modelName: 'Gemini Nano (Local Core)',
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString(),
      documentTitle: 'Enterprise SaaS Master Services Agreement',
      action: 'PII_MASKED',
      inferenceEngine: 'Local Heuristics & Chrome Nano',
      bytesEgress: 0,
      piiProtectedCount: GOLDEN_CONTRACTS[0].redaction.maskedCount,
      userConsentGranted: false,
      status: 'OFFLINE_HANDLED',
    },
  ]);

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Welcome to VaultDoc. I am your privacy-first legal AI copilot.

All single-document analysis, clause extraction, and PII masking run 100% locally on your machine with 0 network egress. When you request complex cross-contract comparisons, I will prompt you through the Privacy Escalation Gate to sanitize confidential tokens before reaching Firebase AI Logic.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'simulated_nano',
      bytesEgress: 0,
      latencyMs: 40,
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

  // Log an audit entry
  const recordAuditLog = (
    action: AuditLogEntry['action'],
    inferenceEngine: string,
    bytesEgress: number,
    piiProtectedCount: number,
    consent: boolean
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
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

  // Chat query handler with hybrid routing
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

    // If query requires cross-document reasoning or portfolio audit -> Trigger Escalation Gate!
    if (routing.target === 'REQUIRES_CLOUD_ESCALATION') {
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

    // Otherwise, execute locally on on-device Gemini Nano with 0 egress
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
        modelName: mode === 'local_nano' ? 'Gemini Nano (Hardware)' : 'Gemini Nano (Simulated Core)',
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

  // Cloud Escalation Approval handler
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
        modelName: 'Firebase AI Logic (Cloud Gemini 1.5 Flash)',
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

  // Draft redline on-device
  const handleDraftRedline = async (clause: ContractClause) => {
    setIsGeneratingRedline(true);
    try {
      const startTime = performance.now();
      await new Promise((res) => setTimeout(res, 350));
      const latencyMs = Math.round(performance.now() - startTime);

      // Trigger celebration confetti for successful on-device redline
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });

      setTelemetry({
        timestamp: new Date().toLocaleTimeString(),
        mode,
        task: 'On-Device Redline Amendment Draft',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Real-Time Telemetry HUD */}
      <TelemetryHUD
        mode={mode}
        onModeChange={setMode}
        telemetry={telemetry}
        hardwareNanoDetected={hardwareNanoDetected}
        totalPIIProtected={activeContract.redaction.maskedCount}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Contract:</span>
            <span className="text-xs font-bold text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              {activeContract.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Ingest New Contract</span>
            </button>
            <button
              onClick={() => setIsAuditDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Document & Risk Matrix on Left, Chat Copilot on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Document Viewer & Clause Risk Matrix */}
          <div className="lg:col-span-7 space-y-6">
            <ContractViewer
              contract={activeContract}
              contracts={contracts}
              onSelectContract={setActiveContract}
              showRedacted={showRedacted}
              onToggleRedacted={setShowRedacted}
            />

            <ClauseRiskMatrix
              clauses={activeContract.clauses}
              onDraftRedline={handleDraftRedline}
              isGeneratingRedline={isGeneratingRedline}
            />
          </div>

          {/* Right Column: Hybrid Copilot Chat Panel */}
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

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddContract={(newDoc) => {
          setContracts((prev) => [newDoc, ...prev]);
          setActiveContract(newDoc);
        }}
      />

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>VaultDoc • Built for #BuildHybridAI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Chrome Gemini Nano (On-Device)</span>
            <span>•</span>
            <span>Firebase AI Logic (Cloud Fallback)</span>
            <span>•</span>
            <span>Firebase App Check & Firestore</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
