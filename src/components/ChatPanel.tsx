'use client';

import React, { useState } from 'react';
import { InferenceMode } from '@/types';
import { Send, MessageSquare, ShieldCheck, Cloud, Terminal } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: InferenceMode;
  bytesEgress?: number;
  latencyMs?: number;
  isEscalated?: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => Promise<void>;
  isProcessing: boolean;
  activeMode: InferenceMode;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  activeMode,
}) => {
  const [input, setInput] = useState('');

  const quickPrompts = [
    {
      label: 'Analyze liability cap',
      prompt: 'What is our liability cap and risk exposure in this agreement?',
      type: 'local',
    },
    {
      label: 'Termination notice',
      prompt: 'Can we terminate for convenience, and what are the notice terms?',
      type: 'local',
    },
    {
      label: '⚡ Compare with standard MSA',
      prompt: 'Compare this agreement against all vendor contracts and identify conflicting indemnity and liability terms.',
      type: 'cloud',
    },
    {
      label: 'Draft mutual indemnity',
      prompt: 'Draft a balanced mutual indemnification redline with IP infringement protection.',
      type: 'local',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col h-full min-h-[580px]">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Contract Counsel Assistant</h3>
            <p className="text-xs text-slate-400">On-Device Reasoning + Cloud Escalation Gate</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Router Active</span>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0 mr-1">
          Quick Audit:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp.prompt)}
            disabled={isProcessing}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border cursor-pointer ${
              qp.type === 'cloud'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px] bg-slate-950/50 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Meta Info */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono px-1">
                <span>{isUser ? 'You' : 'VaultDoc Counsel'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-xl max-w-[92%] sm:max-w-[85%] leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : m.isEscalated
                    ? 'bg-slate-900 border border-amber-500/30 text-slate-200 rounded-bl-none font-sans'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Provenance Tag */}
                {!isUser && m.latencyMs !== undefined && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      {m.isEscalated ? (
                        <>
                          <Cloud className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-300">Firebase Cloud (Gemini) • Redacted context</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Gemini Nano • 0 B egress</span>
                        </>
                      )}
                    </span>
                    <span>{m.latencyMs}ms</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Analyzing contract structure on-device...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request a clause redline..."
          disabled={isProcessing}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
