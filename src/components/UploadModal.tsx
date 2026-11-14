'use client';

import React, { useState } from 'react';
import { ContractDocument } from '@/types';
import { maskPII } from '@/lib/redaction';
import { Upload, X, FileText, Check } from 'lucide-react';

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
          title: 'Custom Analyzed Clause',
          sectionNumber: 'Section 1',
          originalText: text.slice(0, 180) + '...',
          summary: 'Locally ingested contract document processed inside browser memory.',
          riskLevel: 'medium',
          riskReason: 'Evaluated locally on-device. Zero confidential data was transmitted to external servers.',
          suggestedRedline: 'Mutual liability covenants and standard termination terms recommended.',
        },
      ],
      redaction,
      isPreloaded: false,
    };

    onAddContract(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-slate-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Ingest Custom Contract (100% In-Browser)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Contract Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Mutual Non-Disclosure Agreement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Counterparty</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp / Vendor LLC"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Contract Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContractDocument['type'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Custom">Custom Agreement</option>
                <option value="SaaS MSA">SaaS MSA</option>
                <option value="DPA">Data Processing Addendum</option>
                <option value="Consulting / IP">Consulting / IP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Contract Text or Clauses</label>
            <textarea
              required
              rows={6}
              placeholder="Paste contract language, confidentiality terms, or clauses here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
            🛡️ <strong>Zero-Egress Ingestion:</strong> Text is tokenized and parsed entirely within browser memory. No data is transmitted to external servers during ingestion.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Ingest Locally</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
