import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { getSkillMonDisplay } from '../game/skillMons';

const CaptureModal = ({ isOpen, caughtConcept, onClose }) => {
  const [phase, setPhase] = useState('hidden'); // hidden -> appear -> shake -> catch -> summary

  useEffect(() => {
    if (isOpen && caughtConcept) {
      setPhase('appear');
    } else {
      setPhase('hidden');
    }
  }, [isOpen, caughtConcept]);

  useEffect(() => {
    if (phase === 'appear') {
      const t = setTimeout(() => setPhase('shake'), 1200);
      return () => clearTimeout(t);
    }
    if (phase === 'shake') {
      const t = setTimeout(() => setPhase('catch'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'catch') {
      const t = setTimeout(() => setPhase('summary'), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 'summary') {
      const t = setTimeout(() => onClose(), 3500); // auto dismiss
      return () => clearTimeout(t);
    }
  }, [phase, onClose]);

  if (!isOpen || !caughtConcept) return null;

  const displayData = getSkillMonDisplay(caughtConcept, 0); // show basic stage for capture

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={phase === 'summary' ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {/* Phase 1: The Wild Skill-mon Appears */}
          {phase === 'appear' && (
            <motion.div
              key="appear"
              initial={{ scale: 0, y: 50, rotate: -20 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, filter: 'brightness(2)' }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(255,255,255,0.2)] drop-shadow-2xl">
                {displayData.sprite}
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white font-heading text-center">
                Wild <span className={displayData.color}>{displayData.name}</span>!
              </h2>
            </motion.div>
          )}

          {/* Phase 2: The Shake ("Pokeball" equivalent) */}
          {phase === 'shake' && (
            <motion.div
              key="shake"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, -15, 15, 0] }}
              exit={{ scale: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-amber-500/80 border-4 border-amber-300 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                ⭐
              </div>
              <p className="mt-4 text-xl font-bold text-white font-pixel animate-pulse">Capturing...</p>
            </motion.div>
          )}

          {/* Phase 3: The Catch (Burst of light) */}
          {phase === 'catch' && (
            <motion.div
              key="catch"
              initial={{ scale: 0.5, filter: 'brightness(1)' }}
              animate={{ scale: [1, 2, 1], filter: 'brightness(3)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <Star className="w-48 h-48 text-amber-300 animate-spin fill-amber-300" style={{ animationDuration: '3s' }} />
            </motion.div>
          )}

          {/* Phase 4: Summary Card */}
          {phase === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="pixel-ui-panel pointer-events-auto p-6 md:p-8 flex flex-col items-center text-center w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-200/40 to-transparent pointer-events-none" />
              
              <div className="relative">
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-24 h-24 mb-2 rounded-full border-4 border-[#735429] bg-[#f8ecd1] flex items-center justify-center text-5xl shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                  {displayData.sprite}
                </motion.div>
                <div className="absolute -bottom-2 -right-2 bg-amber-400 rounded-full p-2 border-2 border-[#735429] shadow-md">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-heading font-black text-[#3a2810] drop-shadow-sm uppercase">Caught!</h2>
              <p className="mt-2 text-[#684b24] font-bold text-lg">
                <span className={displayData.color}>{displayData.name}</span> data saved.
              </p>

              <div className="mt-2 flex items-center gap-2 bg-[#dfb564] border-2 border-[#845f2a] px-3 py-1 rounded-full shadow-[0_2px_0_#845f2a]">
                <Sparkles className="w-4 h-4 text-[#4e3415]" />
                <span className="text-[#4e3415] font-pixel text-xs">Skill-Dex Updated</span>
              </div>

              <button 
                onClick={onClose}
                className="mt-6 w-full btn-primary"
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CaptureModal;
