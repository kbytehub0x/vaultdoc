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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Compliance Audit Ledger</h3>
              <p className="text-xs text-zinc-500">Immutable record of local vs. cloud inference routing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 text-xs rounded-md bg-zinc-800 hover:bg-zinc-750 text-zinc-200 flex items-center gap-1 border border-zinc-750 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No audit events logged yet.
            </div>
          ) : (
            logs.map((log) => {
              const isCloud = log.action === 'CLOUD_ESCALATION';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    isCloud ? 'bg-zinc-950/80 border-zinc-700' : 'bg-zinc-950 border-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-500">{log.timestamp}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isCloud
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="font-medium text-zinc-200">{log.documentTitle}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-zinc-850 font-mono text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Engine: </span>
                      <span className="text-zinc-300">{log.inferenceEngine}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Egress: </span>
                      <span className={log.bytesEgress === 0 ? 'text-emerald-400 font-semibold' : 'text-zinc-200 font-semibold'}>
                        {log.bytesEgress} Bytes
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Shielded PII: </span>
                      <span className="text-zinc-300">{log.piiProtectedCount} items</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Consent: </span>
                      <span className="text-zinc-300">{log.userConsentGranted ? 'Granted' : 'Local Sandbox'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Synced locally & formatted for Cloud Firestore audit collection</span>
        </div>
      </div>
    </div>
  );
};
