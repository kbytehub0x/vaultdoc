'use client';

import React from 'react';

interface DiffViewerProps {
  original: string;
  revised: string;
}

// Simple client-side word-level diff generator
export const DiffViewer: React.FC<DiffViewerProps> = ({ original, revised }) => {
  const originalWords = original.split(/\s+/);
  const revisedWords = revised.split(/\s+/);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono leading-relaxed">
      {/* Original with deletion styling */}
      <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
        <div className="text-red-400 font-bold mb-2 flex items-center justify-between">
          <span>Current Exposure (To Be Carved Out):</span>
          <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded font-mono">Original</span>
        </div>
        <p className="line-through decoration-red-500 text-red-300/80 bg-red-950/30 p-2 rounded">
          {original}
        </p>
      </div>

      {/* Revised with insertion styling */}
      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
        <div className="text-emerald-400 font-bold mb-2 flex items-center justify-between">
          <span>Proposed Safe Redline (Drafted On-Device):</span>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono">Amended</span>
        </div>
        <p className="text-emerald-200 font-semibold bg-emerald-950/40 p-2 rounded border border-emerald-500/20">
          {revised}
        </p>
      </div>
    </div>
  );
};
