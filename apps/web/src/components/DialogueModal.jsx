import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DialogueModal = ({ isOpen, npcName, dialogueLines, onClose, npcRole }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      setCurrentLineIndex(0);
      setDisplayedText('');
      setIsTyping(true);
      textRef.current = '';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !dialogueLines[currentLineIndex]) return;

    const fullText = dialogueLines[currentLineIndex];
    setDisplayedText('');
    textRef.current = '';
    setIsTyping(true);

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        textRef.current += fullText.charAt(i);
        setDisplayedText(textRef.current);
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 30); // Typing speed

    return () => clearInterval(typingInterval);
  }, [currentLineIndex, dialogueLines, isOpen]);

  if (!isOpen) return null;

  const handleInteract = () => {
    if (isTyping) {
      // Skip typing
      setDisplayedText(dialogueLines[currentLineIndex]);
      setIsTyping(false);
    } else {
      // Next line or close
      if (currentLineIndex < dialogueLines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }
  };

  // Determine avatar icon based on NPC role
  const getRoleIcon = () => {
    switch (npcRole) {
      case 'queen': return '👑';
      case 'mentor': return '📜';
      case 'princess': return '🌸';
      case 'king': return '🏰';
      case 'thief': return '🗡️';
      case 'mage': return '🔮';
      case 'map_boss': return '⚔️';
      default: return '💬';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50 px-4"
        >
          {/* Use the pixel-ui-panel from index.css for RPG look */}
          <div 
            className="pixel-ui-panel p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start cursor-pointer transition-transform active:scale-[0.99]"
            onClick={handleInteract}
          >
            {/* NPC Portrait Box */}
            <div className="w-16 h-16 md:w-24 md:h-24 bg-[#f8ecd1] rounded-lg flex-shrink-0 flex items-center justify-center border-[3px] border-[#735429] shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_4px_0_#6d4d26] relative overflow-hidden">
              <span className="text-3xl md:text-5xl drop-shadow-md">{getRoleIcon()}</span>
              {/* Optional mini label for their initial */}
              <div className="absolute bottom-0 right-0 bg-[#735429] text-white text-[10px] font-pixel leading-none px-1 py-0.5 rounded-tl-sm">
                {npcName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Dialogue Content */}
            <div className="flex-1 text-left flex flex-col justify-between min-h-[96px] w-full">
              <div>
                <h3 className="text-sm font-pixel mb-3 tracking-widest uppercase text-[#5a3a14] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  {npcName}
                </h3>
                <p className="text-lg md:text-xl text-[#3a2810] font-heading font-medium leading-relaxed drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
                  {displayedText}
                </p>
              </div>

              {/* Blinking indicator for next/finish */}
              <div className="flex justify-end mt-2 h-6">
                {!isTyping && (
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-[#845f2a]"
                  >
                    ▼
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogueModal;

