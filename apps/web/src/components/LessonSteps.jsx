import React, { useState } from 'react';
import { Lightbulb, Bug, ChevronRight, Eye, EyeOff } from 'lucide-react';
import LessonCodeSandbox from './LessonCodeSandbox';
import { cn } from '../utils/cn';

/* ── Scenario Step ── */
export const ScenarioStep = ({ step, onComplete }) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const lines = step.mentorDialogue || [];
  const allRead = dialogueIndex >= lines.length;

  const advance = () => {
    if (dialogueIndex < lines.length) {
      setDialogueIndex(i => i + 1);
    } else if (!showQuestion) {
      setShowQuestion(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* NPC Dialogue */}
      <div className="rounded-2xl border-[3px] border-[#8a6332] bg-[#f8ecd1] p-5 shadow-md">
        <div className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#8a6332] mb-2">
          💬 Mentor Says
        </div>
        <div className="space-y-3">
          {lines.slice(0, dialogueIndex).map((line, i) => (
            <p key={i} className="text-sm leading-7 text-[#3a2810] font-heading animate-[fadeIn_0.3s_ease]">
              "{line}"
            </p>
          ))}
        </div>
        {!allRead && (
          <button onClick={advance}
            className="mt-3 flex items-center gap-1 text-[11px] font-pixel uppercase text-[#8a6332] hover:text-[#4e3415] transition">
            <ChevronRight className="h-3 w-3" /> Next
          </button>
        )}
      </div>

      {/* Scenario */}
      {allRead && (
        <div className="rounded-2xl border border-[#343750] bg-[#1a1b2b] p-5 animate-[fadeIn_0.4s_ease]">
          <div className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#f6d087] mb-3">
            ⚡ The Situation
          </div>
          <p className="text-sm leading-7 text-[#d7ddff]">{step.scenarioDescription}</p>
          {!showQuestion && (
            <button onClick={() => setShowQuestion(true)}
              className="mt-4 rounded-lg bg-[#4c9156] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition">
              I See the Problem
            </button>
          )}
        </div>
      )}

      {showQuestion && (
        <div className="rounded-2xl border border-[#4c9156] bg-[rgba(76,145,86,0.1)] p-5 animate-[fadeIn_0.3s_ease]">
          <p className="text-sm font-semibold text-[#9fe2a8] mb-3">{step.scenarioQuestion}</p>
          <button onClick={onComplete}
            className="rounded-lg bg-[#4c9156] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition">
            Let's Solve It →
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Choice Step ── */
export const ChoiceStep = ({ step, onComplete }) => {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleSelect = (option) => {
    setSelected(option.id);
    setFeedback(option.detail);
    if (option.isCorrect) setTimeout(() => onComplete(), 800);
  };

  return (
    <div className="space-y-4">
      <p className="text-base font-semibold text-[#f8ecd1] leading-7">{step.prompt}</p>
      <div className="grid gap-3">
        {(step.options || []).map(opt => {
          const isSel = selected === opt.id;
          const showCorrect = selected && opt.isCorrect;
          const showWrong = isSel && !opt.isCorrect;
          return (
            <button key={opt.id} type="button" onClick={() => !selected && handleSelect(opt)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                showCorrect ? 'border-[#4c9156] bg-[rgba(76,145,86,0.15)] scale-[1.01]'
                : showWrong ? 'border-[#a54848] bg-[rgba(165,72,72,0.12)] opacity-80'
                : selected ? 'border-[#33354f] bg-[#1c1d2d] opacity-50'
                : 'border-[#404366] bg-[#202238] hover:border-[#f6d087] cursor-pointer'
              )}>
              <div className="text-sm font-semibold text-[#f8ecd1]">{opt.text}</div>
              {isSel && <div className="mt-2 text-sm text-[#c7ccef]">{opt.detail}</div>}
            </button>
          );
        })}
      </div>
      {feedback && selected && !(step.options || []).find(o => o.id === selected)?.isCorrect && (
        <button onClick={() => { setSelected(null); setFeedback(''); }}
          className="text-[11px] font-pixel uppercase text-[#f6d087] hover:underline">
          Try Again
        </button>
      )}
    </div>
  );
};

/* ── Predict Step (with Trace) ── */
export const PredictStep = ({ step, onComplete }) => {
  const [selected, setSelected] = useState(null);
  const [showTrace, setShowTrace] = useState(false);
  const [traceIndex, setTraceIndex] = useState(0);
  const traces = step.traceSteps || [];

  const handleSelect = (opt) => {
    setSelected(opt.id);
    if (opt.isCorrect) setTimeout(() => onComplete(), 800);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[#f8ecd1]">{step.prompt}</p>

      {/* Code snippet */}
      <pre className="overflow-x-auto rounded-xl border border-[#404366] bg-[#0d0e17] p-4 font-mono text-sm leading-7 text-[#dce4ff]">
        {step.snippet}
      </pre>

      {/* Trace visualizer */}
      {traces.length > 0 && (
        <div className="rounded-xl border border-[#33354f] bg-[#151624] p-3">
          <button onClick={() => setShowTrace(!showTrace)}
            className="flex items-center gap-2 text-[11px] font-pixel uppercase text-[#f6d087] hover:text-[#ffeac4] transition">
            {showTrace ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showTrace ? 'Hide' : 'Show'} Step-by-Step Trace
          </button>
          {showTrace && (
            <div className="mt-3 space-y-1">
              {traces.slice(0, traceIndex + 1).map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-[#1c1d2d] px-3 py-2 text-[12px] animate-[fadeIn_0.2s_ease]">
                  <span className="font-pixel text-[#8a6332] shrink-0">L{t.line}</span>
                  <span className="text-[#c7ccef] flex-1">{t.note}</span>
                  <code className="text-[#9fe2a8] shrink-0 font-mono">
                    {Object.entries(t.vars || {}).map(([k,v]) => `${k}=${v}`).join(' ')}
                  </code>
                </div>
              ))}
              {traceIndex < traces.length - 1 && (
                <button onClick={() => setTraceIndex(i => i + 1)}
                  className="mt-1 text-[10px] font-pixel uppercase text-[#4c9156] hover:text-[#9fe2a8] transition">
                  ▶ Next Step
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(step.options || []).map(opt => {
          const isSel = selected === opt.id;
          const correct = selected && opt.isCorrect;
          const wrong = isSel && !opt.isCorrect;
          return (
            <button key={opt.id} onClick={() => !selected && handleSelect(opt)}
              className={cn(
                'rounded-xl border p-4 text-center font-mono text-lg transition-all',
                correct ? 'border-[#4c9156] bg-[rgba(76,145,86,0.15)]'
                : wrong ? 'border-[#a54848] bg-[rgba(165,72,72,0.12)]'
                : selected ? 'border-[#33354f] opacity-40'
                : 'border-[#404366] bg-[#202238] hover:border-[#f6d087] cursor-pointer'
              )}>
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected && !(step.options || []).find(o => o.id === selected)?.isCorrect && (
        <button onClick={() => { setSelected(null); setTraceIndex(0); }}
          className="text-[11px] font-pixel uppercase text-[#f6d087] hover:underline">
          Try Again
        </button>
      )}
    </div>
  );
};

/* ── Sandbox Step ── */
export const SandboxStep = ({ step, onComplete }) => {
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[#f8ecd1] leading-7">{step.prompt}</p>
      {step.hint && (
        <button onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 text-[11px] font-pixel uppercase text-[#f6d087] hover:text-[#ffeac4] transition">
          <Lightbulb className="h-3 w-3" /> {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
      )}
      {showHint && step.hint && (
        <div className="rounded-lg border border-[#8a6332] bg-[#2c2130] px-3 py-2 text-sm text-[#f6d087]">
          💡 {step.hint}
        </div>
      )}
      <LessonCodeSandbox
        initialCode={step.starterCode || ''}
        expectedOutput={step.expectedOutput || ''}
        language={step.language || 'javascript'}
        stdin={step.stdin || ''}
        height="220px"
        showExpectedOutput={true}
        checkLabel="Run & Check"
        onCorrect={() => { if (!done) { setDone(true); onComplete(); } }}
      />
    </div>
  );
};

/* ── Debug Step ── */
export const DebugStep = ({ step, onComplete }) => {
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#ff9b9b]">
        <Bug className="h-5 w-5" />
        <p className="text-sm font-semibold leading-7">{step.prompt}</p>
      </div>
      {step.bugHint && (
        <button onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 text-[11px] font-pixel uppercase text-[#f6d087] hover:text-[#ffeac4] transition">
          <Lightbulb className="h-3 w-3" /> {showHint ? 'Hide Clue' : 'Need a Clue?'}
        </button>
      )}
      {showHint && step.bugHint && (
        <div className="rounded-lg border border-[#8a6332] bg-[#2c2130] px-3 py-2 text-sm text-[#f6d087]">
          🔍 {step.bugHint}
        </div>
      )}
      <LessonCodeSandbox
        initialCode={step.buggyCode || ''}
        expectedOutput={step.expectedOutput || ''}
        language={step.language || 'javascript'}
        stdin={step.stdin || ''}
        height="220px"
        showExpectedOutput={true}
        runLabel="Run"
        checkLabel="Fix & Check"
        onCorrect={() => { if (!done) { setDone(true); onComplete(); } }}
      />
    </div>
  );
};

/* ── Checkpoint Step ── */
export const CheckpointStep = ({ step, onComplete }) => {
  const [checked, setChecked] = useState(new Set());
  const items = step.checklist || [];
  const allChecked = checked.size >= items.length;

  const toggle = (i) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[#f8ecd1]">{step.prompt}</p>
      {step.keyTakeaway && (
        <div className="rounded-xl border border-[#4c9156] bg-[rgba(76,145,86,0.08)] p-4">
          <div className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#9fe2a8] mb-2">Key Takeaway</div>
          <p className="text-sm text-[#d7ddff] leading-7">{step.keyTakeaway}</p>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <button key={i} onClick={() => toggle(i)}
            className={cn(
              'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
              checked.has(i) ? 'border-[#4c9156] bg-[rgba(76,145,86,0.12)]' : 'border-[#404366] bg-[#202238] hover:border-[#f6d087]'
            )}>
            <div className={cn('mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
              checked.has(i) ? 'border-[#4c9156] bg-[#4c9156]' : 'border-[#4a4d69]')}>
              {checked.has(i) && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-sm text-[#e5e9ff] leading-6">{item}</span>
          </button>
        ))}
      </div>
      {allChecked && (
        <button onClick={onComplete}
          className="w-full rounded-xl bg-[#4c9156] px-4 py-3 text-sm font-pixel uppercase text-white hover:brightness-110 transition animate-[fadeIn_0.3s_ease]">
          ⚔️ I Am Ready for Battle
        </button>
      )}
    </div>
  );
};

/* ── Legacy Story Step (fallback) ── */
export const StoryStep = ({ step, onComplete }) => {
  const beats = step.beats || [];
  const [revealed, setRevealed] = useState([]);
  const allRevealed = revealed.length >= beats.length;

  const reveal = (i) => {
    if (!revealed.includes(i)) {
      const next = [...revealed, i];
      setRevealed(next);
      if (next.length >= beats.length) onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#d7ddff]">{step.prompt}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {beats.map((beat, i) => (
          <button key={i} onClick={() => reveal(i)}
            className={cn('min-h-[140px] rounded-xl border p-4 text-left transition',
              revealed.includes(i) ? 'border-[#4c9156] bg-[rgba(76,145,86,0.1)]' : 'border-[#404366] bg-[#202238] hover:border-[#f6d087]')}>
            <div className="text-[10px] font-pixel uppercase text-[#8f95bd]">Note {i+1}</div>
            <div className="mt-3 text-sm text-[#f5f7ff] leading-7">
              {revealed.includes(i) ? beat : 'Tap to reveal'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
