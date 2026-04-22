import React from 'react';
import { X, BookOpen, CheckCircle, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getSkillMonDisplay } from '../game/skillMons';
import { useGameSync } from '../context/GameSyncContext';

const SkillDexModal = ({ onClose }) => {
  const { user } = useAuth();
  const { refreshAllGameState, syncing } = useGameSync();

  React.useEffect(() => {
    // Ensure we don't show stale skill dex data
    refreshAllGameState();
  }, [refreshAllGameState]);

  const skillDex = user?.skillDex || [];
  const learnedTopics = user?.learnedTopics || [];
  const masteryInfo = user?.mastery || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden pixel-ui-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-[4px] border-[#3a2810] bg-[#eecf9e] p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-[2px] border-[#735429] bg-[#d8b476] shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
                <BookOpen className="h-6 w-6 text-[#5a3a14]" />
              </div>
              <h2 className="font-pixel text-xl uppercase tracking-widest text-[#3a2810] drop-shadow-[0_1px_0_#fff]">
                Skill-Dex
              </h2>
              {syncing && (
                <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" title="Syncing..." />
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-glass-bg transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto relative scrollbar-hide">
            {skillDex.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">Your Dex is Empty</h3>
                <p className="text-gray-500 max-w-md mx-auto">Explore the world, defeat wild specific concepts, and beat Bosses to register them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {skillDex.map((topic, i) => {
                  const data = getSkillMonDisplay(topic);
                  const isLearned = learnedTopics.includes(topic);
                  const rawMastery = masteryInfo[topic] || 0;
                  // For Skill-dex items without explicit mastery in standard DB, default to 10
                  const displayMastery = data.type === 'Key Item' ? 100 : Math.max(10, rawMastery);

                  return (
                    <motion.div
                      key={topic + i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-dark-bg border border-glass-border rounded-xl p-4 flex flex-col items-center justify-center relative group hover:border-brand-500/50 transition-colors"
                    >
                      {/* Mastery Bar */}
                      <div className="absolute top-2 w-full px-4 flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider">{displayMastery}%</span>
                        {displayMastery >= 100 && <Shield className="w-3 h-3 text-amber-400" />}
                      </div>

                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 border border-white/5 ${data.bg} mt-4`}>
                        {data.icon}
                      </div>

                      {/* Info */}
                      <h4 className={`font-bold text-sm ${data.color}`}>{data.name}</h4>
                      <p className="text-xs text-gray-500 capitalize font-mono mb-2">{topic}</p>

                      <div className="flex gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                          {data.type}
                        </span>
                        {isLearned && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-2 h-2" />
                            Learned
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SkillDexModal;

