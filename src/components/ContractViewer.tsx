'use client';

import React, { useState, useRef } from 'react';
import { ContractDocument } from '@/types';
import { maskPII } from '@/lib/redaction';
import {
  FileText,
  Shield,
  Eye,
  Lock,
  Calendar,
  Building,
  Upload,
  Search,
  Download,
  Check,
} from 'lucide-react';

interface ContractViewerProps {
  contract: ContractDocument;
  contracts: ContractDocument[];
  onSelectContract: (contract: ContractDocument) => void;
  onUploadContract: (newDoc: ContractDocument) => void;
  showRedacted: boolean;
  onToggleRedacted: (show: boolean) => void;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  contracts,
  onSelectContract,
  onUploadContract,
  showRedacted,
  onToggleRedacted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export contract as markdown / txt
  const handleExportContract = () => {
    const textToExport = showRedacted ? contract.redaction.redactedText : contract.rawText;
    const blob = new Blob([textToExport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.title.toLowerCase().replace(/\s+/g, '-')}-${
      showRedacted ? 'redacted' : 'original'
    }.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Handle client-side file drop (PDF / TXT / MD)
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLocalFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLocalFile(file);
  };

  const processLocalFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const title = file.name.replace(/\.[^/.]+$/, '');
      const redaction = maskPII(content);

      const customDoc: ContractDocument = {
        id: `uploaded-${Date.now()}`,
        title,
        type: 'Custom',
        counterparty: 'Imported Counterparty',
        effectiveDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        rawText: content,
        clauses: [
          {
            id: `c-upload-1`,
            title: 'Imported Agreement Structure',
            sectionNumber: 'Document Scope',
            originalText: content.slice(0, 200) + '...',
            summary: 'File parsed 100% in-browser memory. Zero external server uploads.',
            riskLevel: 'medium',
            riskReason: 'Processed locally via client sandbox.',
            suggestedRedline: 'Standard mutual liability covenants recommended.',
          },
        ],
        redaction,
        isPreloaded: false,
      };

      onUploadContract(customDoc);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
      className={`rounded-xl border bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col h-full transition-all ${
        isDragging ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
      }`}
    >
      {/* Top Bar / Contract Selector & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400 shrink-0" />
          <select
            value={contract.id}
            onChange={(e) => {
              const selected = contracts.find((c) => c.id === e.target.value);
              if (selected) onSelectContract(selected);
            }}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.type})
              </option>
            ))}
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Drop or upload any agreement locally"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drop File</span>
          </button>
        </div>

        {/* View Mode Toggle (Raw vs Redacted) & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onToggleRedacted(false)}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                !showRedacted ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
            <button
              onClick={() => onToggleRedacted(true)}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                showRedacted
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PII Masked</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                {contract.redaction.maskedCount}
              </span>
            </button>
          </div>

          <button
            onClick={handleExportContract}
            title="Download contract"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Metadata Bar */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-850 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Counterparty:</span>
            <strong className="text-slate-200">{contract.counterparty}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Effective:</span>
            <strong className="text-slate-200">{contract.effectiveDate}</strong>
          </div>
        </div>

        {/* In-Document Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search clauses or terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
          />
        </div>
      </div>

      {/* Contract Text Body */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[440px] bg-slate-950/80 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
        {showRedacted ? (
          <div className="text-emerald-300/90 leading-relaxed">
            {contract.redaction.redactedText}
          </div>
        ) : (
          <div className="leading-relaxed">{contract.rawText}</div>
        )}
      </div>

      {/* Bottom Drop Zone Hint */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/60 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3 text-emerald-400" />
        <span>Drop any contract, PDF, or NDA directly onto this panel for private in-browser analysis</span>
      </div>
    </div>
  );
};
