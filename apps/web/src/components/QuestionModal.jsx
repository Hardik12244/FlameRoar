import React, { useState, useEffect } from 'react';
import { GameService } from '../services/api';
import { X, Brain, ShieldAlert, Loader, Lightbulb, Code2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { CodeEditorBattle } from './CodeEditorBattle';

const QuestionModal = ({ topic, onClose, onSuccess, onFailure }) => {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [rewardData, setRewardData] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Hint state
  const [hintText, setHintText] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);

  const normalizeQuestion = (payload) => {
    const raw = payload?.question || payload;
    if (!raw) return null;

    // Already normalized
    if (raw.text && Array.isArray(raw.options) && raw.correctIndex !== undefined) {
      return raw;
    }

    // Check if it's a coding question
    if (raw.type === 'coding') {
      return {
        id: raw.id || `${topic}-${Date.now()}`,
        type: 'coding',
        text: raw.questionText || raw.text || `Coding Challenge: ${topic}`,
        questionText: raw.questionText || raw.text || `Coding Challenge: ${topic}`,
        options: [],
        correctIndex: -1,
        explanation: raw.explanation || '',
        hint: raw.hint || null,
        codingDetails: raw.codingDetails || null,
        _id: raw._id || raw.id,
      };
    }

    // MCQ normalization
    const options = (raw.options || []).map((opt) => (typeof opt === 'string' ? opt : opt.text));
    const correctIndex = (raw.options || []).findIndex((opt) => opt?.isCorrect);

    return {
      id: raw.id || `${topic}-${Date.now()}`,
      type: raw.type || 'mcq',
      text: raw.questionText || raw.text || `Solve ${topic}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: raw.explanation || '',
      hint: raw.hint || null,
      codingDetails: raw.codingDetails || null,
      _id: raw._id || raw.id,
    };
  };
  
  // Fetch challenge on mount
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await GameService.getChallenge(topic);
        setQuestionData({
          ...data,
          question: normalizeQuestion(data)
        });
        setStartTime(Date.now());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize neural challenge.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenge();
  }, [topic]);

  // Fetch AI hint
  const fetchHint = async () => {
    if (hintLoading) return;
    setHintLoading(true);

    try {
      const questionText = questionData?.question?.text || '';
      const { data } = await GameService.getHint(
        questionText,
        topic,
        questionData?.question?.difficulty || 1,
        hintLevel
      );
      setHintText(data.hint);
      setHintLevel((prev) => Math.min(3, prev + 1)); // Next hint is deeper
    } catch (err) {
      setHintText('The AI mentor is unavailable right now. Try breaking the problem into smaller parts.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === questionData.question.correctIndex;

    // Show explanation after answer
    setShowExplanation(true);

    try {
      const { data } = await GameService.submitAnswer({
        topic,
        isCorrect,
        timeTaken,
        questionId: questionData.question.id
      });

      if (isCorrect) {
        setRewardData({
          xp: data.xpGained || 0,
          focus: data.focusChange || 0,
          streak: data.newStreak || 0,
          droppedItem: data.droppedItem || null,
          caughtSkillmon: data.caughtSkillmon || null,
          levelUp: data.levelUp || false,
          fullResult: data,
        });
      } else {
        // Delay failure callback to show explanation first
        setTimeout(() => {
          if (typeof onFailure === 'function') {
            onFailure(data.failureLesson || data.lesson);
          }
        }, 2500);
      }
      
    } catch (err) {
      setError('System error during submission. Try again.');
      setSubmitting(false);
    }
  };

  // Handle coding question success (from CodeEditorBattle)
  const handleCodingSuccess = async () => {
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const { data } = await GameService.submitAnswer({
        topic,
        isCorrect: true,
        timeTaken,
        questionId: questionData.question.id
      });

      setRewardData({
        xp: data.xpGained || 0,
        focus: data.focusChange || 0,
        streak: data.newStreak || 0,
        droppedItem: data.droppedItem || null,
        caughtSkillmon: data.caughtSkillmon || null,
        levelUp: data.levelUp || false,
        fullResult: data,
      });
    } catch (err) {
      setError('System error during submission.');
    }
  };

  // Handle coding question failure
  const handleCodingFailure = async () => {
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const { data } = await GameService.submitAnswer({
        topic,
        isCorrect: false,
        timeTaken,
        questionId: questionData.question.id
      });

      setTimeout(() => {
        if (typeof onFailure === 'function') {
          onFailure(data.failureLesson || data.lesson);
        }
      }, 1500);
    } catch (err) {
      if (typeof onFailure === 'function') {
        onFailure(`Review ${topic} and try again.`);
      }
    }
  };

  const isCodingQuestion = questionData?.question?.type === 'coding';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 pb-6 pt-20 md:pt-24">
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
          initial={{ scale: 0.9, opacity: 0, y: 30 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: -30 }} 
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative my-auto flex w-full flex-col overflow-hidden pixel-ui-panel",
            isCodingQuestion ? "max-w-[1240px] max-h-[calc(100dvh-6rem)]" : "max-w-2xl max-h-[90vh]"
          )}
        >
          {/* Header */}
          <div className="bg-[#eecf9e] border-b-[4px] border-[#3a2810] p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 border-2 border-[#735429] bg-[#d8b476] shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] flex items-center justify-center">
                {isCodingQuestion ? (
                  <Code2 className="w-6 h-6 text-[#5a3a14]" />
                ) : (
                  <Brain className="w-6 h-6 text-[#5a3a14]" />
                )}
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-pixel uppercase text-[#3a2810] drop-shadow-[0_1px_0_#fff]">
                  {isCodingQuestion ? 'Coding Challenge' : 'Wild Encounter'}
                </h2>
                <span className="text-[10px] font-pixel text-[#8a6332] uppercase tracking-wider">
                  {topic} • {isCodingQuestion ? 'Write Code' : 'Multiple Choice'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#d8b476] rounded transition">
              <X className="w-5 h-5 text-[#3a2810]" />
            </button>
          </div>

          {/* Body */}
          <div className={cn("flex-1 overflow-y-auto", isCodingQuestion ? "p-2 md:p-4" : "p-8")}>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-brand-500 animate-pulse font-mono tracking-widest text-sm">GENERATING CHALLENGE...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-4">
                 <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                 <div>
                   <h3 className="text-red-500 font-bold mb-1">System Error</h3>
                   <p className="text-red-400/80">{error}</p>
                 </div>
              </div>
            ) : isCodingQuestion ? (
              /* ───── CODING QUESTION LAYOUT ───── */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Hint Bar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchHint}
                    disabled={hintLoading}
                    className="flex items-center gap-2 border-[3px] border-[#a0743c] bg-[#f4e2b8] px-3 py-2 font-pixel text-[10px] uppercase text-[#4e3415] shadow-[0_3px_0_#a0743c] hover:bg-[#ffeac4] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {hintLoading ? 'Thinking...' : `Get Hint (Lvl ${hintLevel})`}
                  </button>
                  {hintText && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 bg-[#fff8e7] border-[2px] border-[#dfb564] p-2 text-xs text-[#5a3a14] font-heading"
                    >
                      💡 {hintText}
                    </motion.div>
                  )}
                </div>

                {/* Code Editor */}
                <div className="overflow-hidden border-[4px] border-[#3a2810] bg-[#1a1107]" style={{ minHeight: '620px' }}>
                  <CodeEditorBattle
                    question={{
                      ...questionData.question,
                      questionText: questionData.question.text || questionData.question.questionText,
                    }}
                    onSuccess={handleCodingSuccess}
                    onFailure={handleCodingFailure}
                  />
                </div>

                {/* Success Notification for coding */}
                {rewardData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-[#f4e2b8] border-[6px] border-[#3a2810] p-4 shadow-[10px_10px_0_rgba(0,0,0,0.5)] flex flex-col items-center"
                  >
                    <p className="text-3xl font-pixel uppercase tracking-widest text-[#51a868] drop-shadow-[0_2px_0_#2f6f40]">Code Accepted!</p>
                    <div className="mt-4 w-full bg-[#1a1107] border-[3px] border-[#4e3415] p-4 text-[#eecf9e] font-pixel text-[10px] md:text-sm flex flex-col gap-2">
                      <p className="text-[#a6cc9a]">Reward Data:</p>
                      <p>XP Gained: <span className="text-white">+{rewardData.xp}</span></p>
                      <p>Focus Recovered: <span className="text-[#64a5df]">+{rewardData.focus}</span></p>
                      <p>Current Streak: <span className="text-[#dfb564]">{rewardData.streak}</span></p>
                      {rewardData.levelUp && (
                        <p className="animate-pulse text-[#dfb564] font-bold">🎉 LEVEL UP!</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setRewardData(null);
                        if (typeof onSuccess === 'function') {
                          onSuccess(rewardData.fullResult);
                        }
                      }}
                      className="mt-6 w-full btn-primary"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* ───── MCQ QUESTION LAYOUT ───── */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Question Text */}
                <div className="bg-[#f8ecd1] border-[4px] border-[#3a2810] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                  <span className="inline-block px-2 py-1 bg-[#d8b476] border-[2px] border-[#8a6332] text-[10px] font-pixel tracking-wider uppercase text-[#5a3a14] mb-3">
                    Sector: {topic}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-[#3a2810]">
                    {questionData?.question?.text}
                  </h3>
                </div>

                {/* Hint Button */}
                <div className="flex items-start gap-2">
                  <button
                    onClick={fetchHint}
                    disabled={hintLoading || selectedAnswer !== null}
                    className="flex items-center gap-2 border-[3px] border-[#a0743c] bg-[#f4e2b8] px-3 py-2 font-pixel text-[10px] uppercase text-[#4e3415] shadow-[0_3px_0_#a0743c] hover:bg-[#ffeac4] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 shrink-0"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {hintLoading ? 'Thinking...' : `Hint ${hintLevel > 1 ? `(Lvl ${hintLevel})` : ''}`}
                  </button>
                  {hintText && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 bg-[#fff8e7] border-[2px] border-[#dfb564] p-3 text-sm text-[#5a3a14] font-heading"
                    >
                      💡 {hintText}
                    </motion.div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-3">
                  {questionData?.question?.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrectOption = i === questionData.question.correctIndex;
                    const hasAnswered = selectedAnswer !== null;

                    let buttonClass;
                    if (hasAnswered) {
                      if (isCorrectOption) {
                        buttonClass = 'bg-[#6fc281] border-[#3a7c4a] text-[#1e4827] shadow-[0_4px_0_#3a7c4a] font-bold transform -translate-y-1';
                      } else if (isSelected) {
                        buttonClass = 'bg-[#e55252] border-[#912d2d] text-white shadow-[0_4px_0_#912d2d] transform translate-y-1 scale-[0.98]';
                      } else {
                        buttonClass = 'bg-[#d8c8af] border-[#a69680] text-[#867560] opacity-60 shadow-[0_4px_0_#a69680] pointer-events-none';
                      }
                    } else if (isSelected) {
                      buttonClass = 'bg-[#6fc281] border-[#3a7c4a] text-[#1e4827] shadow-[0_4px_0_#3a7c4a] font-bold transform translate-y-1';
                    } else {
                      buttonClass = 'bg-[#eecf9e] border-[#a0743c] text-[#4e3415] hover:bg-[#ffeac4] active:translate-y-[4px] active:shadow-none shadow-[0_4px_0_#a0743c]';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => !hasAnswered && setSelectedAnswer(i)}
                        disabled={hasAnswered}
                        className={cn(
                          "w-full p-4 border-[4px] text-left transition-all font-heading text-sm md:text-base",
                          buttonClass
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 border-2 flex items-center justify-center shrink-0 font-pixel text-[10px]",
                            hasAnswered && isCorrectOption ? "border-[#1e4827] bg-[#3a7c4a] text-white" :
                            isSelected ? "border-[#1e4827] bg-[#3a7c4a] text-white" :
                            "border-[#a0743c] bg-[#d8b476] text-[#5a3a14]"
                          )}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="flex-1">{opt}</span>
                          {hasAnswered && isCorrectOption && <CheckCircle className="w-5 h-5 text-[#1e4827]" />}
                          {hasAnswered && isSelected && !isCorrectOption && <span className="text-xl">❌</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Explanation (shows after answering) */}
                {showExplanation && questionData?.question?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fff8e7] border-[3px] border-[#dfb564] p-4 text-sm text-[#5a3a14]"
                  >
                    <p className="font-pixel text-[10px] uppercase text-[#8a6332] mb-1">Explanation</p>
                    <p className="font-heading">{questionData.question.explanation}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                {!rewardData && (
                  <div className="pt-6 border-t-[4px] border-[#a0743c]">
                    <button 
                      onClick={handleSubmit} 
                      disabled={selectedAnswer === null || submitting}
                      className="btn-primary w-full shadow-[0_4px_0_var(--color-brand-700)] disabled:opacity-50 disabled:translate-y-[4px] disabled:shadow-none"
                    >
                      {submitting ? 'Attacking...' : 'ATTACK'}
                    </button>
                  </div>
                )}

                {/* Success Notification */}
                {rewardData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-[#f4e2b8] border-[6px] border-[#3a2810] p-4 shadow-[10px_10px_0_rgba(0,0,0,0.5)] flex flex-col items-center"
                  >
                    <p className="mt-2 text-3xl font-pixel uppercase tracking-widest text-[#51a868] drop-shadow-[0_2px_0_#2f6f40]">Success!</p>
                    
                    <div className="mt-4 w-full bg-[#1a1107] border-[3px] border-[#4e3415] p-4 text-[#eecf9e] font-pixel text-[10px] md:text-sm flex flex-col gap-2">
                      <p className="text-[#a6cc9a]">Reward Data:</p>
                      <p>XP Gained: <span className="text-white">+{rewardData.xp}</span></p>
                      <p>Focus Recovered: <span className="text-[#64a5df]">+{rewardData.focus}</span></p>
                      <p>Current Streak: <span className="text-[#dfb564]">{rewardData.streak}</span></p>
                      {rewardData.levelUp && (
                        <p className="animate-pulse text-[#dfb564] font-bold">🎉 LEVEL UP!</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setRewardData(null);
                        // GamePage's handleQuestionSuccess will sync profile from backend
                        if (typeof onSuccess === 'function') {
                          onSuccess(rewardData.fullResult);
                        }
                      }}
                      className="mt-6 w-full btn-primary"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuestionModal;
