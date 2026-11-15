'use client';

import React, { useState, useRef } from 'react';
import { ContractDocument } from '@/types';
import { maskPII } from '@/lib/redaction';
import {
  FileText,
  Eye,
  Lock,
  Calendar,
  Building,
  Upload,
  Search,
  Download,
  Tag,
  FileCheck2,
} from 'lucide-react';

interface ContractViewerProps {
  contract: ContractDocument;
  onUploadContract: (newDoc: ContractDocument) => void;
  showRedacted: boolean;
  onToggleRedacted: (show: boolean) => void;
  activeTab: 'text' | 'redlines' | 'redacted';
  onTabChange: (tab: 'text' | 'redlines' | 'redacted') => void;
  onOpenMemo: () => void;
}

export const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  onUploadContract,
  showRedacted,
  onToggleRedacted,
  activeTab,
  onTabChange,
  onOpenMemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportContract = () => {
    const textToExport = showRedacted ? contract.redaction.redactedText : contract.rawText;
    const blob = new Blob([textToExport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
        counterparty: 'Imported Entity',
        effectiveDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        rawText: content,
        clauses: [
          {
            id: `c-upload-1`,
            title: 'Uploaded Agreement Analysis',
            sectionNumber: 'Section 1',
            originalText: content.slice(0, 200) + '...',
            summary: 'File parsed locally in client browser memory with zero network egress.',
            riskLevel: 'medium',
            riskReason: 'Processed entirely on-device.',
            suggestedRedline: 'Standard enterprise mutual terms recommended.',
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
      className={`rounded-xl border bg-zinc-900/80 shadow-sm flex flex-col h-full transition-all ${
        isDragging ? 'border-zinc-500 ring-2 ring-zinc-500/20' : 'border-zinc-800'
      }`}
    >
      {/* Top Document Header Bar */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Document Title & Meta */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-zinc-100 text-sm">{contract.title}</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
              {contract.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3 text-zinc-500" />
              {contract.counterparty}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" />
              Effective: {contract.effectiveDate}
            </span>
          </div>
        </div>

        {/* View Tabs (Text vs Redacted) & Actions */}
        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => onToggleRedacted(false)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                !showRedacted ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Original Text
            </button>
            <button
              onClick={() => onToggleRedacted(true)}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                showRedacted
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Masked View</span>
              <span className="text-[10px] font-mono bg-zinc-900 px-1.5 py-0.2 rounded text-zinc-400">
                {contract.redaction.maskedCount}
              </span>
            </button>
          </div>

          {/* Legal Memo Button */}
          <button
            onClick={onOpenMemo}
            title="Generate executive legal memo"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Executive Memo</span>
          </button>

          {/* Upload & Export */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import custom document"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/80 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExportContract}
            title="Export markdown"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700/80 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subheader: Filter & Search Bar */}
      <div className="px-5 py-2 bg-zinc-950/40 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-zinc-500" />
          <span>{contract.clauses.length} Flagged Covenants</span>
          <span>•</span>
          <span className="text-zinc-400">{contract.redaction.tokens.length} PII Tokens Indexed</span>
        </div>

        <div className="relative">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Filter document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 w-36"
          />
        </div>
      </div>

      {/* Main Document Reading Canvas */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[460px] bg-zinc-950/70 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap select-text">
        {showRedacted ? (
          <div className="text-zinc-300 leading-relaxed font-mono">
            {contract.redaction.redactedText}
          </div>
        ) : (
          <div className="text-zinc-300 leading-relaxed font-mono">
            {contract.rawText}
          </div>
        )}
      </div>

      {/* Subtle Bottom Status Note */}
      <div className="px-5 py-2 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Local Document Sandbox • Memory-Only Storage
        </span>
        <span className="text-zinc-600 font-mono">UTF-8 • {contract.rawText.length} chars</span>
      </div>
    </div>
  );
};
