'use client';

import React, { useState, useRef } from 'react';
import { InferenceMode } from '@/types';
import { Send, MessageSquare, ShieldCheck, Cloud, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const quickPromptsRef = useRef<HTMLDivElement>(null);

  const scrollQuickPrompts = (direction: 'left' | 'right') => {
    if (quickPromptsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      quickPromptsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
    <div className="rounded-xl border border-[#3b2d24] bg-[#1d1612]/90 shadow-2xl flex flex-col h-full min-h-[620px]">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-[#3b2d24] bg-[#18120e]/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#fdfbf7] text-sm">Contract Counsel Assistant</h3>
            <p className="text-xs text-orange-300/80 font-medium">Gemini Nano (On-Device) + Cloud Escalation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-orange-300 font-mono bg-[#341b09] px-2 py-0.5 rounded border border-orange-600/40">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span>Local Router Active</span>
        </div>
      </div>

      {/* Suggested Inquiries with Scroll Controls */}
      <div className="px-3 py-2 bg-[#140f0c]/80 border-b border-[#30241c] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollQuickPrompts('left')}
          title="Move prompts left"
          className="p-1 rounded-md bg-[#241a14] hover:bg-[#382b22] text-orange-400 border border-[#443125] transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div
          ref={quickPromptsRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1 px-1 no-scrollbar"
        >
          <span className="text-[10px] uppercase font-semibold text-[#8c786c] shrink-0 mr-1">
            Quick Audit:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(qp.prompt)}
              disabled={isProcessing}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border cursor-pointer ${
                qp.type === 'cloud'
                  ? 'bg-[#3a1d0d] border-orange-600/60 text-orange-200 hover:bg-[#4d2612] font-semibold'
                  : 'bg-[#2a201a] border-[#443125] text-[#d6c5b8] hover:bg-[#382b22] hover:text-white'
              }`}
            >
              {qp.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollQuickPrompts('right')}
          title="Move prompts right"
          className="p-1 rounded-md bg-[#241a14] hover:bg-[#382b22] text-orange-400 border border-[#443125] transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[420px] max-h-[520px] bg-[#130e0b]/60 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Meta Info */}
              <div className="flex items-center gap-2 text-[10px] text-[#8c786c] font-mono px-1">
                <span>{isUser ? 'You' : 'VaultDoc Counsel'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-xl max-w-[92%] sm:max-w-[85%] leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none shadow-orange-950/40'
                    : m.isEscalated
                    ? 'bg-[#241a14] border border-orange-600/40 text-[#f5ede7] rounded-bl-none font-sans'
                    : 'bg-[#211a15] border border-[#3c2e25] text-[#f5ede7] rounded-bl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Provenance Tag */}
                {!isUser && m.latencyMs !== undefined && (
                  <div className="mt-3 pt-2 border-t border-[#3c2e25] flex items-center justify-between text-[10px] text-[#aa9688] font-mono">
                    <span className="flex items-center gap-1.5 font-semibold">
                      {m.isEscalated ? (
                        <>
                          <Cloud className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-orange-300">Firebase Cloud (Gemini) • Redacted context</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300">Gemini Nano (On-Device) • 0 B egress</span>
                        </>
                      )}
                    </span>
                    <span className="text-orange-200/90">{m.latencyMs}ms</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-[#aa9688] p-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            <span>Analyzing contract structure on-device...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#362920] bg-[#18120e] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or request a clause redline..."
          disabled={isProcessing}
          className="flex-1 bg-[#241a14] border border-[#443125] rounded-lg px-3.5 py-2 text-xs text-[#fdfbf7] placeholder-[#8c786c] focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-orange-950/40 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
