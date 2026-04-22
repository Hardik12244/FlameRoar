import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Check, Droplets, Loader } from 'lucide-react';
import { GameService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWorldUI } from '../context/WorldUIContext';
import { useGameSync } from '../context/GameSyncContext';

const InventoryModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { pushToast } = useWorldUI();
  const { refreshAllGameState } = useGameSync();
  const [loadingItem, setLoadingItem] = useState(null);
  const [consumingItem, setConsumingItem] = useState(null);

  const inventory = user?.inventory || [];

  const handleConsume = async (itemType) => {
    if (loadingItem) return;
    try {
      setLoadingItem(itemType);
      const { data } = await GameService.consumeItem(itemType);

      setConsumingItem(itemType);
      setTimeout(() => setConsumingItem(null), 1000);

      pushToast(data.message, 'success');

      // Full profile refresh from backend ”€” source of truth
      await refreshAllGameState();
    } catch (err) {
      console.error(err);
      pushToast(err.response?.data?.message || 'Failed to use item', 'error');
    } finally {
      setLoadingItem(null);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'Focus Refill':
      case 'Health Potion':
        return '🧪';
      case 'Hint Potion':
      case 'Hint Revealer':
      case 'Topic Revealer':
        return '📜';
      case 'Speed Token':
        return '⚡';
      case 'XP Multiplier Crystal':
        return '💎';
      case 'Luck Charm':
        return '🍀';
      case 'Boss Key':
        return '🔑';
      default:
        return '📦';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="pixel-ui-panel relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-[4px] border-[#3a2810] bg-[#eecf9e] p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-[#735429] bg-[#d8b476] shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
                  <Package className="h-6 w-6 text-[#5a3a14]" />
                </div>
                <h2 className="font-pixel text-xl uppercase tracking-widest text-[#5a3a14] drop-shadow-[0_1px_0_#fff]">Inventory</h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#845f2a] transition-colors hover:text-[#e55252]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto bg-[#a6cc9a] map-bg-pattern p-4 md:p-6 custom-scrollbar">
              {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-[#f4e2b8] border-[4px] border-[#3a2810] shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                  <span className="text-4xl filter grayscale opacity-60">🕸️</span>
                  <p className="mt-4 font-pixel text-sm text-[#5a3a14]">Your bag is empty.</p>
                  <p className="mt-2 text-xs font-heading font-medium text-[#845f2a]">Defeat wild concept enemies to find items.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {inventory.map((item, index) => (
                    <div
                      key={index}
                      className="group relative mb-3 flex items-center justify-between overflow-hidden bg-[#f8ecd1] border-[4px] border-[#3a2810] p-3 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1"
                    >
                      {/* Active Background FX */}
                      {consumingItem === item.itemType && (
                        <motion.div
                          initial={{ x: '-100%', opacity: 0.5 }}
                          animate={{ x: '100%', opacity: 0 }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6fc281] to-transparent"
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-4">
                        <motion.div 
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#d8b476] border-[2px] border-[#735429] text-2xl shadow-[inset_0_-3px_0_rgba(0,0,0,0.1)]"
                        >
                          {getItemIcon(item.itemType)}
                        </motion.div>
                        <div>
                          <p className="font-pixel text-sm text-[#4e3415] mb-1">{item.itemType}</p>
                          <p className="text-[10px] font-pixel text-[#845f2a] tracking-widest">QTY: <span className="text-[#3a2810]">{item.quantity}</span></p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConsume(item.itemType)}
                        disabled={loadingItem === item.itemType || consumingItem === item.itemType}
                        className="relative z-10 shrink-0 border-[3px] border-[#4b6a3f] bg-[#6fc281] px-3 py-1.5 font-pixel text-[10px] uppercase text-[#1e4827] shadow-[0_4px_0_#4b6a3f] active:translate-y-[4px] active:shadow-none hover:bg-[#85da98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
                      >
                        {loadingItem === item.itemType ? <Loader className="h-4 w-4 animate-spin" /> : 'USE'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t-[4px] border-[#3a2810] bg-[#d8b476] p-3 text-center">
              <p className="text-[10px] font-pixel text-[#5a3a14] leading-relaxed">Items give persistent stat boosts or recover encounter status.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InventoryModal;
