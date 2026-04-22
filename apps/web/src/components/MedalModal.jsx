import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MEDAL_DETAILS = {
  'Identity Medal': {
    icon: '👤',
    color: 'text-blue-400',
    bg: 'bg-blue-900',
    desc: 'The power to define variables is now yours.'
  },
  'Logic Medal': {
    icon: '⚙️',
    color: 'text-amber-400',
    bg: 'bg-amber-900',
    desc: 'Expressions bow to your mighty logic.'
  },
  'Decision Medal': {
    icon: '⚖️',
    color: 'text-purple-400',
    bg: 'bg-purple-900',
    desc: 'The paths of if/else have opened to you.'
  },
  'Cycle Medal': {
    icon: '🔄',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900',
    desc: 'You have mastered the eternal loops.'
  }
};

const MedalModal = ({ medalName, onClose }) => {
  const [phase, setPhase] = useState('hidden');

  useEffect(() => {
    if (medalName) {
      setPhase('appear');
    } else {
      setPhase('hidden');
    }
  }, [medalName]);

  useEffect(() => {
    if (phase === 'appear') {
      const t = setTimeout(() => setPhase('shine'), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (!medalName || phase === 'hidden') return null;

  const details = MEDAL_DETAILS[medalName] || {
    icon: '🏅',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900',
    desc: 'A mark of true accomplishment.'
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={phase === 'shine' ? onClose : undefined}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === 'appear' && (
            <motion.div
              key="appear"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: [1.2, 1], rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-48 h-48 rounded-full border-8 border-yellow-500 bg-yellow-900 shadow-[0_0_100px_rgba(234,179,8,0.8)] flex items-center justify-center text-8xl drop-shadow-2xl">
                {details.icon}
              </div>
            </motion.div>
          )}

          {phase === 'shine' && (
            <motion.div
              key="shine"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center pointer-events-auto"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative"
              >
                {/* Shining backdrop rays */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg,transparent,rgba(252,211,77,0.4),transparent)] rounded-full blur-2xl scale-150"
                />
                
                <div className={`relative z-10 w-40 h-40 rounded-full border-8 border-yellow-400 ${details.bg} shadow-[0_0_50px_rgba(250,204,21,1)] flex items-center justify-center text-7xl`}>
                  {details.icon}
                </div>
              </motion.div>

              <div className="mt-8 bg-[#f8ecd1] border-[6px] border-[#3a2810] p-6 text-center shadow-[10px_10px_0_rgba(0,0,0,0.5)] w-full relative overflow-hidden">
                <h2 className="text-3xl md:text-5xl font-pixel uppercase tracking-widest text-[#d63a3a] mb-2 drop-shadow-[0_2px_0_#912d2d] leading-tight">
                  You got a Badge!
                </h2>
                <p className="text-xl md:text-2xl font-bold font-heading text-[#3a2810] mb-4">
                  Received the <span className={details.color}>{medalName}</span>!
                </p>
                <div className="bg-[#1a1107] border-[3px] border-[#4e3415] p-3 text-[#eecf9e] font-pixel text-xs md:text-sm">
                  {details.desc}
                </div>

                <button 
                  onClick={onClose}
                  className="mt-6 w-full btn-primary"
                >
                  Wow!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MedalModal;
