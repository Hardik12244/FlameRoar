import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Star, X } from 'lucide-react';

const SKILL_NODES = [
  { id: 'basics', label: 'Variables & Types', status: 'mastered', row: 0, col: 1 },
  { id: 'arrays', label: 'Arrays', status: 'unlocked', row: 1, col: 0 },
  { id: 'loops', label: 'Loops', status: 'unlocked', row: 1, col: 2 },
  { id: 'functions', label: 'Functions', status: 'locked', row: 2, col: 1 },
  { id: 'objects', label: 'Objects', status: 'locked', row: 3, col: 0 },
  { id: 'classes', label: 'Classes', status: 'locked', row: 3, col: 2 },
  { id: 'recursion', label: 'Recursion', status: 'locked', row: 4, col: 1 },
  { id: 'dp', label: 'Dynamic Programming', status: 'locked', row: 5, col: 1 },
];

const SkillTreeModal = ({ isOpen, onClose, userXp = 0 }) => {
  if (!isOpen) return null;

  const renderNode = (node) => {
    let bgClasses = "bg-slate-800 border-slate-600";
    let icon = <Lock className="w-6 h-6 text-slate-400" />;

    if (node.status === 'mastered') {
      bgClasses = "bg-gradient-to-b from-yellow-400 to-amber-600 border-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]";
      icon = <Star className="w-6 h-6 text-white" />;
    } else if (node.status === 'unlocked') {
      bgClasses = "bg-gradient-to-b from-brand-600 to-brand-800 border-brand-400 shadow-[0_0_15px_rgba(255,107,0,0.4)] cursor-pointer hover:scale-105 transition-transform";
      icon = <Unlock className="w-6 h-6 text-white" />;
    }

    return (
      <div
        key={node.id}
        className="flex flex-col items-center justify-center relative w-32"
      >
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center z-10 ${bgClasses}`}>
          {icon}
        </div>
        <p className="mt-3 font-semibold text-center text-sm text-gray-300">{node.label}</p>
        <p className="text-xs text-brand-400 opacity-80 uppercase tracking-widest mt-1">{node.status}</p>
      </div>
    );
  };

  // Group by rows for simple layout
  const rows = [];
  SKILL_NODES.forEach(node => {
      if(!rows[node.row]) rows[node.row] = [];
      rows[node.row].push(node);
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0a0f18] border border-brand-500/30 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">

        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-brand-900 flex justify-between items-center z-20">
          <div>
            <h2 className="text-3xl font-heading text-white">Skill Matrix</h2>
            <p className="text-brand-400">Master paths to unlock ultimate power.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-auto p-10 relative z-10 flex flex-col items-center gap-16 min-h-max">
            {rows.map((rowNodes, i) => (
                <div key={i} className="flex justify-center gap-24 relative">
                    {rowNodes.map(node => renderNode(node))}
                </div>
            ))}

            {/* Connecting lines SVG could be rendered here dynamically, but omitted for simplicty of demo.
                A production version uses ReactFlow or absolute paths. */}
        </div>

        {/* Footer Stats */}
        <div className="bg-slate-950 p-4 border-t border-brand-900/50 flex justify-between items-center px-8 z-20">
            <span className="text-gray-400">Current Knowledge Level: <strong className="text-white">Level Math.floor({userXp} / 100)</strong></span>
            <span className="text-brand-500 font-mono tracking-widest">{userXp} XP Available</span>
        </div>

      </div>
    </div>
  );
};

export default SkillTreeModal;
