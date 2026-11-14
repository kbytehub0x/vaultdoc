'use client';

import React, { useState } from 'react';
import { InferenceMode } from '@/types';
import { Send, Sparkles, Shield, Cloud, Terminal, Cpu, ArrowUpRight } from 'lucide-react';

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
      label: 'Summarize Liability Cap',
      prompt: 'What is our liability cap and risk exposure in this agreement?',
      type: 'local',
    },
    {
      label: 'Check Termination Rights',
      prompt: 'Can we terminate for convenience, and what are the notice terms?',
      type: 'local',
    },
    {
      label: '⚡ Cross-Contract Portfolio Conflict',
      prompt: 'Compare this agreement against all vendor contracts and identify conflicting indemnity and liability terms.',
      type: 'cloud',
    },
    {
      label: 'Draft Safe Mutual Indemnity',
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl flex flex-col h-full min-h-[520px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Hybrid Copilot Q&A</h2>
            <p className="text-xs text-slate-400">Local Zero-Egress Reasoning + On-Demand Cloud Escalation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Hybrid Router Ready</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-850 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] shrink-0">
          Quick Audit:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp.prompt)}
            disabled={isProcessing}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              qp.type === 'cloud'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[420px] bg-slate-950/60 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Header Badge */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1">
                {isUser ? (
                  <span>You ({m.timestamp})</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {m.isEscalated ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-semibold">
                        <Cloud className="w-3 h-3 text-amber-400" />
                        Firebase AI Logic (Cloud Gemini) | {m.bytesEgress}B Egress | {m.latencyMs}ms
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        On-Device Gemini Nano | 0 Bytes Egress | {m.latencyMs}ms
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-xl max-w-[90%] sm:max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : m.isEscalated
                    ? 'bg-slate-900 border border-amber-500/20 text-slate-200 rounded-bl-none font-sans'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-sans'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Processing via hybrid inference routing...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about obligations, caps, or ask for cross-contract audit..."
          disabled={isProcessing}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
