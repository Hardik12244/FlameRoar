const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const Question = require('../models/Question');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || process.env.RAPIDAPI_KEY || '';
const LOCAL_EXECUTION_TIMEOUT_MS = 8000;

const languageMap = {
    python: 71,
    javascript: 93,
    cpp: 54,
    java: 62
};

const localRuntimeMap = {
    python: {
        command: 'python',
        extension: 'py'
    },
    javascript: {
        command: 'node',
        extension: 'js'
    }
};

const normalizeLocalSource = (sourceCode, language) => {
    if (language === 'javascript') {
        const rewrittenSource = sourceCode.replace(/(["'`])\/dev\/stdin\1/g, '0');

        return [
            '(function () {',
            "  const __codexInput = process.env.__CODEX_STDIN || '';",
            "  const __codexLines = __codexInput.split(/\\r?\\n/);",
            '  let __codexIndex = 0;',
            "  global.prompt = () => (__codexLines[__codexIndex++] ?? '').replace(/\\r$/, '');",
            '  global.readline = global.prompt;',
            '})();',
            '',
            rewrittenSource
        ].join('\n');
    }

    if (language === 'python') {
        return sourceCode.replace(/(["'])\/dev\/stdin\1/g, '0');
    }

    return sourceCode;
};

const executeLocally = async (sourceCode, language, stdin = '') => {
    const runner = localRuntimeMap[language];
    if (!runner) {
        throw new Error(`Local execution is not supported for ${language}`);
    }

    const startedAt = Date.now();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flameroar-code-'));
    const filePath = path.join(tempDir, `solution.${runner.extension}`);

    await fs.writeFile(filePath, normalizeLocalSource(sourceCode, language), 'utf8');

    try {
        const result = await new Promise((resolve) => {
            const child = spawn(runner.command, [filePath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
                env: {
                    ...process.env,
                    __CODEX_STDIN: stdin
                }
            });

            let stdout = '';
            let stderr = '';
            let timedOut = false;

            const timeoutId = setTimeout(() => {
                timedOut = true;
                child.kill();
            }, LOCAL_EXECUTION_TIMEOUT_MS);

            child.stdout.on('data', (chunk) => {
                stdout += chunk.toString();
            });

            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
            });

            child.on('error', (error) => {
                clearTimeout(timeoutId);
                resolve({
                    stdout,
                    stderr: `${stderr}${stderr ? '\n' : ''}${error.message}`.trim(),
                    exitCode: 1,
                    timedOut: false
                });
            });

            child.on('close', (exitCode) => {
                clearTimeout(timeoutId);
                resolve({
                    stdout,
                    stderr,
                    exitCode,
                    timedOut
                });
            });

            child.stdin.write(stdin || '');
            child.stdin.end();
        });

        const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(3);

        if (result.timedOut) {
            return {
                stdout: result.stdout,
                stderr: result.stderr || `Execution exceeded ${LOCAL_EXECUTION_TIMEOUT_MS / 1000} seconds.`,
                compile_output: null,
                status: { id: 5, description: 'Time Limit Exceeded' },
                time: elapsedSeconds
            };
        }

        return {
            stdout: result.stdout,
            stderr: result.exitCode === 0 ? null : (result.stderr || `Process exited with code ${result.exitCode}.`),
            compile_output: null,
            status: {
                id: result.exitCode === 0 ? 3 : 6,
                description: result.exitCode === 0 ? 'Accepted' : 'Runtime Error'
            },
            time: elapsedSeconds
        };
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
};

const executeWithJudge0 = async (sourceCode, languageId, stdin = '') => {
    const language = Object.keys(languageMap).find((key) => languageMap[key] === languageId);

    if (!JUDGE0_KEY) {
        if (language && localRuntimeMap[language]) {
            return executeLocally(sourceCode, language, stdin);
        }

        throw new Error('A Judge0 API key is required for this language');
    }

    try {
        const response = await axios.post(`${JUDGE0_URL}/submissions`, {
            source_code: sourceCode,
            language_id: languageId,
            stdin,
            expected_output: null
        }, {
            params: { base64_encoded: 'false', wait: 'true' },
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': JUDGE0_HOST,
                'X-RapidAPI-Key': JUDGE0_KEY
            }
        });

        return response.data;
    } catch (err) {
        console.error('Judge0 Execution Error', err.response?.data || err.message);
        throw new Error('Code execution failed');
    }
};

exports.executeCode = async (req, res) => {
    try {
        const { source_code: sourceCode, language, stdin } = req.body;
        const normalizedLanguage = String(language || '').toLowerCase();
        const languageId = languageMap[normalizedLanguage];

        if (!languageId) {
            return res.status(400).json({ error: 'Language not supported' });
        }

        const result = await executeWithJudge0(sourceCode, languageId, stdin);

        res.json({
            stdout: result.stdout || '',
            stderr: result.stderr || result.compile_output || '',
            time: result.time || '0',
            status: result.status?.description
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.submitCode = async (req, res) => {
    try {
        const {
            source_code: sourceCode,
            language,
            question_id: questionId,
            test_cases: providedTestCases,
            testCases: legacyProvidedTestCases
        } = req.body;
        const normalizedLanguage = String(language || 'python').toLowerCase();
        const languageId = languageMap[normalizedLanguage];

        if (!languageId) {
            return res.status(400).json({ error: 'Language not supported' });
        }

        let testCases = Array.isArray(providedTestCases) ? providedTestCases : legacyProvidedTestCases;

        if (!Array.isArray(testCases) || testCases.length === 0) {
            if (!questionId) {
                return res.status(400).json({ error: 'Test cases are required to submit code' });
            }

            try {
                const question = await Question.findById(questionId);
                testCases = question?.codingDetails?.testCases;
            } catch (dbError) {
                console.warn('Coding question lookup failed, no inline test cases were provided.', dbError.message);
            }
        }

        if (!Array.isArray(testCases) || testCases.length === 0) {
            return res.status(404).json({ error: 'Question test cases are unavailable for submission' });
        }

        let passedCount = 0;
        const total = testCases.length;
        const details = [];

        for (const testCase of testCases) {
            const result = await executeWithJudge0(sourceCode, languageId, testCase.input);
            const output = result.stdout ? result.stdout.trim() : '';
            const expected = testCase.expectedOutput ? testCase.expectedOutput.trim() : '';
            const passed = output === expected && result.status?.id === 3;

            if (passed) {
                passedCount += 1;
            }

            details.push({
                input: testCase.input,
                expectedOutput: expected,
                actualOutput: output,
                error: result.stderr || result.compile_output || '',
                passed,
                isHidden: testCase.isHidden
            });
        }

        res.json({
            passed: passedCount === total,
            passedCount,
            total,
            details
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
