import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Heart, Zap, Brain, Loader, CheckCircle, XCircle, Footprints, Lightbulb } from 'lucide-react';
import { GameService } from '../services/api';
import mapProgression from '../data/mapProgression.json';
import { getSkillMonDisplay } from '../game/skillMons';
import { CodeEditorBattle } from './CodeEditorBattle';

const STORY_NPCS = mapProgression.npcs || {};

const normalizeQuestion = (rawQuestion, fallbackTopic, index) => {
  if (!rawQuestion) {
    return {
      id: `${fallbackTopic}-${index}`,
      text: `What is a key idea in ${fallbackTopic}?`,
      options: ['Correct answer', 'Distractor', 'Distractor', 'Distractor'],
      correctIndex: 0,
      explanation: 'Review the concept and try again.',
    };
  }

  const options = (rawQuestion.options || []).map((option) => (
    typeof option === 'string' ? option : option.text
  ));

  const explicitCorrectIndex = rawQuestion.correctIndex;
  const derivedCorrectIndex = (rawQuestion.options || []).findIndex((option) => option?.isCorrect);

  return {
    id: rawQuestion.id || rawQuestion._id || `${fallbackTopic}-${index}`,
    text: rawQuestion.questionText || rawQuestion.text || `Question about ${fallbackTopic}`,
    options: options.length > 0 ? options : ['Correct answer', 'Distractor', 'Distractor', 'Distractor'],
    correctIndex: explicitCorrectIndex !== undefined ? explicitCorrectIndex : (derivedCorrectIndex >= 0 ? derivedCorrectIndex : 0),
    explanation: rawQuestion.explanation || 'Keep going.',
    type: rawQuestion.type || 'mcq',
    codingDetails: rawQuestion.codingDetails || null,
    _id: rawQuestion._id || rawQuestion.id
  };
};

const genericQuestions = (topic) => ([
  normalizeQuestion({
    questionText: `What is a common use case for ${topic}?`,
    options: [
      { text: 'Data storage', isCorrect: true },
      { text: 'Styling', isCorrect: false },
      { text: 'Animations', isCorrect: false },
      { text: 'Networking', isCorrect: false },
    ],
    explanation: `${topic} usually controls logic or structure, not presentation.`,
  }, topic, 0),
  normalizeQuestion({
    questionText: `Which idea is most related to ${topic}?`,
    options: [
      { text: 'Problem solving', isCorrect: true },
      { text: 'Color palettes', isCorrect: false },
      { text: 'Fonts', isCorrect: false },
      { text: 'Audio mixing', isCorrect: false },
    ],
    explanation: `${topic} is part of the problem-solving layer of code.`,
  }, topic, 1),
  normalizeQuestion({
    questionText: `How do you improve at ${topic}?`,
    options: [
      { text: 'Practice small patterns repeatedly', isCorrect: true },
      { text: 'Memorize random syntax only', isCorrect: false },
      { text: 'Avoid debugging', isCorrect: false },
      { text: 'Ignore edge cases', isCorrect: false },
    ],
    explanation: 'Small repeated drills build real fluency.',
  }, topic, 2),
]);

const buildLockedEncounterLesson = (payload, topic) => ({
  lesson: {
    title: payload?.lessonRequired?.title || 'Challenge Locked',
    content:
      payload?.lessonRequired?.reminderText ||
      payload?.lessonRequired?.blockMessage ||
      payload?.message ||
      `Review ${topic} before this encounter.`,
  },
  lessonRequired: payload?.lessonRequired || null,
});

