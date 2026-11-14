'use client';

import React, { useState } from 'react';
import { InferenceMode } from '@/types';
import { Send, Sparkles, MessageSquare, ArrowUpRight, ShieldCheck, Cloud } from 'lucide-react';

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
      label: 'Termination terms',
      prompt: 'Can we terminate for convenience, and what are the notice terms?',
      type: 'local',
    },
    {
      label: 'Compare with standard MSA',
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-sm flex flex-col h-full min-h-[580px]">
      {/* Panel Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <h3 className="font-semibold text-zinc-100 text-sm">Contract Counsel Assistant</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Local Router</span>
        </div>
      </div>

      {/* Suggested Inquiries (Natural Human Legal Prompts) */}
      <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-semibold text-zinc-500 shrink-0 mr-1">
          Inquiries:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp.prompt)}
            disabled={isProcessing}
            className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
              qp.type === 'cloud'
                ? 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-zinc-500'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
            }`}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px] bg-zinc-950/40 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Meta Info */}
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono px-1">
                <span>{isUser ? 'You' : 'VaultDoc Counsel'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-xl max-w-[92%] sm:max-w-[85%] leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-100 rounded-br-none border border-zinc-700/50'
                    : 'bg-zinc-900/90 text-zinc-200 rounded-bl-none border border-zinc-800'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Subtle, non-intrusive execution provenance tag */}
                {!isUser && m.latencyMs !== undefined && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      {m.isEscalated ? (
                        <>
                          <Cloud className="w-3 h-3 text-zinc-400" />
                          <span>Firebase AI Cloud • Redacted context</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Gemini Nano • 0 B egress</span>
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
          <div className="flex items-center gap-2 text-xs text-zinc-500 p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-ping" />
            <span>Analyzing contract structure...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request a clause redline..."
          disabled={isProcessing}
          className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
