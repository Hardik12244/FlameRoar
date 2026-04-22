import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameSync } from '../context/GameSyncContext';
import { Map, AlertCircle, Crosshair, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import QuestionModal from '../components/QuestionModal';
import LessonModal from '../components/LessonModal';
import DialogueModal from '../components/DialogueModal';
import BattleModal from '../components/BattleModal';
import CaptureModal from '../components/CaptureModal';
import MedalModal from '../components/MedalModal';
import SkillTreeModal from '../components/SkillTreeModal';
import InventoryModal from '../components/InventoryModal';
import SkillDexModal from '../components/SkillDexModal';
import { initGame } from '../game/survival-game';
import { GameService } from '../services/api';
import { getCurrentObjective } from '../game/storyEngine';

const getLessonPayload = (lesson) => {
  if (!lesson) {
    return {
      title: 'Review Required',
      content: 'Revisit the concept before attempting the encounter again.',
    };
  }

  if (typeof lesson === 'string') {
    return {
      title: 'Review Required',
      content: lesson,
    };
  }

  return {
    title: lesson.title || 'Review Required',
    content:
      lesson.content ||
      lesson.reminderText ||
      lesson.blockMessage ||
      lesson.objective ||
      lesson.concept ||
      lesson.explanation ||
      'Revisit the concept before attempting the encounter again.',
    explanation: lesson.explanation,
  };
};

const GamePage = () => {
  const gameRef = useRef(null);
  const { user } = useAuth();
  const {
    refreshAllGameState,
    progression,
    syncExploreChunk,
    pushProgressToPhaser,
    syncing,
  } = useGameSync();

  const [activeTopic, setActiveTopic] = useState('variables');
  const [challengeTopic, setChallengeTopic] = useState(null);
  const [challengeNpc, setChallengeNpc] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonContent, setLessonContent] = useState(null);
  const [showSkillTreeModal, setShowSkillTreeModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSkillDexModal, setShowSkillDexModal] = useState(false);
  const [caughtConcept, setCaughtConcept] = useState(null);
  const [awardedMedal, setAwardedMedal] = useState(null);

  const [notification, setNotification] = useState(null);

  const [phaserReady, setPhaserReady] = useState(false);
  const notificationTimerRef = useRef(null);
  const lastLessonAnnouncementRef = useRef(undefined);
  const [dialogueState, setDialogueState] = useState({
    isOpen: false,
    npcId: '',
    npcName: '',
    dialogueLines: [],
    npcRole: '',
    autoInteract: false,
  });
  const lessonState = progression?.progression?.lessonState || user?.lessonState || null;

  const resumePhaser = () => {
    window.dispatchEvent(new CustomEvent('phaser-resume'));
  };

  const showTimedNotification = (message, duration = 4500) => {
    if (!message) {
      return;
    }

    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    setNotification(message);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, duration);
  };

  useEffect(() => () => {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const activeLesson = lessonState?.currentLesson || null;
    const nextLessonId = activeLesson?.id || null;

    if (lastLessonAnnouncementRef.current === undefined) {
      lastLessonAnnouncementRef.current = nextLessonId;

      if (activeLesson) {
        showTimedNotification(`Return to ${activeLesson.mentorName} for ${activeLesson.topic} training.`, 5500);
      }
      return;
    }

    if (lastLessonAnnouncementRef.current !== nextLessonId) {
      lastLessonAnnouncementRef.current = nextLessonId;

      if (activeLesson) {
        showTimedNotification(`Return to ${activeLesson.mentorName} for ${activeLesson.topic} training.`, 5500);
      }
    }
  }, [lessonState]);

  // ── Phaser event wiring ──

  useEffect(() => {
    const handleNodeClick = (event) => {
      setActiveTopic(typeof event.detail === 'string' ? event.detail : event.detail?.topic);
      setShowQuestionModal(true);
    };

    const handleNpcChallenge = (event) => {
      const topic = event.detail?.topic;
      const npcId = event.detail?.npcId || 'Gatekeeper';
      if (!topic) return;

      setChallengeTopic(topic);
      setChallengeNpc(npcId);
      setShowBattleModal(true);
    };

    const handleNpcDialogue = (event) => {
      const { npcId, npcName, dialogue, role, autoInteract } = event.detail || {};
      setDialogueState({
        isOpen: true,
        npcId: npcId || '',
        npcName: npcName || 'Companion',
        dialogueLines: dialogue || ['...'],
        npcRole: role || 'mentor',
        autoInteract: Boolean(autoInteract),
      });
    };

    const handleNpcInteract = async (event) => {
      const npcId = event.detail?.npcId;
      if (!npcId) {
        resumePhaser();
        return;
      }

      let shouldResume = true;

      try {
        const { data } = await GameService.interactWithNpc(npcId);

        if (data?.action === 'lesson' && data.lesson) {
          setLessonContent(data.lesson);
          setShowLessonModal(true);
          shouldResume = false;
          return;
        }

        await refreshAllGameState();
      } catch (error) {
        console.error('Failed to resolve NPC interaction:', error);
      } finally {
        if (shouldResume) {
          resumePhaser();
        }
      }
    };

    const handleExploration = (event) => {
      const chunk = event.detail?.chunk;
      if (!chunk) return;

      // Use debounced exploration sync from the sync context
      syncExploreChunk(chunk);
    };

    window.addEventListener('phaser:nodeClick', handleNodeClick);
    window.addEventListener('phaser:challenge', handleNpcChallenge);
    window.addEventListener('phaser:dialogue', handleNpcDialogue);
    window.addEventListener('phaser:npc-interact', handleNpcInteract);
    window.addEventListener('phaser:exploredNewArea', handleExploration);

    if (gameRef.current) {
      if (!window.__PHASER_GAME__) {
        initGame('phaser-game');
      }

      gameRef.current.classList.remove('opacity-0');
      gameRef.current.classList.add('opacity-100');
      setPhaserReady(true);
    }

    return () => {
      window.removeEventListener('phaser:nodeClick', handleNodeClick);
      window.removeEventListener('phaser:challenge', handleNpcChallenge);
      window.removeEventListener('phaser:dialogue', handleNpcDialogue);
      window.removeEventListener('phaser:npc-interact', handleNpcInteract);
      window.removeEventListener('phaser:exploredNewArea', handleExploration);

      if (window.__PHASER_GAME__) {
        window.__PHASER_GAME__.destroy(true);
        window.__PHASER_GAME__ = null;
      }
    };
  }, [refreshAllGameState, syncExploreChunk]);

  // ── Push user progress to Phaser when both are ready ──

  useEffect(() => {
    if (!phaserReady) return undefined;

    const timer = window.setTimeout(() => {
      pushProgressToPhaser();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [phaserReady, pushProgressToPhaser]);

  // ── Battle callbacks ──

  const handleBattleSuccess = async (result) => {
    setShowBattleModal(false);
    await refreshAllGameState();

    if (result && result.medalAwarded) {
      setAwardedMedal(result.medalAwarded);
    } else {
      resumePhaser();

      const itemText = result?.droppedItem ? ` Found: ${result.droppedItem}!` : '';
      if (itemText) {
        showTimedNotification(`Victory!${itemText}`);
      }
    }
  };

  const handleBattleFailure = async (result) => {
    setShowBattleModal(false);
    await refreshAllGameState();

    const lessonPayload = getLessonPayload(
      result?.failureLesson || result?.lesson || `Review required for: ${challengeTopic}`
    );
    if (result?.mentorPrompt?.message) {
      lessonPayload.content = `${lessonPayload.content}\n\n${result.mentorPrompt.message}`;
    }
    setLessonContent(lessonPayload);
    setShowLessonModal(true);
  };

  // ── Question callbacks ──

  const handleQuestionSuccess = async (result) => {
    setShowQuestionModal(false);
    await refreshAllGameState();

    if (result && result.caughtSkillmon) {
      setCaughtConcept(result.caughtSkillmon);
    } else {
      resumePhaser();
    }
  };

  const handleQuestionFailure = async (lesson) => {
    setShowQuestionModal(false);
    await refreshAllGameState();
    setLessonContent(getLessonPayload(lesson));
    setShowLessonModal(true);
  };

  const handleLessonResolved = async (result) => {
    setShowLessonModal(false);
    setLessonContent(null);

    try {
      await refreshAllGameState();
    } finally {
      const lesson = result?.lesson;
      if (result?.action === 'skip') {
        showTimedNotification(
          `${lesson?.title || 'Lesson'} skipped. ${lesson?.gateNpcName || 'The next challenge'} is open without extra guidance.`
        );
      } else {
        showTimedNotification(
          `${lesson?.title || 'Lesson'} complete. ${lesson?.gateNpcName || 'The next challenge'} is now open.`
        );
      }

      resumePhaser();
    }
  };

  // ── Fullscreen ──

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.log(`Error attempting to enable full-screen mode: ${error.message} (${error.name})`);
      });
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const currentObjective = getCurrentObjective(user, lessonState);

  return (
    <div className="relative flex h-[min(100dvh,920px)] max-h-[calc(100dvh-6rem)] flex-col px-2 md:px-4">
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading flex items-center gap-2 text-2xl text-map-ink md:text-3xl">
          <Map className="h-7 w-7 text-map-brown md:h-8 md:w-8" />
          The Gauntlet
          {syncing && (
            <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" title="Syncing..." />
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          
          {/* Chapter HUD */}
          <div className="flex items-center gap-2 rounded-xl border-2 border-[#7a5b2f] bg-[#f2deb0] px-3 py-1.5 shadow-[0_2px_0_#9a7740,0_4px_0_#684924]">
            <span className="text-xl drop-shadow-sm">{currentObjective.icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-[#684b24] uppercase tracking-wider leading-tight">
                Ch. {currentObjective.chapterNumber} • {currentObjective.chapterTitle}
              </span>
              <span className="text-[11px] font-bold text-[#3a2810] leading-tight">
                {currentObjective.objective}
              </span>
            </div>
          </div>

          {/* Medals HUD */}
          {user?.medalsCount?.length > 0 && (
            <div className="flex items-center gap-1 rounded-xl border-2 border-[#3a2810] bg-[#f4e2b8] px-2 py-1.5 shadow-[0_2px_0_#3a2810]">
              <span className="hidden md:inline-block text-[10px] font-pixel text-[#8c6733] tracking-widest uppercase mr-1">
                Medals
              </span>
              <div className="flex gap-1">
                {user.medalsCount.map(medal => {
                  let icon = '🎖️';
                  let bgClass = 'bg-[#d8b476]';
                  if (medal === 'Identity Medal') { icon = '👤'; bgClass = 'bg-blue-300'; }
                  if (medal === 'Logic Medal') { icon = '⚙️'; bgClass = 'bg-amber-300'; }
                  if (medal === 'Decision Medal') { icon = '⚖️'; bgClass = 'bg-purple-300'; }
                  if (medal === 'Cycle Medal') { icon = '🔄'; bgClass = 'bg-emerald-300'; }
                  
                  return (
                    <div 
                      key={medal} 
                      title={medal} 
                      className={`flex h-6 w-6 items-center justify-center rounded-sm border-[2px] border-[#3a2810] text-sm shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] ${bgClass}`}
                    >
                      {icon}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInventoryModal(true)}
            className="flex items-center gap-2 rounded-xl border border-map-brown/30 bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-map-brown shadow-sm transition hover:bg-map-brown/10 hover:text-map-ink"
          >
            <span className="text-sm">🎒</span> Bag
            {user?.inventory?.length > 0 && (
              <span className="ml-1 rounded-full bg-map-brown/20 px-1.5 text-[10px] font-bold text-map-brown">
                {user.inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowSkillDexModal(true)}
            className="flex items-center gap-2 rounded-xl border border-violet-300/80 bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-violet-900 shadow-sm transition hover:bg-violet-100/80"
          >
            <Brain className="h-4 w-4" />
            Dex
            {user?.skillDex?.length > 0 && (
              <span className="ml-1 rounded-full bg-violet-200/60 px-1.5 text-[10px] font-bold text-violet-800">
                {user.skillDex.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={toggleFullScreen}
            className="rounded-xl border border-map-brown/25 bg-white/70 px-3 py-2 font-mono text-xs text-map-ink shadow-sm transition hover:bg-white"
          >
            Fullscreen
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('phaser:nodeClick', { detail: 'Variables' }))}
            className="rounded-xl border border-map-brown/20 bg-white/50 px-3 py-2 font-mono text-xs text-map-ink-muted transition hover:border-map-brown/35 hover:text-map-ink"
          >
            Demo event
          </button>
          <div className="rounded-xl border border-map-brown/15 bg-white/70 px-3 py-2 shadow-sm">
            <span className="text-sm text-map-ink-muted">Focus</span>
            <span className="ml-2 font-bold text-amber-700">{user?.focusEnergy ?? 0}%</span>
          </div>
        </div>
      </div>

      <div className="group relative min-h-0 w-full flex-1 cursor-crosshair overflow-hidden rounded-2xl border border-map-brown/25 bg-[#0f1410] shadow-[var(--shadow-map-lift)]">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute h-[800px] w-[800px] rounded-full border border-brand-500/10"
            style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,107,0,0.2) 100%)' }}
          />
          <div className="absolute h-[800px] w-[800px] rounded-full border border-brand-500/20" />
          <div className="absolute h-[500px] w-[500px] rounded-full border border-brand-500/30" />
          <div className="absolute h-[200px] w-[200px] rounded-full border border-brand-500/40 bg-brand-500/5" />
          <Crosshair className="absolute h-12 w-12 text-brand-500/50" />
        </div>

        <div ref={gameRef} id="phaser-game" className="relative z-10 h-full w-full opacity-0 transition-opacity duration-1000" />

        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-500 pointer-events-none ${phaserReady ? 'opacity-0' : 'opacity-100'}`}>
          <AlertCircle className="mb-4 h-12 w-12 animate-bounce text-brand-500" />
          <h2 className="rounded-xl border border-glass-border bg-dark-bg/80 px-6 py-2 text-2xl font-bold backdrop-blur-md">
            Awaiting Phaser Engine
          </h2>
          <p className="mt-2 max-w-md rounded-xl border border-glass-border bg-dark-bg/80 px-4 py-2 text-gray-400 backdrop-blur-md">
            Inject your Phaser.js map logic inside the `useEffect` of GamePage.jsx to initialize the visual grid.
          </p>
        </div>
      </div>

      {showQuestionModal && (
        <QuestionModal
          topic={activeTopic}
          onClose={() => {
            setShowQuestionModal(false);
            window.dispatchEvent(new CustomEvent('phaser-resume'));
          }}
          onSuccess={handleQuestionSuccess}
          onFailure={handleQuestionFailure}
        />
      )}

      {showBattleModal && (
        <BattleModal
          topic={challengeTopic}
          npcId={challengeNpc}
          onClose={() => {
            setShowBattleModal(false);
            window.dispatchEvent(new CustomEvent('phaser-resume'));
          }}
          onSuccess={handleBattleSuccess}
          onFailure={handleBattleFailure}
        />
      )}

      {showLessonModal && (
        <LessonModal
          lessonData={lessonContent}
          onClose={() => {
            setShowLessonModal(false);
            setLessonContent(null);
            resumePhaser();
          }}
          onResolved={handleLessonResolved}
        />
      )}

      <SkillTreeModal
        isOpen={showSkillTreeModal}
        onClose={() => setShowSkillTreeModal(false)}
        userXp={user?.xp || 0}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />

      <CaptureModal
        isOpen={Boolean(caughtConcept)}
        caughtConcept={caughtConcept}
        onClose={() => {
          setCaughtConcept(null);
          resumePhaser();
        }}
      />

      <MedalModal
        medalName={awardedMedal}
        onClose={() => {
          setAwardedMedal(null);
          resumePhaser();
        }}
      />

      {showSkillDexModal && (
        <SkillDexModal onClose={() => setShowSkillDexModal(false)} />
      )}

      <DialogueModal
        isOpen={dialogueState.isOpen}
        npcName={dialogueState.npcName}
        dialogueLines={dialogueState.dialogueLines}
        npcRole={dialogueState.npcRole}
        onClose={() => {
          setDialogueState((prev) => ({ ...prev, isOpen: false }));
          window.dispatchEvent(new CustomEvent('react:dialogue-complete'));
        }}
      />

      {/* Notifications */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <p className="text-sm text-map-ink">{notification}</p>
            </div>
            <button
              onClick={() => {
                if (notificationTimerRef.current) {
                  window.clearTimeout(notificationTimerRef.current);
                  notificationTimerRef.current = null;
                }
                setNotification(null);
              }}
              className="text-map-ink-muted transition hover:text-map-ink"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
