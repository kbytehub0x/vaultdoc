'use client';

import React from 'react';
import { AuditLogEntry } from '@/types';
import { ShieldCheck, Download, X, History, Cloud, Cpu, Lock } from 'lucide-react';

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
    downloadAnchor.setAttribute('download', `vaultdoc-audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Immutable Compliance Audit Log</h3>
              <p className="text-xs text-slate-400">Verifiable Record of In-Browser vs Cloud Inferences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No inference actions logged yet. Run an analysis or chat with the copilot.
            </div>
          ) : (
            logs.map((log) => {
              const isCloud = log.action === 'CLOUD_ESCALATION';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    isCloud
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isCloud
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="font-medium text-slate-200">{log.documentTitle}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-850 font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Engine: </span>
                      <span className="text-slate-300 font-semibold">{log.inferenceEngine}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Egress: </span>
                      <span className={log.bytesEgress === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {log.bytesEgress} Bytes
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Protected PII: </span>
                      <span className="text-purple-400 font-semibold">{log.piiProtectedCount} Items</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Consent: </span>
                      <span className="text-emerald-400">{log.userConsentGranted ? 'Granted' : 'Local Only'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Synced locally & formatted for Cloud Firestore audit collection</span>
        </div>
      </div>
    </div>
  );
};
