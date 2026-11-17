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
  Shield,
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
      className={`rounded-xl border bg-[#1d1612]/90 shadow-2xl flex flex-col h-full transition-all ${
        isDragging ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-[#3b2d24]'
      }`}
    >
      {/* Top Document Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#3b2d24] bg-[#18120e]/80 flex flex-wrap items-center justify-between gap-3">
        {/* Document Title & Meta */}
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <h1 className="font-bold text-[#fdfbf7] text-sm">{contract.title}</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2a201a] text-orange-200 border border-[#443125]">
              {contract.type}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#aa9688] mt-1">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#8c786c]" />
              {contract.counterparty}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#8c786c]" />
              Effective: {contract.effectiveDate}
            </span>
          </div>
        </div>

        {/* View Tabs (Text vs Redacted) & Actions */}
        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="flex items-center bg-[#140f0c] p-1 rounded-lg border border-[#3b2d24] text-xs">
            <button
              onClick={() => onToggleRedacted(false)}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                !showRedacted ? 'bg-[#2a201a] text-white shadow-sm' : 'text-[#aa9688] hover:text-[#fdfbf7]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Original
              </span>
            </button>
            <button
              onClick={() => onToggleRedacted(true)}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                showRedacted
                  ? 'bg-[#341b09] text-orange-200 border border-orange-600/40 shadow-sm'
                  : 'text-[#aa9688] hover:text-[#fdfbf7]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              <span>Masked View</span>
              <span className="text-[10px] font-mono bg-orange-600/20 px-1.5 py-0.2 rounded text-orange-300 font-bold">
                {contract.redaction.maskedCount}
              </span>
            </button>
          </div>

          {/* Legal Memo Button */}
          <button
            onClick={onOpenMemo}
            title="Generate executive legal memo"
            className="px-2.5 py-1.5 rounded-lg bg-[#2a201a] hover:bg-[#382b22] text-[#f2e7df] border border-[#443125] text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Memo</span>
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
            className="px-2.5 py-1.5 rounded-lg bg-[#2a201a] hover:bg-[#382b22] text-[#d6c5b8] border border-[#443125] text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExportContract}
            title="Export markdown"
            className="p-1.5 rounded-lg bg-[#2a201a] hover:bg-[#382b22] text-[#d6c5b8] border border-[#443125] text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subheader: Filter & Search Bar */}
      <div className="px-5 py-2.5 bg-[#18120e]/60 border-b border-[#30241c] flex items-center justify-between text-xs text-[#aa9688]">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-[#8c786c]" />
          <span className="text-[#d6c5b8] font-medium">{contract.clauses.length} Flagged Covenants</span>
          <span>•</span>
          <span className="text-orange-300 font-mono">{contract.redaction.tokens.length} PII Tokens Masked</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8c786c] absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Filter document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#140f0c] border border-[#3b2d24] rounded-md pl-7 pr-2.5 py-1 text-xs text-[#fdfbf7] placeholder-[#8c786c] focus:outline-none focus:ring-1 focus:ring-orange-500 w-36"
          />
        </div>
      </div>

      {/* Main Document Reading Canvas */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[460px] bg-[#120d0a]/90 font-mono text-xs leading-relaxed text-[#ded5ce] whitespace-pre-wrap select-text">
        {showRedacted ? (
          <div className="text-amber-200/95 leading-relaxed font-mono">
            {contract.redaction.redactedText}
          </div>
        ) : (
          <div className="text-[#ded5ce] leading-relaxed font-mono">
            {contract.rawText}
          </div>
        )}
      </div>

      {/* Bottom Status Note */}
      <div className="px-5 py-2 border-t border-[#30241c] bg-[#16100c]/80 flex items-center justify-between text-[11px] text-[#aa9688]">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-orange-400" />
          <span>Local Document Sandbox • 0 Outbound Egress</span>
        </span>
        <span className="text-[#7d695d] font-mono">UTF-8 • {contract.rawText.length} chars</span>
      </div>
    </div>
  );
};
