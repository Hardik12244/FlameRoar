const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isMock, isAIMock } = require('../config/env');

const apiKey = process.env.OPENAI_API_KEY || '';
const isGroq = apiKey.startsWith('gsk_');

// Only init Gemini if it's NOT a Groq key and NOT mocking AI
const genAI = (isAIMock || isGroq) ? null : new GoogleGenerativeAI(apiKey);
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

// ──────────────────────────────────────────────
// Groq API Fetch Wrapper
// ──────────────────────────────────────────────
const generateGroqContent = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(`Groq API Error: ${response.status} ${JSON.stringify(errObj)}`);
    }

    const json = await response.json();
    return json.choices[0].message.content;
};

// ──────────────────────────────────────────────
// Unified Text Generation
// ──────────────────────────────────────────────
const askAI = async (prompt) => {
    if (isGroq) {
        return await generateGroqContent(prompt);
    } else if (model) {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    throw new Error('No AI provider configured');
};

const withRetry = async (operation, maxRetries = 5) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const status = error.status || (error.response ? error.response.status : null);
            const isRetriable = status === 503 || status === 429 || error.message?.includes('503') || error.message?.includes('429');
            
            if (isRetriable) {
                const baseDelay = status === 429 ? 10000 : 2000; // Wait longer for 429
                const delay = Math.pow(2, i) * baseDelay;
                console.log(`\x1b[33m⚠️  AI Service Rate Limited or Busy (${status}). Retry ${i + 1}/${maxRetries} in ${delay}ms...\x1b[0m`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

// ──────────────────────────────────────────────
// Question History Cache (in-memory dedup)
// ──────────────────────────────────────────────
const questionHistoryCache = new Map(); // key: "topic" → Set of question texts
const HISTORY_MAX_PER_TOPIC = 50;

const getQuestionHistory = (topic) => {
    const key = topic.toLowerCase().trim();
    if (!questionHistoryCache.has(key)) {
        questionHistoryCache.set(key, []);
    }
    return questionHistoryCache.get(key);
};

const addToQuestionHistory = (topic, questionText) => {
    if (!questionText) return;
    const history = getQuestionHistory(topic);
    history.push(questionText.trim());
    // Evict oldest if over limit
    while (history.length > HISTORY_MAX_PER_TOPIC) {
        history.shift();
    }
};

const clearQuestionHistory = (topic) => {
    if (topic) {
        questionHistoryCache.delete(topic.toLowerCase().trim());
    } else {
        questionHistoryCache.clear();
    }
};

// ──────────────────────────────────────────────
// Answer Position Tracking (bias prevention)
// ──────────────────────────────────────────────
const answerPositionHistory = new Map(); // key: "topic" → array of positions (0-3)

const trackAnswerPosition = (topic, correctIndex) => {
    const key = topic.toLowerCase().trim();
    if (!answerPositionHistory.has(key)) {
        answerPositionHistory.set(key, []);
    }
    const history = answerPositionHistory.get(key);
    history.push(correctIndex);
    if (history.length > 10) history.shift();
};

const getLastPositions = (topic) => {
    const key = topic.toLowerCase().trim();
    return answerPositionHistory.get(key) || [];
};

const needsPositionRebalance = (topic, currentPosition) => {
    const lastPositions = getLastPositions(topic);
    if (lastPositions.length < 2) return false;
    // Check if last 2 positions are the same as current
    const last2 = lastPositions.slice(-2);
    return last2.every(p => p === currentPosition);
};

// ──────────────────────────────────────────────
// Post-Generation Validation
// ──────────────────────────────────────────────
const validateMCQ = (question) => {
    const errors = [];

    if (!question.questionText || question.questionText.length < 10) {
        errors.push('Question text is too short or missing');
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
        errors.push('Must have exactly 4 options');
    }

    const correctCount = (question.options || []).filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
        errors.push(`Must have exactly 1 correct answer, found ${correctCount}`);
    }

    // Check options are distinct
    const optTexts = (question.options || []).map(o => (o.text || '').toLowerCase().trim());
    const uniqueOpts = new Set(optTexts);
    if (uniqueOpts.size < 4) {
        errors.push('Options must be distinct');
    }

    // Check no empty options
    if (optTexts.some(t => t.length < 2)) {
        errors.push('Options must not be empty');
    }

    return errors;
};

const validateCodingQuestion = (question) => {
    const errors = [];

    if (!question.questionText || question.questionText.length < 15) {
        errors.push('Coding question text is too short or missing');
    }

    if (!question.codingDetails) {
        errors.push('Missing coding details');
    } else {
        if (!question.codingDetails.sampleInput && !question.codingDetails.sampleOutput) {
            errors.push('Missing sample input/output');
        }
    }

    return errors;
};

// ──────────────────────────────────────────────
// MOCK Question Pool (varied, randomized)
// ──────────────────────────────────────────────
const MOCK_QUESTION_POOLS = {
    variables: [
        {
            questionText: 'Which keyword is used to declare a constant in JavaScript?',
            options: [
                { text: 'var', isCorrect: false },
                { text: 'let', isCorrect: false },
                { text: 'const', isCorrect: true },
                { text: 'define', isCorrect: false }
            ],
            explanation: 'The `const` keyword declares a block-scoped read-only reference.'
        },
        {
            questionText: 'What will `typeof null` return in JavaScript?',
            options: [
                { text: '"null"', isCorrect: false },
                { text: '"object"', isCorrect: true },
                { text: '"undefined"', isCorrect: false },
                { text: '"boolean"', isCorrect: false }
            ],
            explanation: 'This is a known JavaScript quirk — typeof null returns "object".'
        },
        {
            questionText: 'Which of these is NOT a valid variable name in JavaScript?',
            options: [
                { text: '_myVar', isCorrect: false },
                { text: '$price', isCorrect: false },
                { text: 'my-var', isCorrect: true },
                { text: 'myVar2', isCorrect: false }
            ],
            explanation: 'Hyphens are not allowed in JavaScript variable names.'
        },
        {
            questionText: 'What is the difference between `let` and `var`?',
            options: [
                { text: 'let is function-scoped, var is block-scoped', isCorrect: false },
                { text: 'They are identical', isCorrect: false },
                { text: 'var is function-scoped, let is block-scoped', isCorrect: true },
                { text: 'let cannot be reassigned', isCorrect: false }
            ],
            explanation: '`var` is function-scoped while `let` is block-scoped (curly braces).'
        },
    ],
    operators: [
        {
            questionText: 'What does the `===` operator check in JavaScript?',
            options: [
                { text: 'Value only', isCorrect: false },
                { text: 'Type only', isCorrect: false },
                { text: 'Both value and type', isCorrect: true },
                { text: 'Neither value nor type', isCorrect: false }
            ],
            explanation: '`===` is the strict equality operator that checks both value and type.'
        },
        {
            questionText: 'What is the result of `"5" + 3` in JavaScript?',
            options: [
                { text: '8', isCorrect: false },
                { text: '"53"', isCorrect: true },
                { text: 'NaN', isCorrect: false },
                { text: 'Error', isCorrect: false }
            ],
            explanation: 'The + operator with a string performs concatenation, not addition.'
        },
        {
            questionText: 'Which operator is used for exponentiation in JavaScript?',
            options: [
                { text: '^', isCorrect: false },
                { text: '**', isCorrect: true },
                { text: '^^', isCorrect: false },
                { text: 'Math.pow only', isCorrect: false }
            ],
            explanation: 'The ** operator performs exponentiation (e.g., 2 ** 3 = 8).'
        },
    ],
    conditionals: [
        {
            questionText: 'Which value is NOT falsy in JavaScript?',
            options: [
                { text: '0', isCorrect: false },
                { text: '""', isCorrect: false },
                { text: '"false"', isCorrect: true },
                { text: 'null', isCorrect: false }
            ],
            explanation: 'The string "false" is truthy — only empty string "" is falsy.'
        },
        {
            questionText: 'What does a switch statement compare with?',
            options: [
                { text: 'Loose equality (==)', isCorrect: false },
                { text: 'Strict equality (===)', isCorrect: true },
                { text: 'Type coercion', isCorrect: false },
                { text: 'Pattern matching', isCorrect: false }
            ],
            explanation: 'Switch uses strict comparison (===), not loose comparison.'
        },
    ],
    loops: [
        {
            questionText: 'Which loop guarantees at least one execution?',
            options: [
                { text: 'for', isCorrect: false },
                { text: 'while', isCorrect: false },
                { text: 'for...in', isCorrect: false },
                { text: 'do...while', isCorrect: true }
            ],
            explanation: 'A do...while loop always executes the body at least once before checking the condition.'
        },
        {
            questionText: 'What does `break` do inside a loop?',
            options: [
                { text: 'Skips the current iteration', isCorrect: false },
                { text: 'Exits the loop entirely', isCorrect: true },
                { text: 'Restarts the loop', isCorrect: false },
                { text: 'Pauses execution', isCorrect: false }
            ],
            explanation: '`break` immediately exits the innermost loop.'
        },
    ],
    syntax: [
        {
            questionText: 'What ends most statements in JavaScript?',
            options: [
                { text: 'Colon (:)', isCorrect: false },
                { text: 'Period (.)', isCorrect: false },
                { text: 'Semicolon (;)', isCorrect: true },
                { text: 'Comma (,)', isCorrect: false }
            ],
            explanation: 'Semicolons terminate statements, though ASI can insert them automatically.'
        },
    ],
};

const MOCK_CODING_QUESTIONS = [
    {
        questionText: 'Write a function that takes two numbers and returns their sum.',
        codingDetails: {
            inputFormat: 'Two integers a and b, one per line',
            outputFormat: 'A single integer — the sum of a and b',
            sampleInput: '3\n5',
            sampleOutput: '8',
            baseCode: {
                python: '# Read two numbers and print their sum\na = int(input())\nb = int(input())\n# Your code here\n',
                javascript: '// Read two numbers and print their sum\nconst readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", (l) => lines.push(l));\nrl.on("close", () => {\n  const a = parseInt(lines[0]);\n  const b = parseInt(lines[1]);\n  // Your code here\n});\n'
            },
            testCases: [
                { input: '3\n5', expectedOutput: '8', isHidden: false },
                { input: '0\n0', expectedOutput: '0', isHidden: false },
                { input: '-1\n1', expectedOutput: '0', isHidden: true },
            ]
        },
        explanation: 'Use the + operator to add two numbers together.',
        difficulty: 'easy',
    },
    {
        questionText: 'Write a function that checks if a given number is even or odd. Print "Even" or "Odd".',
        codingDetails: {
            inputFormat: 'A single integer n',
            outputFormat: '"Even" or "Odd"',
            sampleInput: '4',
            sampleOutput: 'Even',
            baseCode: {
                python: '# Read a number and print Even or Odd\nn = int(input())\n# Your code here\n',
                javascript: '// Read a number and print Even or Odd\nconst n = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());\n// Your code here\n'
            },
            testCases: [
                { input: '4', expectedOutput: 'Even', isHidden: false },
                { input: '7', expectedOutput: 'Odd', isHidden: false },
                { input: '0', expectedOutput: 'Even', isHidden: true },
            ]
        },
        explanation: 'Use the modulo operator (%) to check if a number is divisible by 2.',
        difficulty: 'easy',
    },
    {
        questionText: 'Write a program that prints the Fibonacci sequence up to n terms, separated by spaces.',
        codingDetails: {
            inputFormat: 'A single integer n (n >= 1)',
            outputFormat: 'The first n Fibonacci numbers separated by spaces',
            sampleInput: '6',
            sampleOutput: '0 1 1 2 3 5',
            baseCode: {
                python: '# Print first n Fibonacci numbers\nn = int(input())\n# Your code here\n',
                javascript: '// Print first n Fibonacci numbers\nconst n = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());\n// Your code here\n'
            },
            testCases: [
                { input: '6', expectedOutput: '0 1 1 2 3 5', isHidden: false },
                { input: '1', expectedOutput: '0', isHidden: false },
                { input: '10', expectedOutput: '0 1 1 2 3 5 8 13 21 34', isHidden: true },
            ]
        },
        explanation: 'Each Fibonacci number is the sum of the two preceding ones.',
        difficulty: 'medium',
    },
];

/**
 * Shuffle an array in place (Fisher-Yates)
 */
const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Pick a random item from an array, different from recent items if possible
 */
const pickUnique = (pool, recentTexts) => {
    const unused = pool.filter(q => !recentTexts.includes(q.questionText?.trim()));
    if (unused.length > 0) {
        return unused[Math.floor(Math.random() * unused.length)];
    }
    // All used — just pick random
    return pool[Math.floor(Math.random() * pool.length)];
};

// ──────────────────────────────────────────────
// AI Service — Core Question Generation
// ──────────────────────────────────────────────

const generateQuestion = async (topic, difficulty, context = '', playerContext = {}) => {
    if (isAIMock) {
        console.log(`\x1b[33m⚠️ AI Mocking: Serving varied mock question for ${topic}\x1b[0m`);
        return generateMockQuestion(topic, difficulty);
    }

    try {
        const difficultyLabels = ['easy', 'medium', 'hard', 'hard'];
        const label = difficultyLabels[difficulty - 1] || 'medium';
        const randomSeed = Math.floor(Math.random() * 100000);

        // Build question history context for dedup
        const history = getQuestionHistory(topic);
        const recentQuestions = history.slice(-5);
        const historyContext = recentQuestions.length > 0
            ? `\nPREVIOUSLY ASKED (DO NOT REPEAT THESE):\n${recentQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}`
            : '';

        // Build player context for adaptive generation
        const playerInfo = playerContext.level
            ? `\nPLAYER CONTEXT: Level ${playerContext.level}, Streak ${playerContext.streak || 0}, Topic Mastery ${playerContext.mastery || 0}%`
            : '';

        // Decide question type — harder difficulties should include more coding
        const shouldBeCoding = (label === 'hard' && Math.random() > 0.4) ||
                               (label === 'medium' && Math.random() > 0.7) ||
                               (label === 'easy' && Math.random() > 0.9);

        const questionType = shouldBeCoding ? 'coding' : 'mcq';

        const prompt = `
            You are a question generation engine for a gamified coding platform.

            STRICT RULES (MUST FOLLOW):
            1. DO NOT repeat questions — each must be completely unique.
            2. DO NOT always set option A as correct. Randomize the correct answer position across A/B/C/D.
            3. The correct answer MUST be placed randomly — NOT always first.
            4. Ensure ONLY ONE correct answer per MCQ.
            5. Questions must be logically correct and technically verified.
            6. Difficulty must match the requested level.
            7. Output MUST follow the exact JSON format below.
            8. Questions should test real coding knowledge, not trivia.

            TOPIC: ${topic}
            DIFFICULTY: ${label}
            QUESTION TYPE TO GENERATE: ${questionType}
            CONTEXT: ${context}
            RANDOM SEED: ${randomSeed} (use this to vary your output)
            ${playerInfo}
            ${historyContext}

            ${questionType === 'mcq' ? `
            OUTPUT FORMAT (STRICT JSON — MCQ):
            {
              "questions": [
                {
                  "type": "mcq",
                  "question": "A clear, specific programming question about ${topic}",
                  "options": {
                    "A": "option text",
                    "B": "option text",
                    "C": "option text",
                    "D": "option text"
                  },
                  "correct_answer": "ONE of A, B, C, or D (RANDOMIZE THIS — do NOT always pick A)",
                  "explanation": "Brief explanation of why the correct answer is right"
                }
              ]
            }` : `
            OUTPUT FORMAT (STRICT JSON — CODING):
            {
              "questions": [
                {
                  "type": "coding",
                  "question": "A clear programming problem statement for ${topic}",
                  "input_format": "describe the input format",
                  "output_format": "describe the expected output format",
                  "constraints": "any constraints on input size or values",
                  "sample_input": "example input",
                  "sample_output": "expected output for the example input",
                  "test_cases": [
                    { "input": "test input 1", "expected_output": "expected output 1" },
                    { "input": "test input 2", "expected_output": "expected output 2" }
                  ],
                  "base_code_python": "# Starter code template in Python\\n",
                  "base_code_js": "// Starter code template in JavaScript\\n",
                  "hint": "A helpful hint without giving away the answer",
                  "difficulty": "${label}"
                }
              ]
            }`}

            VALIDATION BEFORE OUTPUT:
            - Ensure the correct answer is NOT always A — randomize it
            - Ensure the question is UNIQUE and not a repeat
            - Ensure coding questions are solvable at the ${label} level
            - Ensure no placeholder text or generic filler

            NOW GENERATE EXACTLY 1 QUESTION. Return ONLY valid JSON, no markdown or extra text.
        `;

        const resultText = await withRetry(() => askAI(prompt));
        let rawContent = resultText.trim();

        // Robust JSON extraction: Find first '{' and last '}'
        const jsonStart = rawContent.indexOf('{');
        const jsonEnd = rawContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            rawContent = rawContent.substring(jsonStart, jsonEnd + 1);
        }
        
        let content;
        try {
            content = JSON.parse(rawContent);
        } catch (e) {
            console.error('Failed to parse JSON:', rawContent);
            throw new Error('JSON parsing failed');
        }

        if (!content.questions || content.questions.length === 0) {
            throw new Error('No questions returned');
        }

        const q = content.questions[0];
        let formattedQuestion = formatAIQuestion(q, topic, label);

        // Validate
        const errors = formattedQuestion.type === 'coding'
            ? validateCodingQuestion(formattedQuestion)
            : validateMCQ(formattedQuestion);

        if (errors.length > 0) {
            console.warn(`\x1b[33m⚠️  Question validation warnings: ${errors.join(', ')}\x1b[0m`);
            // For MCQ, try to fix common issues
            if (formattedQuestion.type === 'mcq') {
                formattedQuestion = fixMCQIssues(formattedQuestion, topic);
            }
        }

        // Answer position bias prevention (MCQ only)
        if (formattedQuestion.type === 'mcq') {
            const correctIdx = formattedQuestion.options.findIndex(o => o.isCorrect);
            if (needsPositionRebalance(topic, correctIdx)) {
                // Reshuffle to prevent 3+ consecutive same positions
                formattedQuestion.options = rebalanceOptions(formattedQuestion.options, correctIdx, topic);
            }
            const newCorrectIdx = formattedQuestion.options.findIndex(o => o.isCorrect);
            trackAnswerPosition(topic, newCorrectIdx);
        }

        // Track for dedup
        addToQuestionHistory(topic, formattedQuestion.questionText);

        return {
            ...formattedQuestion,
            learningPhase: "Phase 1 - Introduction",
            topic,
            difficulty,
            isAIGenerated: true
        };
    } catch (error) {
        console.error('AI Generation Error:', error);
        // Fallback to mock
        console.log(`\x1b[33m⚠️ AI failed, falling back to mock question for ${topic}\x1b[0m`);
        return generateMockQuestion(topic, difficulty);
    }
};

/**
 * Format an AI-returned question into our internal structure
 */
const formatAIQuestion = (q, topic, label) => {
    if (q.type === 'coding') {
        return {
            type: 'coding',
            questionText: q.question || "Coding Challenge",
            options: [],
            explanation: q.constraints || 'No constraints provided',
            hint: q.hint || null,
            codingDetails: {
                inputFormat: q.input_format,
                outputFormat: q.output_format,
                sampleInput: q.sample_input,
                sampleOutput: q.sample_output,
                constraints: q.constraints,
                baseCode: {
                    python: q.base_code_python || '# Write your solution here\n',
                    javascript: q.base_code_js || '// Write your solution here\n'
                },
                testCases: Array.isArray(q.test_cases) ? q.test_cases.map(tc => ({
                    input: tc.input || tc.sample_input || '',
                    expectedOutput: tc.expected_output || tc.sample_output || '',
                    isHidden: false
                })) : [{
                    input: q.sample_input || '',
                    expectedOutput: q.sample_output || '',
                    isHidden: false
                }]
            }
        };
    }

    // MCQ — parse options and build with randomized correct position
    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const correctLetter = (q.correct_answer || 'A').toUpperCase().trim();
    const correctIndex = letterToIndex[correctLetter] ?? 0;

    const optsArray = [
        { text: q.options?.A || 'Option A', isCorrect: false },
        { text: q.options?.B || 'Option B', isCorrect: false },
        { text: q.options?.C || 'Option C', isCorrect: false },
        { text: q.options?.D || 'Option D', isCorrect: false }
    ];
    optsArray[correctIndex].isCorrect = true;

    // Shuffle the options to randomize position
    shuffleArray(optsArray);

    return {
        type: 'mcq',
        questionText: q.question || "Multiple Choice Question",
        options: optsArray,
        explanation: q.explanation || "No explanation provided",
        hint: null,
    };
};

/**
 * Fix common MCQ issues (ensure exactly 1 correct, etc.)
 */
const fixMCQIssues = (question, topic) => {
    const opts = question.options || [];
    
    // Ensure exactly 1 correct
    const correctCount = opts.filter(o => o.isCorrect).length;
    if (correctCount === 0 && opts.length > 0) {
        // Mark a random one as correct
        opts[Math.floor(Math.random() * opts.length)].isCorrect = true;
    } else if (correctCount > 1) {
        // Keep only the first correct
        let found = false;
        for (const opt of opts) {
            if (opt.isCorrect) {
                if (found) opt.isCorrect = false;
                found = true;
            }
        }
    }

    // Ensure 4 options
    while (opts.length < 4) {
        opts.push({ text: `Alternative ${opts.length + 1}`, isCorrect: false });
    }

    return { ...question, options: opts };
};

/**
 * Rebalance option positions to prevent bias
 */
const rebalanceOptions = (options, currentCorrectIdx, topic) => {
    const lastPositions = getLastPositions(topic);
    const usedPositions = new Set(lastPositions.slice(-2));
    
    // Find a position that hasn't been used recently
    const availablePositions = [0, 1, 2, 3].filter(p => !usedPositions.has(p));
    const targetPosition = availablePositions.length > 0
        ? availablePositions[Math.floor(Math.random() * availablePositions.length)]
        : Math.floor(Math.random() * 4);

    if (targetPosition !== currentCorrectIdx) {
        // Swap the correct answer to the target position
        [options[currentCorrectIdx], options[targetPosition]] = [options[targetPosition], options[currentCorrectIdx]];
    }

    return options;
};

/**
 * Generate a mock question with randomized correct answer position
 */
const generateMockQuestion = (topic, difficulty) => {
    const history = getQuestionHistory(topic);
    const topicKey = topic.toLowerCase().trim();

    // Determine if we should give a coding question based on difficulty
    const difficultyLabels = ['easy', 'medium', 'hard', 'hard'];
    const label = difficultyLabels[difficulty - 1] || 'medium';
    const shouldBeCoding = (label === 'hard' && Math.random() > 0.5) ||
                           (label === 'medium' && Math.random() > 0.8);

    if (shouldBeCoding) {
        const codingQ = pickUnique(MOCK_CODING_QUESTIONS, history);
        addToQuestionHistory(topic, codingQ.questionText);
        return {
            type: 'coding',
            questionText: codingQ.questionText,
            options: [],
            explanation: codingQ.explanation,
            hint: 'Think step by step about what the problem is asking.',
            codingDetails: codingQ.codingDetails,
            learningPhase: "Phase 1 - Introduction",
            topic,
            difficulty,
            isAIGenerated: false
        };
    }

    // MCQ — pick from pool or use generic
    const pool = MOCK_QUESTION_POOLS[topicKey] || MOCK_QUESTION_POOLS.variables;
    const picked = pickUnique(pool, history);

    // Deep clone and shuffle options to randomize correct answer position
    const options = picked.options.map(o => ({ ...o }));
    shuffleArray(options);

    addToQuestionHistory(topic, picked.questionText);
    trackAnswerPosition(topic, options.findIndex(o => o.isCorrect));

    return {
        type: 'mcq',
        questionText: picked.questionText,
        options,
        explanation: picked.explanation,
        hint: null,
        learningPhase: "Phase 1 - Introduction",
        topic,
        difficulty,
        isAIGenerated: false
    };
};

// ──────────────────────────────────────────────
// Hint Generation
// ──────────────────────────────────────────────
const generateHint = async (questionText, level = 1) => {
    if (isAIMock) {
        const mockHints = [
            "Think about the basic definition of the concept. What does the documentation say?",
            "Break the problem into smaller parts. What's the first step?",
            "Consider edge cases — what happens with zero, negative numbers, or empty inputs?"
        ];
        return mockHints[Math.min(level - 1, mockHints.length - 1)];
    }

    const hintLevels = [
        "Give a short, cryptic conceptual nudge. Do NOT give the answer. Make the student think.",
        "Provide a step-by-step logic breakdown without revealing the final answer. Guide their thinking.",
        "Provide the almost-answer with one small step left for the user to figure out."
    ];

    try {
        const prompt = `
            You are a coding mentor in a gamified learning platform.
            ${hintLevels[Math.min(level - 1, hintLevels.length - 1)]}
            
            Question: ${questionText}
            
            Return ONLY the hint text. Keep it under 100 words. Be encouraging but don't give away the answer.
        `;

        const resultText = await withRetry(() => askAI(prompt));
        return resultText.trim();
    } catch (error) {
        return "The spirits of the code are silent... Try breaking the problem into smaller steps.";
    }
};

/**
 * Generate a contextual hint for a specific question (with topic awareness)
 */
const generateHintForQuestion = async (questionText, topic, difficulty = 1, hintLevel = 1) => {
    if (isAIMock) {
        const topicHints = {
            variables: [
                "How do you store and reference data in code? Think about containers.",
                "Consider the difference between mutable and immutable containers.",
                "Almost there! Remember: let = changeable, const = fixed."
            ],
            operators: [
                "Think about the symbols you use to combine or compare values.",
                "JavaScript has both == and ===. When does the type matter?",
                "The + operator behaves differently with strings vs numbers."
            ],
            conditionals: [
                "Your code needs to make decisions. What's the simplest way?",
                "if checks the condition, else handles the alternative. What about multiple conditions?",
                "Remember: switch uses === comparison, not ==."
            ],
            loops: [
                "Sometimes you need to repeat actions. What tells the code when to stop?",
                "Think about: initialization, condition check, and update step.",
                "for loops are great when you know how many times to repeat."
            ],
        };

        const hints = topicHints[topic.toLowerCase()] || [
            "Think about the fundamental concept being tested.",
            "Break the problem down step by step.",
            "You're close! Focus on the specific syntax."
        ];

        return hints[Math.min(hintLevel - 1, hints.length - 1)];
    }

    return generateHint(questionText, hintLevel);
};

// ──────────────────────────────────────────────
// Lesson Generation
// ──────────────────────────────────────────────
const generateLesson = async (topic, difficulty = 1) => {
    if (isAIMock) {
        return {
            title: `The Secret of ${topic}`,
            lore: `Deep within the Forbidden Repository of Git, the elders used ${topic} to master the flow of data.`,
            concept: `In the realm of logic, ${topic} allows you to organize and manipulate energy (data) in powerful patterns.`,
            exampleCode: `// A simple technique\nconst power = "${topic}";\nconsole.log(power);`,
            proTip: `Never forget: ${topic} is most effective when used with clear intent.`,
            topic,
            xpReward: 15
        };
    }
    try {
        const prompt = `
            Act as an RPG Scholar for a coding game. 
            Topic: ${topic}
            
            Create a "Battle Scroll" (Lesson) that teaches this concept.
            
            Return ONLY a JSON object:
            {
                "title": "A short, heroic title",
                "lore": "1-2 sentences of world-building lore relating the concept to magic or engineering",
                "concept": "The core technical explanation (2-3 sentences)",
                "exampleCode": "A 3-5 line code example (Javascript)",
                "proTip": "One high-level advice"
            }
            Make sure to return exactly valid JSON and NO markdown blocks or extra text around it.
        `;

        const resultText = await withRetry(() => askAI(prompt));
        let rawContent = resultText.trim();

        // Robust JSON extraction
        const jsonStart = rawContent.indexOf('{');
        const jsonEnd = rawContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            rawContent = rawContent.substring(jsonStart, jsonEnd + 1);
        }
        
        return {
            ...JSON.parse(rawContent),
            topic,
            xpReward: 15
        };
    } catch (error) {
        console.error('Lesson Generation Error:', error);
        return { title: "Smudged Ink", lore: "The ancient text is too blurry to read...", concept: "Unknown logic.", xpReward: 0 };
    }
};

const simulateAIResponseTime = (difficulty) => {
    const ranges = [
        [8000, 15000],
        [5000, 10000],
        [3000, 7000],
        [2000, 5000]
    ];
    const range = ranges[difficulty - 1] || ranges[1];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
};

module.exports = {
    generateQuestion,
    generateHint,
    generateHintForQuestion,
    generateLesson,
    simulateAIResponseTime,
    clearQuestionHistory
};
