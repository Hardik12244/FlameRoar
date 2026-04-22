import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';

const fallbackCode = {
    python: '# Write your solution here\n',
    javascript: '// Read from standard input and write your solution here\nconst input = require("fs").readFileSync(0, "utf8").trim();\n// Your code here\n'
};

const normalizeDisplayedCode = (sourceCode = '', language = 'python') => {
    if (language !== 'javascript') {
        return sourceCode;
    }

    return sourceCode.replace(/(["'`])\/dev\/stdin\1/g, '0');
};

const buildStarterCode = (question, language) => {
    if (question?.codingDetails?.baseCode) {
        const rawStarter = question.codingDetails.baseCode[language] || fallbackCode[language] || '';
        return normalizeDisplayedCode(rawStarter, language);
    }

    return fallbackCode[language] || '';
};

const formatExecutionOutput = ({ stdout, stderr, compile_output: compileOutput, status, time }) => {
    const lines = [];

    if (stdout) {
        lines.push(`Output:\n${stdout}`);
    }

    if (stderr) {
        lines.push(`Error:\n${stderr}`);
    }

    if (compileOutput) {
        lines.push(`Compilation Error:\n${compileOutput}`);
    }

    if (!stdout && !stderr && !compileOutput) {
        lines.push(status || 'Execution finished without output.');
    }

    if (time) {
        lines.push(`Time: ${time}s`);
    }

    return lines.join('\n\n');
};

export const CodeEditorBattle = ({ question, onSuccess, onFailure }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);

    useEffect(() => {
        setCode(buildStarterCode(question, language));
    }, [question, language]);

    useEffect(() => {
        setStdin(question?.codingDetails?.sampleInput || '');
        setOutput('');
        setTestResults(null);
    }, [question]);

    const handleRun = async () => {
        setIsExecuting(true);
        setOutput('Running code...');
        setTestResults(null);

        try {
            const response = await api.post('/code/execute', {
                source_code: code,
                language,
                stdin
            });

            setOutput(formatExecutionOutput(response.data));
        } catch (error) {
            setOutput(`Error executing code: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setOutput('Running test cases...');
        setTestResults(null);

        try {
            const response = await api.post('/code/submit', {
                source_code: code,
                language,
                question_id: question._id,
                test_cases: question?.codingDetails?.testCases || []
            });

            const { passed, passedCount, total } = response.data;
            setTestResults(response.data);

            if (passed) {
                setOutput(`Success! Passed all ${total} test cases.`);
                window.setTimeout(() => onSuccess(), 1500);
            } else {
                setOutput(`Failed. Passed ${passedCount}/${total} test cases.\nCheck the details below.`);
                window.setTimeout(() => onFailure(), 2000);
            }
        } catch (error) {
            setOutput(`Error submitting code: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const details = question?.codingDetails || {};
    const descriptionBlocks = [
        { label: 'Input Format', value: details.inputFormat },
        { label: 'Output Format', value: details.outputFormat },
        { label: 'Sample Input', value: details.sampleInput },
        { label: 'Sample Output', value: details.sampleOutput }
    ].filter((item) => item.value);

    return (
        <div className="flex h-full min-h-[620px] flex-col gap-4 text-white">
            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="min-h-0 overflow-y-auto rounded-xl border border-[#32344c] bg-[#171827] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <h3 className="text-xl font-semibold leading-snug text-[#f8ecd1]">
                        {question.questionText}
                    </h3>

                    <div className="mt-4 space-y-4">
                        {descriptionBlocks.map((block) => (
                            <div key={block.label}>
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d087]">
                                    {block.label}
                                </div>
                                <pre className="mt-2 overflow-x-auto rounded-lg border border-[#3a3d57] bg-[#222437] p-3 font-mono text-sm text-[#f5f7ff] whitespace-pre-wrap">
                                    {block.value}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex min-h-0 flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#32344c] bg-[#161728] px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f6d087]">
                                Language
                            </span>
                            <select
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="rounded-lg border border-[#4a4d69] bg-[#26283d] px-3 py-2 text-sm text-white outline-none transition focus:border-[#7ca6ff]"
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleRun}
                                disabled={isExecuting || isSubmitting}
                                className="rounded-lg bg-[#4caf50] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isExecuting ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isExecuting || isSubmitting}
                                className="rounded-lg bg-[#2196f3] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="h-[420px] overflow-hidden rounded-xl border border-[#32344c] bg-[#111827] xl:h-[540px]">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 16,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                }}
                            />
                        </div>

                        <div className="flex h-[220px] flex-col rounded-xl border border-[#32344c] bg-[#171827] p-3 lg:h-[420px] xl:h-[540px]">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d087]">
                                    Custom Input
                                </span>
                                {details.sampleInput && (
                                    <button
                                        type="button"
                                        onClick={() => setStdin(details.sampleInput || '')}
                                        className="rounded-md border border-[#4a4d69] bg-[#26283d] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f8ecd1] transition hover:border-[#7ca6ff]"
                                    >
                                        Use Sample
                                    </button>
                                )}
                            </div>

                            <textarea
                                value={stdin}
                                onChange={(event) => setStdin(event.target.value)}
                                placeholder="Program input goes here"
                                className="mt-3 min-h-0 flex-1 resize-none rounded-lg border border-[#3a3d57] bg-[#222437] p-3 font-mono text-sm text-white outline-none transition focus:border-[#7ca6ff]"
                            />

                            <p className="mt-3 text-xs leading-relaxed text-[#aab1d6]">
                                `Run Code` uses this input. `Submit` still checks the hidden test cases from the challenge.
                            </p>
                        </div>
                    </div>

                    <div className="min-h-[220px] overflow-y-auto rounded-xl border border-[#32344c] bg-[#12131d] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303347] pb-3">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f6d087]">
                                Console
                            </span>
                            {testResults && (
                                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9dd69d]">
                                    {testResults.passedCount}/{testResults.total} passed
                                </span>
                            )}
                        </div>

                        <pre className="mt-4 whitespace-pre-wrap font-mono text-sm leading-6 text-[#e7ebff]">
                            {output || 'Run your code to inspect the output here.'}
                        </pre>

                        {testResults?.details && (
                            <div className="mt-5 space-y-3">
                                {testResults.details.map((testCase, index) => (
                                    <div
                                        key={`${index}-${testCase.input}`}
                                        className={`rounded-lg border px-3 py-3 ${
                                            testCase.passed
                                                ? 'border-[#3d7046] bg-[rgba(76,175,80,0.12)]'
                                                : 'border-[#8d3d3d] bg-[rgba(244,67,54,0.12)]'
                                        }`}
                                    >
                                        <div className="text-sm font-semibold text-[#f8ecd1]">
                                            Test Case {index + 1}: {testCase.passed ? 'Passed' : 'Failed'}
                                        </div>

                                        {!testCase.passed && !testCase.isHidden && (
                                            <div className="mt-2 space-y-1 text-sm text-[#d7ddff]">
                                                <div>Expected: {testCase.expectedOutput}</div>
                                                <div>Actual: {testCase.actualOutput || '(no output)'}</div>
                                                {testCase.error && <div>Error: {testCase.error}</div>}
                                            </div>
                                        )}

                                        {!testCase.passed && testCase.isHidden && (
                                            <div className="mt-2 text-sm text-[#d7ddff]">
                                                Hidden test case failed.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
