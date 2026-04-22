import React, { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Check, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../services/api';

/**
 * LessonCodeSandbox — A lightweight code sandbox for lessons.
 * Allows students to write / modify code and see output in real-time.
 * Used for "sandbox", "debug", and "predict" step types in the new lesson system.
 */

const LANGUAGE_IDS = { python: 'python', javascript: 'javascript' };

const LessonCodeSandbox = ({
  initialCode = '',
  expectedOutput = '',
  language = 'javascript',
  stdin = '',
  readOnly = false,
  onCorrect,
  onIncorrect,
  height = '260px',
  showExpectedOutput = false,
  runLabel = 'Run',
  checkLabel = 'Check Output',
  className = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [resultState, setResultState] = useState(null); // 'correct' | 'incorrect' | null

  useEffect(() => {
    setCode(initialCode);
    setOutput('');
    setResultState(null);
  }, [initialCode]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput('Running...');
    setResultState(null);

    try {
      const response = await api.post('/code/execute', {
        source_code: code,
        language,
        stdin,
      });

      const out = response.data.stdout?.trim() || '';
      const err = response.data.stderr || response.data.compile_output || '';

      if (err) {
        setOutput(`Error:\n${err}`);
        setResultState('incorrect');
      } else {
        setOutput(out || '(No output)');

        if (expectedOutput) {
          const normalizeStr = (s) => s.replace(/\r\n/g, '\n').trim();
          if (normalizeStr(out) === normalizeStr(expectedOutput)) {
            setResultState('correct');
            onCorrect?.();
          } else {
            setResultState('incorrect');
            onIncorrect?.();
          }
        }
      }
    } catch (error) {
      setOutput(`Execution error: ${error.response?.data?.error || error.message}`);
      setResultState('incorrect');
    } finally {
      setIsRunning(false);
    }
  }, [code, language, stdin, expectedOutput, onCorrect, onIncorrect]);

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setResultState(null);
  };

  return (
    <div className={`lesson-sandbox flex flex-col gap-3 ${className}`}>
      {/* Editor toolbar */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#4a4d69] bg-[#1c1d2d] px-3 py-2">
        <span className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#f6d087]">
          {LANGUAGE_IDS[language] || language}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md border border-[#4a4d69] bg-[#26283d] px-2.5 py-1.5 text-[11px] font-semibold text-[#c7ccef] transition hover:border-[#f6d087] hover:text-[#f6d087]"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 rounded-md bg-[#4c9156] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {isRunning ? 'Running...' : (expectedOutput ? checkLabel : runLabel)}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div
        className="overflow-hidden rounded-xl border border-[#32344c] bg-[#0d0e17]"
        style={{ height }}
      >
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            wordWrap: 'on',
            renderLineHighlight: 'line',
          }}
        />
      </div>

      {/* Output panel */}
      <div
        className={`rounded-xl border p-3 transition-colors ${
          resultState === 'correct'
            ? 'border-[#4c9156] bg-[rgba(76,145,86,0.12)]'
            : resultState === 'incorrect'
            ? 'border-[#a54848] bg-[rgba(165,72,72,0.1)]'
            : 'border-[#32344c] bg-[#12131d]'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#f6d087]">
            Output
          </span>
          {resultState === 'correct' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#9fe2a8]">
              <Check className="h-3 w-3" /> Correct!
            </span>
          )}
          {resultState === 'incorrect' && output && (
            <span className="text-[11px] font-semibold text-[#ff9b9b]">Try again</span>
          )}
        </div>
        <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-6 text-[#e7ebff]">
          {output || 'Run your code to see the output.'}
        </pre>
        {showExpectedOutput && expectedOutput && (
          <div className="mt-3 border-t border-[#32344c] pt-3">
            <span className="text-[10px] font-pixel uppercase tracking-[0.16em] text-[#8f95bd]">
              Expected
            </span>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-sm text-[#8f95bd]">
              {expectedOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonCodeSandbox;
