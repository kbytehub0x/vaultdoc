'use client';

import React from 'react';
import { AuditLogEntry } from '@/types';
import { History, Download, X, ShieldCheck } from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vaultdoc-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-[#1a1410] border-l border-[#3a2d24] shadow-2xl flex flex-col text-[#fdfbf7]">
        {/* Header */}
        <div className="p-4 border-b border-[#362920] flex items-center justify-between bg-[#140f0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#fdfbf7]">Compliance Audit Ledger</h3>
              <p className="text-xs text-[#aa9688]">Immutable record of local vs. cloud inference routing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 text-xs rounded-md bg-[#2a201a] hover:bg-[#382b22] text-[#f2e7df] flex items-center gap-1 border border-[#443125] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#aa9688] hover:text-white hover:bg-[#2a201a] rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-[#8c786c] text-xs">
              No audit events logged yet.
            </div>
          ) : (
            logs.map((log) => {
              const isCloud = log.action === 'CLOUD_ESCALATION';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    isCloud ? 'bg-[#140f0c] border-orange-600/40' : 'bg-[#140f0c] border-[#362920]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#8c786c]">{log.timestamp}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isCloud
                          ? 'bg-[#341b09] text-orange-200 border border-orange-600/40'
                          : 'bg-[#241a12] text-amber-300 border border-amber-600/40'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="font-medium text-[#fdfbf7]">{log.documentTitle}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-[#261d17] font-mono text-[#aa9688]">
                    <div>
                      <span className="text-[#8c786c]">Engine: </span>
                      <span className="text-[#d6c5b8]">{log.inferenceEngine}</span>
                    </div>
                    <div>
                      <span className="text-[#8c786c]">Egress: </span>
                      <span className={log.bytesEgress === 0 ? 'text-amber-300 font-semibold' : 'text-orange-300 font-semibold'}>
                        {log.bytesEgress} Bytes
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8c786c]">Shielded PII: </span>
                      <span className="text-[#d6c5b8]">{log.piiProtectedCount} items</span>
                    </div>
                    <div>
                      <span className="text-[#8c786c]">Consent: </span>
                      <span className="text-[#d6c5b8]">{log.userConsentGranted ? 'Granted' : 'Local Sandbox'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#362920] bg-[#140f0c] text-center text-[11px] text-[#8c786c] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>Synced locally & formatted for Cloud Firestore audit collection</span>
        </div>
      </div>
    </div>
  );
};
