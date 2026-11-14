'use client';

import React, { useState } from 'react';
import { ContractDocument } from '@/types';
import { maskPII } from '@/lib/redaction';
import { Upload, X, Check } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContract: (contract: ContractDocument) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAddContract }) => {
  const [title, setTitle] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [type, setType] = useState<ContractDocument['type']>('Custom');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const redaction = maskPII(text, [counterparty]);

    const newDoc: ContractDocument = {
      id: `custom-doc-${Date.now()}`,
      title: title.trim(),
      type,
      counterparty: counterparty.trim() || 'Third-Party Entity',
      effectiveDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rawText: text.trim(),
      clauses: [
        {
          id: `c-custom-1`,
          title: 'Imported Agreement Structure',
          sectionNumber: 'Section 1',
          originalText: text.slice(0, 180) + '...',
          summary: 'Agreement ingested locally in browser sandbox memory with zero external requests.',
          riskLevel: 'medium',
          riskReason: 'Processed entirely on-device.',
          suggestedRedline: 'Standard enterprise mutual terms recommended.',
        },
      ],
      redaction,
      isPreloaded: false,
    };

    onAddContract(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden text-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Import Agreement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Contract Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Services Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Counterparty</label>
              <input
                type="text"
                placeholder="e.g. Global Tech LLC"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Agreement Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContractDocument['type'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="Custom">Custom Agreement</option>
                <option value="SaaS MSA">SaaS MSA</option>
                <option value="DPA">Data Processing Addendum (DPA)</option>
                <option value="Consulting / IP">Consulting & IP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Contract Text</label>
            <textarea
              required
              rows={6}
              placeholder="Paste contract terms or clause text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 text-[11px] leading-relaxed">
            Content is parsed and tokenized in browser memory. No external API transmission occurs during ingestion.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Import Agreement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