const BattleModal = ({ topic, npcId = 'Challenger', onClose, onSuccess, onFailure }) => {
  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [aiHealth, setAiHealth] = useState(100);
  const [loading, setLoading] = useState(true);
  const [battleState, setBattleState] = useState('intro');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [resolvingResult, setResolvingResult] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showItemAnimation, setShowItemAnimation] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const introTimerRef = useRef(null);
  const roundDelayRef = useRef(null);
  const [battleHint, setBattleHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const isStoryNpc = Boolean(STORY_NPCS[npcId]);
  const storyNpc = STORY_NPCS[npcId];
  const skillMon = getSkillMonDisplay(topic);

  const currentQuestion = questions[currentRound];
  const isCodingRound = currentQuestion?.type === 'coding';

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);

        if (isStoryNpc) {
          const { data } = await GameService.getBossChallenge(topic, npcId);
          const phases = Array.isArray(data?.phases) ? data.phases : [];
          const normalizedQuestions = phases.map((phase, index) => normalizeQuestion(phase, topic, index));
          setQuestions(normalizedQuestions.length > 0 ? normalizedQuestions : genericQuestions(topic));
        } else {
          const responses = await Promise.all([
            GameService.getChallenge(topic).catch(() => null),
            GameService.getChallenge(topic).catch(() => null),
            GameService.getChallenge(topic).catch(() => null),
          ]);

          const normalizedQuestions = responses
            .map((response, index) => normalizeQuestion(response?.data?.question, topic, index))
            .filter(Boolean);

          setQuestions(normalizedQuestions.length > 0 ? normalizedQuestions : genericQuestions(topic));
        }

        setBattleState('intro');
        introTimerRef.current = setTimeout(() => {
          introTimerRef.current = null;
          setBattleState('fighting');
        }, 2500);
      } catch (error) {
        const responsePayload = error.response?.data;
        if (error.response?.status === 403 && responsePayload) {
          await onFailure?.(buildLockedEncounterLesson(responsePayload, topic));
          return;
        }

        console.error('Failed to initialize battle:', error);
        setQuestions(genericQuestions(topic));
        setBattleState('intro');
        introTimerRef.current = setTimeout(() => {
          introTimerRef.current = null;
          setBattleState('fighting');
        }, 2500);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
  }, [isStoryNpc, npcId, topic]);

  useEffect(() => () => {
    if (roundDelayRef.current) {
      clearTimeout(roundDelayRef.current);
      roundDelayRef.current = null;
    }
  }, []);

  useEffect(() => {
    let timerId;
    const isCodingQuestion = currentQuestion?.type === 'coding';

    if (!isCodingQuestion) {
      if (battleState === 'fighting' && selectedAnswer === null && timeRemaining > 0) {
        timerId = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
      } else if (battleState === 'fighting' && timeRemaining === 0 && selectedAnswer === null) {
        handleAnswer(-1);
      }
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [battleState, selectedAnswer, timeRemaining, currentQuestion]);

  const handleRunAway = () => {
    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    if (roundDelayRef.current) {
      clearTimeout(roundDelayRef.current);
      roundDelayRef.current = null;
    }
    onClose?.();
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || !questions[currentRound]) {
      return;
    }

    const currentQuestion = questions[currentRound];
    const answerIsCorrect = index === currentQuestion.correctIndex;
    const nextPlayerHealth = answerIsCorrect ? playerHealth : Math.max(0, playerHealth - 34);
    const nextAiHealth = answerIsCorrect ? Math.max(0, aiHealth - 34) : aiHealth;
    const isFinalRound = currentRound >= questions.length - 1;

    setSelectedAnswer(index);
    setIsCorrect(answerIsCorrect);
    setPlayerHealth(nextPlayerHealth);
    setAiHealth(nextAiHealth);

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    roundDelayRef.current = setTimeout(() => {
      roundDelayRef.current = null;

      if (!isFinalRound && nextPlayerHealth > 0 && nextAiHealth > 0) {
        setCurrentRound((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeRemaining(30);
        setBattleHint(null);
        return;
      }

      if (nextAiHealth <= 0 || (answerIsCorrect && isFinalRound) || nextPlayerHealth > nextAiHealth) {
        setBattleState('won');
      } else {
        setBattleState('lost');
      }
    }, 1800);
  };

  const finalizeBattle = async (outcome) => {
    if (resolvingResult) {
      return;
    }

    setResolvingResult(true);

    try {
      if (isStoryNpc) {
        const difficulty = storyNpc.role === 'map_boss' ? 'hard' : 'medium';
        const { data } = await GameService.resolveNpcBattle(npcId, {
          outcome,
          difficulty,
          caughtConcept: storyNpc.topic,
        });

        if (outcome === 'win') {
          setRewardData({
            xp: data.xpGained || 0,
            focus: data.focusChange || 0,
            droppedItem: data.droppedItem || null,
            caughtConcept: data.caughtConcept || data.npc?.topic || topic || null,
            lvlUp: data.levelUp,
            progression: data.progression,
            fullResult: data
          });
          setShowItemAnimation(true);
          // Wait 2s to show animation then resolve
          setTimeout(() => {
            onSuccess?.(data);
          }, 2000);
        } else {
          onFailure?.(data);
        }
        return;
      }

      if (outcome === 'win') {
        setRewardData({
          xp: 50,
          focus: 100,
          droppedItem: null,
          caughtConcept: topic,
          lvlUp: false,
          progression: null,
          fullResult: null
        });
        setShowItemAnimation(true);
        setTimeout(() => {
          onSuccess?.({
            progression: null,
            stats: {
              xp: 50,
              focusEnergy: 100,
            },
          });
        }, 2000);
      } else {
        onFailure?.({
          failureLesson: {
            title: `Review ${topic}`,
            content: `You need more practice with ${topic} before this concept creature can be captured.`,
          },
        });
      }
    } catch (error) {
      console.error('Failed to resolve battle:', error);
      if (outcome === 'win') {
        setRewardData({
          xp: 50,
          focus: 100,
          droppedItem: 'Luck Charm', // generic fallback
          caughtConcept: topic,
          lvlUp: false,
          progression: null,
          fullResult: null
        });
        setShowItemAnimation(true);
        setTimeout(() => {
          onSuccess?.({
            progression: null,
            stats: {
              xp: 50,
              focusEnergy: 100,
            },
          });
        }, 2000);
      } else {
        onFailure?.({
          failureLesson: {
            title: `Review ${topic}`,
            content: `The battle result could not be saved. Review ${topic} and try again.`,
          },
        });
      }
    } finally {
      setResolvingResult(false);
    }
  };

  const canRunAway = battleState !== 'won' && battleState !== 'lost' && !resolvingResult;

  return (
    <div className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 px-4 pb-8 pt-20 backdrop-blur-sm lg:px-8 lg:pb-10 lg:pt-24 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <div className={`relative my-auto flex w-full flex-col overflow-hidden pixel-ui-panel border-[4px] border-[#3a2810] p-2 shadow-[0_15px_30px_rgba(0,0,0,0.8)] md:border-[6px] md:p-3 ${isCodingRound ? 'max-w-[1240px]' : 'max-w-4xl'}`}>
        {canRunAway && (
          <button
            type="button"
            onClick={handleRunAway}
            className="absolute left-1/2 -translate-x-1/2 top-4 z-20 flex items-center justify-center gap-2 border-[3px] border-[#a0743c] bg-[#e6c79a] px-3 py-1 font-pixel text-[10px] uppercase text-[#4e3415] shadow-[0_4px_0_#a0743c] active:translate-y-[4px] active:shadow-none hover:bg-[#ffeac4]"
          >
            <Footprints className="h-3 w-3" /> Flee
          </button>
        )}

        {/* --- Top Dashboard: Retro Health Bars --- */}
        <div className="flex items-center justify-between border-[3px] border-[#8a6332] bg-[#d8b476] p-2 md:p-4 shadow-[inset_0_4px_0_rgba(255,255,255,0.3)]">
          {/* Player Side */}
          <div className="w-[40%] flex flex-col items-start">
            <h3 className="font-pixel text-xs md:text-sm text-[#4e3415] uppercase tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              Hero <span className="text-[10px]">Lvl. ?</span>
            </h3>
            <div className="w-full mt-1 border-[3px] border-[#3a2810] bg-[#1a1107] h-6 relative shadow-inner">
              <span className="absolute inset-0 flex items-center justify-end px-2 text-[10px] font-pixel text-white z-10 drop-shadow-md">
                {Math.ceil(playerHealth)}/100
              </span>
              <motion.div 
                initial={{ width: '100%' }} 
                animate={{ width: `${playerHealth}%` }} 
                className={`h-full border-b-[2px] ${playerHealth > 40 ? 'bg-[#51a868] border-[#2f6f40]' : 'bg-[#e55252] border-[#912d2d]'}`} 
              />
            </div>
          </div>

          {/* Verses Timer Badge */}
          <div className="flex flex-col items-center bg-[#f4e2b8] border-[3px] border-[#a0743c] px-3 py-1 shadow-[0_2px_0_#a0743c] -mt-10 md:mt-0 z-10">
            <span className="text-[10px] font-pixel text-[#8a6332] uppercase">R {Math.min(currentRound + 1, 3)}/3</span>
            {currentQuestion?.type !== 'coding' ? (
              <span className="font-pixel text-[#d63a3a] text-sm md:text-xl flex items-center leading-none mt-1">
                <Zap className="h-3 w-3 md:h-4 md:w-4 mr-1 text-[#d63a3a]" fill="currentColor"/>
                {timeRemaining}s
              </span>
            ) : (
              <span className="font-pixel text-[#3a2810] text-sm md:text-xl flex items-center leading-none mt-1">
                ∞
              </span>
            )}
          </div>

          {/* Enemy Side */}
          <div className="w-[40%] flex flex-col items-end">
            <h3 className="font-pixel text-xs md:text-sm text-[#4e3415] uppercase tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] flex gap-2">
              <span className="text-[10px]">Enemy</span> {npcId}
            </h3>
            <div className="w-full mt-1 border-[3px] border-[#3a2810] bg-[#1a1107] h-6 relative shadow-inner">
              <span className="absolute inset-0 flex items-center justify-start px-2 text-[10px] font-pixel text-white z-10 drop-shadow-md">
                {Math.ceil(aiHealth)}/100
              </span>
              <motion.div 
                initial={{ width: '100%' }} 
                animate={{ width: `${aiHealth}%` }} 
                className="h-full bg-[#bf3c3c] border-b-[2px] border-[#8a2222] ml-auto origin-right" 
              />
            </div>
          </div>
        </div>

        {/* --- Combat Arena --- */}
        <div className={`relative flex flex-1 items-center justify-center overflow-hidden border-t-[4px] border-[#3a2810] bg-[#a6cc9a] p-4 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)] map-bg-pattern md:p-8 ${isCodingRound ? 'min-h-[540px] md:min-h-[720px]' : 'min-h-[380px] md:min-h-[460px]'}`}>
          {/* Subtle grid overlay to sell "game map" feel */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHYxSDBWMHptMCAzOWg0MHYxSDB2LTF6TTAgMHY0MEgxVjBIMHptMzkgMHY0MGgxVjBoLTF6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDUpIi8+PC9zdmc+')] pointer-events-none opacity-50" />

          {/* Enemy Stage / Platform */}
          <div className="absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 w-48 md:w-64 h-16 md:h-24 bg-[#7a9d6c] border-[3px] border-[#4b6a3f] rounded-[100%] shadow-[inset_0_-8px_0_rgba(0,0,0,0.1),0_10px_10px_rgba(0,0,0,0.2)]" />

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#3a2810] bg-[#f4e2b8] flex justify-center items-center rounded-full animate-bounce shadow-lg">
                  <Sword className="h-8 w-8 text-[#8a6332]" />
                </div>
                <h3 className="mt-4 text-xl font-pixel text-[#3a2810] drop-shadow-md">Loading Battle...</h3>
              </motion.div>
            )}

            {battleState === 'intro' && !loading && (
              <motion.div key="intro" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="relative z-10 text-center">
                <motion.div
                  initial={{ y: -50, scale: 0.5 }}
                  animate={{ y: 0, scale: 1 }}
                  className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] animate-pulse"
                >
                  {skillMon.icon}
                </motion.div>
                <div className="bg-[#f4e2b8] border-[4px] border-[#3a2810] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
                  <h2 className="mb-2 text-2xl md:text-3xl font-pixel uppercase tracking-widest text-[#d63a3a] drop-shadow-[0_1px_0_#3a2810]">
                    Enemy <span className="text-[#3a2810]">{skillMon.name}</span>
                  </h2>
                  <p className="text-sm font-pixel text-[#4e3415]">{String(topic || '').toUpperCase()}</p>
                </div>
              </motion.div>
            )}

            {battleState === 'fighting' && currentQuestion && (
              <motion.div key={`round-${currentRound}`} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} className={`relative z-10 flex w-full flex-col ${isCodingRound ? 'max-w-[1140px] items-stretch' : 'max-w-2xl items-center'}`}>
                {/* Floating Enemy Sprite Scale down during fight to focus on question */}
                <motion.div 
                  initial={{ y: 0 }} animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-32 md:-top-48 opacity-60 text-5xl md:text-7xl drop-shadow-2xl"
                >
                  {skillMon.icon}
                </motion.div>

                <div className="w-full bg-[#f8ecd1] border-[4px] border-[#3a2810] p-4 md:p-6 mb-4 shadow-[6px_6px_0_rgba(0,0,0,0.3)] relative">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Brain className="w-12 h-12" /></div>
                  <h3 className="text-center text-lg md:text-2xl font-heading font-medium leading-normal text-[#3a2810] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] relative z-10">
                    {currentQuestion.text}
                  </h3>
                  {/* Hint button */}
                  <div className="mt-3 flex items-start gap-2">
                    <button
                      type="button"
                      disabled={hintLoading || selectedAnswer !== null}
                      onClick={async () => {
                        setHintLoading(true);
                        try {
                          const { data } = await GameService.getHint(currentQuestion.text, topic, 1, 1);
                          setBattleHint(data.hint);
                        } catch {
                          setBattleHint('Trust your instincts — break it down step by step.');
                        } finally {
                          setHintLoading(false);
                        }
                      }}
                      className="flex items-center gap-1 border-[2px] border-[#a0743c] bg-[#f4e2b8] px-2 py-1 font-pixel text-[9px] uppercase text-[#4e3415] shadow-[0_2px_0_#a0743c] hover:bg-[#ffeac4] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 shrink-0"
                    >
                      <Lightbulb className="h-3 w-3" />
                      {hintLoading ? '...' : 'Hint'}
                    </button>
                    {battleHint && (
                      <span className="text-[11px] text-[#5a3a14] font-heading bg-[#fff8e7] border border-[#dfb564] px-2 py-1 flex-1">
                        💡 {battleHint}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full min-h-[320px]">
                  {currentQuestion.type === 'coding' ? (
                    <div className="coding-battle-container min-h-[620px] w-full rounded-[14px] border-[4px] border-[#3a2810] bg-[#1a1a2e] p-3 md:min-h-[700px] md:p-4">
                        <CodeEditorBattle
                            question={currentQuestion}
                            onSuccess={() => handleAnswer(currentQuestion.correctIndex !== undefined ? currentQuestion.correctIndex : 0)}
                            onFailure={() => handleAnswer(-1)}
                        />
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-1 gap-3 md:grid-cols-2">
                      {currentQuestion.options.map((option, index) => {
                        const optionIsSelected = selectedAnswer === index;
                        let buttonClass = 'bg-[#eecf9e] border-[#a0743c] text-[#4e3415] hover:bg-[#ffeac4] active:translate-y-[4px] active:shadow-none shadow-[0_4px_0_#a0743c]';
                        let icon = null;

                        if (selectedAnswer !== null) {
                          if (index === currentQuestion.correctIndex) {
                             buttonClass = 'bg-[#6fc281] border-[#3a7c4a] text-[#1e4827] shadow-[0_4px_0_#3a7c4a] opacity-100 font-bold transform -translate-y-1';
                             icon = '✅';
                          } else if (optionIsSelected) {
                             buttonClass = 'bg-[#e55252] border-[#912d2d] text-[#ffffff] shadow-[0_4px_0_#912d2d] transform translate-y-1 scale-[0.98]';
                             icon = '❌';
                          } else {
                             buttonClass = 'bg-[#d8c8af] border-[#a69680] text-[#867560] opacity-60 shadow-[0_4px_0_#a69680] pointer-events-none';
                          }
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={selectedAnswer !== null}
                            onClick={() => handleAnswer(index)}
                            className={`flex items-center justify-between border-[3px] p-3 md:p-4 text-left transition-all font-heading text-sm md:text-base ${buttonClass}`}
                          >
                            <span className="font-medium flex-1">{option}</span>
                            {icon && <span className="ml-2 text-xl drop-shadow-md">{icon}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedAnswer !== null && (
                  <motion.div initial={{ opacity: 0, y: 30, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring" }} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     <div className={`px-6 md:px-10 py-4 md:py-6 rounded border-[6px] border-black bg-white shadow-[10px_10px_0_rgba(0,0,0,0.5)] transform -rotate-[5deg]`}>
                       <p className={`text-3xl md:text-5xl font-pixel uppercase drop-shadow-[3px_3px_0_rgba(0,0,0,1)] ${isCorrect ? 'text-[#51a868]' : 'text-[#e55252]'}`}>
                         {isCorrect ? 'SUPER EFFECTIVE!' : 'MISS!'}
                       </p>
                     </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* --- End States --- */}
            {battleState === 'won' && (
              <motion.div key="won" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 bg-[#f4e2b8] border-[6px] border-[#3a2810] p-6 shadow-[10px_10px_0_rgba(0,0,0,0.5)] md:min-w-[400px]">
                {showItemAnimation && (
                  <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.5 }}
                    animate={{ y: -100, opacity: 0, scale: 2 }}
                    transition={{ duration: 1.5, type: 'spring' }}
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-50 pointer-events-none"
                  >
                    <div className="text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">{rewardData?.droppedItem ? '🎁' : skillMon.icon}</div>
                    <p className="mt-4 text-xl font-pixel text-white drop-shadow-[3px_3px_0_#3a2810]">+1 {rewardData?.droppedItem || skillMon.name}!</p>
                  </motion.div>
                )}
                
                <h2 className="mb-4 text-center text-4xl font-pixel uppercase tracking-widest text-[#51a868] drop-shadow-[0_2px_0_#2f6f40]">Victory!</h2>
                
                <div className="bg-[#1a1107] border-[3px] border-[#4e3415] p-4 text-[#eecf9e] font-pixel text-sm flex flex-col gap-2">
                  <p className="text-[#a6cc9a]">Reward Data:</p>
                  <p>XP Gained: <span className="text-white">+{rewardData?.xp || '50'}</span></p>
                  <p>Focus Replenish: <span className="text-[#64a5df]">+{rewardData?.focus || '50'}</span></p>
                  {rewardData?.lvlUp && <p className="animate-pulse text-[#dfb564]">LEVEL UP TRIGGERED!</p>}
                </div>
                
                <button
                  type="button"
                  disabled={resolvingResult}
                  onClick={() => finalizeBattle('win')}
                  className="mt-6 w-full btn-primary disabled:opacity-50"
                >
                  {resolvingResult ? 'Saving...' : 'Continue'}
                </button>
              </motion.div>
            )}

            {battleState === 'lost' && (
              <motion.div key="lost" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 bg-[#f4e2b8] border-[6px] border-[#3a2810] p-6 shadow-[10px_10px_0_rgba(0,0,0,0.5)] md:min-w-[400px]">
                <h2 className="mb-4 text-center text-4xl font-pixel uppercase tracking-widest text-[#e55252] drop-shadow-[0_2px_0_#912d2d]">Defeat</h2>
                
                <div className="bg-[#1a1107] border-[3px] border-[#4e3415] p-4 text-[#eecf9e] font-pixel text-xs leading-loose text-center">
                  Error: Out of Health.<br/>
                  Further study of <span className="text-[#d63a3a]">{topic}</span> required.
                </div>

                <button
                  type="button"
                  disabled={resolvingResult}
                  onClick={() => finalizeBattle('lose')}
                  className="mt-6 w-full btn-delete disabled:opacity-50"
                >
                  {resolvingResult ? 'Saving...' : 'Retreat & Study'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BattleModal;
