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
import { Sidebar } from '@/components/Sidebar';
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
    task: 'Idle',
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

I have completed a preliminary review of the covenants on-device. All text extraction and entity masking remain in your local browser sandbox with zero network egress. You can ask questions about terms or test cross-document synthesis below.`,
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

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
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
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        contracts={contracts}
        activeContractId={activeContract.id}
        onSelectContract={setActiveContract}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAudit={() => setIsAuditDrawerOpen(true)}
        mode={mode}
        onModeChange={setMode}
        isAirplaneMode={isAirplaneMode}
        onToggleAirplaneMode={setIsAirplaneMode}
        bytesEgress={telemetry.bytesEgress}
        totalPIIProtected={activeContract.redaction.maskedCount}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Center: Document & Risk Assessment Stage */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

        {/* Right: Legal Assistant Chat Panel */}
        <div className="w-[420px] border-l border-zinc-800/80 bg-zinc-950/60 p-4 flex flex-col h-full shrink-0">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            activeMode={mode}
          />
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
    </div>
  );
}
