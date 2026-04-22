import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, CheckCircle2, ChevronRight, Code2, Lightbulb,
  ShieldCheck, SkipForward, Sparkles, Swords, X, Bug, Wrench
} from 'lucide-react';
import { GameService } from '../services/api';
import { cn } from '../utils/cn';
import {
  ScenarioStep, ChoiceStep, PredictStep, SandboxStep,
  DebugStep, CheckpointStep, StoryStep
} from './LessonSteps';

const isInteractiveLesson = (d) => d?.mode === 'mentor_journey' && Array.isArray(d?.steps);

const stepIconMap = {
  scenario: Sparkles, story: Sparkles, choice: Lightbulb,
  predict: Code2, sandbox: Wrench, debug: Bug, checkpoint: ShieldCheck,
  sequence: BookOpen,
};

const stepLabelMap = {
  scenario: 'Briefing', story: 'Briefing', choice: 'Decision',
  predict: 'Code Trace', sandbox: 'Code Lab', debug: 'Debug',
  checkpoint: 'Battle Prep', sequence: 'Flow',
};

/* ── Passive lesson fallback ── */
const PassiveLessonBody = ({ lessonData, onClose }) => {
  const content = lessonData?.content || lessonData?.reminderText ||
    lessonData?.blockMessage || lessonData?.objective || lessonData;
  return (
    <div className="glass-panel relative w-full max-w-2xl p-6 md:p-8">
      <button onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition">
        <X className="h-5 w-5" />
      </button>
      <div className="mb-6 flex items-center gap-3 border-b border-glass-border pb-4">
        <div className="rounded-xl bg-brand-500/20 p-3 text-brand-400"><BookOpen className="h-6 w-6" /></div>
        <div>
          <h2 className="text-2xl font-bold">Mentor Notes</h2>
          <p className="text-sm text-gray-400">Take a breath, study the pattern, then try again.</p>
        </div>
      </div>
      <div className="prose prose-invert max-h-[50vh] max-w-none overflow-y-auto pr-4">
        <h3 className="mb-3 text-xl font-bold text-brand-300">{lessonData?.title || 'System Lesson'}</h3>
        <p className="whitespace-pre-wrap text-gray-300">{content}</p>
      </div>
      <button onClick={onClose} className="btn-primary mt-8 flex w-full items-center justify-center gap-2">
        Acknowledge &amp; Close <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

/* ── Interactive Lesson Body ── */
const InteractiveLessonBody = ({ lessonData, onClose, onResolved }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [resolutionError, setResolutionError] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setFeedback('');
    setResolutionError('');
    setIsResolving(false);
  }, [lessonData]);

  const steps = lessonData.steps || [];
  const currentStep = steps[currentStepIndex];
  const progressCount = completedSteps.size;

  const markComplete = (stepId) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
    setFeedback(currentStep?.successText || 'Well done.');
  };

  const resolveLesson = async (action) => {
    setIsResolving(true);
    setResolutionError('');
    try {
      const { data } = await GameService.resolveLesson(lessonData.id, { action });
      onResolved?.(data);
    } catch (error) {
      setResolutionError(error.response?.data?.error || error.message || 'Failed to resolve.');
      setIsResolving(false);
    }
  };

  const goToNextStep = () => {
    if (!completedSteps.has(currentStep?.id)) return;
    if (currentStepIndex >= steps.length - 1) { resolveLesson('complete'); return; }
    setCurrentStepIndex(i => i + 1);
    setFeedback('');
  };

  const canContinue = completedSteps.has(currentStep?.id);

  const renderStep = () => {
    if (!currentStep) return null;
    const onComplete = () => markComplete(currentStep.id);
    switch (currentStep.type) {
      case 'scenario': return <ScenarioStep step={currentStep} onComplete={onComplete} />;
      case 'choice': return <ChoiceStep step={currentStep} onComplete={onComplete} />;
      case 'predict': return <PredictStep step={currentStep} onComplete={onComplete} />;
      case 'sandbox': return <SandboxStep step={currentStep} onComplete={onComplete} />;
      case 'debug': return <DebugStep step={currentStep} onComplete={onComplete} />;
      case 'checkpoint': return <CheckpointStep step={currentStep} onComplete={onComplete} />;
      case 'story': return <StoryStep step={currentStep} onComplete={onComplete} />;
      default: return <p className="text-[#d7ddff]">Unknown step type: {currentStep.type}</p>;
    }
  };

  return (
    <div className="flex min-h-[680px] flex-col bg-[#12111a] text-white">
      {/* ── Header ── */}
      <div className="border-b-[4px] border-[#3a2810] bg-[#eecf9e] px-4 py-4 text-[#3a2810] md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Mentor avatar */}
            <div className="hidden md:flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-[#8a6332] bg-[#f4e2b8] text-3xl shadow-md">
              🧙
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[#5a3a14]">
                {lessonData.mentor?.name || 'Mentor'}
              </div>
              <h2 className="text-xl font-pixel uppercase leading-tight md:text-2xl">
                {lessonData.title}
              </h2>
              <p className="mt-1 text-sm text-[#5a3a14] max-w-xl">
                {lessonData.objective}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-md border border-[#8a6332] bg-[#f8ebcf] p-2 hover:bg-[#ffeac4] transition shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-pixel uppercase tracking-[0.14em] text-[#6b4a20]">
          <span className="rounded-full border border-[#8a6332] bg-[#f8ebcf] px-3 py-1">
            Topic: {lessonData.topic}
          </span>
          <span className="rounded-full border border-[#8a6332] bg-[#f8ebcf] px-3 py-1">
            Step: {currentStepIndex + 1} / {steps.length}
          </span>
          <span className="rounded-full border border-[#8a6332] bg-[#f8ebcf] px-3 py-1">
            Next: {lessonData.upcomingChallenge?.name}
          </span>
        </div>
      </div>

      {/* ── Body: Sidebar + Main ── */}
      <div className="grid flex-1 gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="border-b border-[#2f3147] bg-[#181725] p-4 lg:border-b-0 lg:border-r overflow-y-auto">
          <div className="text-[10px] font-pixel uppercase tracking-[0.18em] text-[#f6d087]">
            Lesson Steps
          </div>
          <div className="mt-3 space-y-2">
            {steps.map((step, i) => {
              const Icon = stepIconMap[step.type] || BookOpen;
              const complete = completedSteps.has(step.id);
              const isCurrent = i === currentStepIndex;
              return (
                <button key={step.id} type="button"
                  onClick={() => { if (i <= currentStepIndex || complete) { setCurrentStepIndex(i); setFeedback(''); } }}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2.5 text-left transition',
                    isCurrent ? 'border-[#f6d087] bg-[#23243a]'
                    : complete ? 'border-[#4c9156] bg-[rgba(76,145,86,0.1)]'
                    : 'border-[#33354f] bg-[#1c1d2d] opacity-60'
                  )}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg border shrink-0',
                      complete ? 'border-[#4c9156] bg-[#224028]' : 'border-[#4a4d69] bg-[#26283d]')}>
                      {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[#9fe2a8]" />
                                : <Icon className="h-3.5 w-3.5 text-[#f6d087]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-pixel uppercase tracking-[0.12em] text-[#8f95bd]">
                        {stepLabelMap[step.type] || 'Step'}
                      </div>
                      <div className="text-[13px] font-semibold text-[#f8ecd1] truncate">{step.title}</div>
                    </div>
                    {complete && isCurrent && <CheckCircle2 className="h-3 w-3 text-[#9fe2a8] ml-auto shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-4 rounded-xl border border-[#33354f] bg-[#1c1d2d] p-3">
            <div className="text-[9px] font-pixel uppercase tracking-[0.14em] text-[#8f95bd]">Progress</div>
            <div className="mt-1 text-xl font-pixel text-[#f6d087]">{progressCount} / {steps.length}</div>
            <div className="mt-2 h-2 rounded-full bg-[#26283d] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4c9156] to-[#9fe2a8] transition-all"
                style={{ width: `${steps.length ? (progressCount / steps.length) * 100 : 0}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-[#8f95bd]">{lessonData.skipSummary}</p>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex min-h-0 flex-col bg-[#12111a] p-4 md:p-6 overflow-y-auto">
          {/* Step header */}
          <div className="rounded-xl border border-[#343750] bg-[#1a1b2b] p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#f6d087]">
                {stepLabelMap[currentStep?.type] || 'Step'} {currentStepIndex + 1}
              </span>
              {completedSteps.has(currentStep?.id) && (
                <CheckCircle2 className="h-4 w-4 text-[#9fe2a8]" />
              )}
            </div>
            <h3 className="mt-1 text-xl font-bold text-[#f8ecd1]">{currentStep?.title}</h3>
          </div>

          {/* Step content */}
          <div className="flex-1 rounded-xl border border-[#2f3147] bg-[#151624] p-4 md:p-5">
            {renderStep()}

            {feedback && (
              <div className="mt-4 rounded-xl border border-[#4c9156] bg-[rgba(76,145,86,0.1)] p-4 text-sm text-[#e6f8e9] leading-7 animate-[fadeIn_0.3s_ease]">
                ✨ {feedback}
              </div>
            )}
            {resolutionError && (
              <div className="mt-4 rounded-xl border border-[#a54848] bg-[rgba(165,72,72,0.12)] p-4 text-sm text-[#ffd4d4]">
                {resolutionError}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => resolveLesson('skip')}
              disabled={isResolving || !lessonData.canSkip}
              className="inline-flex items-center gap-2 rounded-xl border border-[#8a6332] bg-[#2c2130] px-4 py-2 text-sm font-semibold text-[#f6d087] hover:border-[#f8e3a5] disabled:opacity-40 disabled:cursor-not-allowed transition">
              <SkipForward className="h-4 w-4" />
              {lessonData.skipLabel || "I'll Skip This Lesson"}
            </button>
            <button type="button" onClick={goToNextStep}
              disabled={isResolving || !canContinue}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4c9156] px-5 py-2.5 text-sm font-pixel uppercase text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {currentStepIndex >= steps.length - 1
                ? <><Swords className="h-4 w-4" /> Complete &amp; Fight</>
                : <>Looks Good, Next Step! <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ── Modal Wrapper ── */
const LessonModal = ({ lessonData, onClose, onResolved }) => {
  const interactive = isInteractiveLesson(lessonData);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-12 backdrop-blur-sm md:pt-16">
      {interactive ? (
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl border-[4px] border-[#3a2810] shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <InteractiveLessonBody lessonData={lessonData} onClose={onClose} onResolved={onResolved} />
        </div>
      ) : (
        <PassiveLessonBody lessonData={lessonData} onClose={onClose} />
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default LessonModal;
