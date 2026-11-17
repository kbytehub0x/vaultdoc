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
      <div className="p-3 rounded-lg bg-[#2a1310]/60 border border-red-800/40">
        <div className="text-red-400 font-bold mb-2 flex items-center justify-between">
          <span>Current Exposure (To Be Carved Out):</span>
          <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded font-mono border border-red-800/40">Original</span>
        </div>
        <p className="line-through decoration-red-500 text-red-300/80 bg-[#1f0f0c] p-2 rounded">
          {original}
        </p>
      </div>

      {/* Revised with insertion styling */}
      <div className="p-3 rounded-lg bg-[#2b1f0e]/70 border border-amber-600/40">
        <div className="text-amber-300 font-bold mb-2 flex items-center justify-between">
          <span>Proposed Safe Redline (Drafted On-Device):</span>
          <span className="text-[10px] bg-[#3d240d] px-2 py-0.5 rounded font-mono text-orange-200 border border-orange-600/40">Amended</span>
        </div>
        <p className="text-amber-100 font-semibold bg-[#1c150c] p-2 rounded border border-amber-600/20">
          {revised}
        </p>
      </div>
    </div>
  );
};
