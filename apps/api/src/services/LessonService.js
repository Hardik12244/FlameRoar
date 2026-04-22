const LESSON_ARCS = [
    {
        id: 'lesson_movement_bootstrap',
        chapterNumber: 1,
        chapterTitle: 'The Tutorial',
        title: 'Boot Sequence',
        topic: 'Movement & Exploration',
        mentorNpcId: 'pappa_heroka',
        mentorName: 'Pappa Heroka',
        unlockTokens: [],
        resolvedByTokens: ['tutorial_completed'],
        gateNpcIds: ['Queen'],
        gateNpcName: 'Queen',
        completeXp: 15,
        family: 'movement',
        effects: {
            questFlags: {
                movementUnlocked: true
            },
            completedNpcInteractions: ['pappa_heroka']
        }
    },
    {
        id: 'lesson_variables_foundation',
        chapterNumber: 3,
        chapterTitle: "The Thief's Trial",
        title: 'Naming the Sparks',
        topic: 'Variables & Data Types',
        mentorNpcId: 'pappa_heroka',
        mentorName: 'Pappa Heroka',
        unlockTokens: ['codedex_unlocked'],
        resolvedByTokens: ['medal_identity'],
        gateNpcIds: ['Thief'],
        gateNpcName: 'Thief',
        completeXp: 20,
        family: 'state',
        effects: {
            completedNpcInteractions: ['pappa_heroka']
        }
    },
    {
        id: 'lesson_operator_foundry',
        chapterNumber: 4,
        chapterTitle: 'Operators Mastery',
        title: 'The Operator Foundry',
        topic: 'Operators & Expressions',
        mentorNpcId: 'Alchemist',
        mentorName: 'Alchemist',
        unlockTokens: ['medal_identity'],
        resolvedByTokens: ['medal_logic'],
        gateNpcIds: ['Mountainking'],
        gateNpcName: 'Mountainking',
        completeXp: 25,
        family: 'expression',
        effects: {
            completedNpcInteractions: ['Alchemist']
        }
    },
    {
        id: 'lesson_conditional_pathways',
        chapterNumber: 5,
        chapterTitle: 'Conditional Trials',
        title: 'Pathways of Choice',
        topic: 'Conditionals (If/Else)',
        mentorNpcId: 'Butcher',
        mentorName: 'Butcher',
        unlockTokens: ['medal_logic'],
        resolvedByTokens: ['medal_decision'],
        gateNpcIds: ['Archer'],
        gateNpcName: 'Archer',
        completeXp: 25,
        family: 'branching',
        effects: {
            completedNpcInteractions: ['Butcher']
        }
    },
    {
        id: 'lesson_loop_rhythm',
        chapterNumber: 6,
        chapterTitle: 'The Loop Cathedral',
        title: 'Rhythm of Repetition',
        topic: 'Loops (For/While)',
        mentorNpcId: 'Normalnun',
        mentorName: 'Normalnun',
        unlockTokens: ['medal_decision'],
        resolvedByTokens: ['medal_cycle'],
        gateNpcIds: ['Bishop'],
        gateNpcName: 'Bishop',
        completeXp: 30,
        family: 'iteration',
        effects: {
            completedNpcInteractions: ['Normalnun']
        }
    },
    {
        id: 'lesson_syntax_fusion',
        chapterNumber: 8,
        chapterTitle: 'The Final Trial',
        title: 'Fusion of Syntax',
        topic: 'Composite Syntax',
        mentorNpcId: 'Princess',
        mentorName: 'Princess',
        unlockTokens: ['castle_key'],
        resolvedByTokens: ['map_1_complete'],
        gateNpcIds: ['Mage'],
        gateNpcName: 'Mage',
        completeXp: 35,
        family: 'integration',
        effects: {
            questFlags: {
                princessAudienceGranted: true
            },
            completedNpcInteractions: ['Princess']
        }
    }
];

const MEDAL_TOKEN_BY_LABEL = {
    'Identity Medal': 'medal_identity',
    'Logic Medal': 'medal_logic',
    'Decision Medal': 'medal_decision',
    'Cycle Medal': 'medal_cycle'
};

const FAMILY_BLUEPRINTS = {
    movement: {
        icon: 'Boot',
        storyBeats: [
            'Movement is how heroes expose hidden paths and trigger new story threads.',
            'A prompt is not decoration. It marks where the world wants you to investigate next.',
            'A calm loop of move, observe, and interact keeps your progress intentional.'
        ],
        choicePrompt: 'Which action advances exploration without wasting time?',
        choiceOptions: [
            {
                id: 'follow_prompt',
                text: 'Follow the prompt, reach the guide, then interact.',
                detail: 'Progress comes from acting on the signal the world gives you.',
                isCorrect: true
            },
            {
                id: 'wait',
                text: 'Stand still until the story unlocks itself.',
                detail: 'The world responds to movement and interaction.',
                isCorrect: false
            },
            {
                id: 'spam',
                text: 'Mash every key and hope the gate opens.',
                detail: 'Noise is not the same as control.',
                isCorrect: false
            }
        ],
        predictPrompt: 'Read this field routine. What happens next?',
        predictSnippet: 'Move to the mentor.\nWatch for the interaction prompt.\nPress E beside the mentor.',
        predictOptions: [
            { id: 'unlock', text: 'The next path or briefing unlocks.', isCorrect: true },
            { id: 'reset', text: 'Your progress resets.', isCorrect: false },
            { id: 'nothing', text: 'Nothing changes because movement does not matter.', isCorrect: false }
        ],
        sequencePrompt: 'Build the clean exploration loop.',
        sequenceItems: [
            { id: 'spot', label: 'Spot the prompt or landmark.' },
            { id: 'move', label: 'Move into position.' },
            { id: 'interact', label: 'Interact with the NPC or object.' }
        ],
        prepChecklist: [
            'Watch for prompts near important NPCs.',
            'Move first, then interact with intent.',
            'Use exploration to reveal the next objective.'
        ]
    },
    state: {
        icon: 'Spark',
        storyBeats: [
            'Variables give data a name so you can return to it later.',
            'A value can change, but the name keeps your reasoning stable.',
            'You win faster when you can read, update, and reuse state deliberately.'
        ],
        mentorDialogue: [
            'The Thief steals data by confusing names and values.',
            'To beat them, you must understand how to store, update, and track state.',
            'Let me show you a situation where variables save the day.'
        ],
        scenarioDescription: 'The Thief has scrambled a hero\'s inventory. Three items are stored in variables, but one has been overwritten. You need to figure out what the final values are.',
        scenarioQuestion: 'Can you trace through the changes and predict what each variable holds?',
        choicePrompt: 'Which move best matches variable thinking?',
        choiceOptions: [
            {
                id: 'store_reuse',
                text: 'Store a value in a named place, then reuse it later.',
                detail: 'That is the core move behind variables.',
                isCorrect: true
            },
            {
                id: 'guess',
                text: 'Guess the value each time without storing it.',
                detail: 'That makes logic brittle and hard to trace.',
                isCorrect: false
            },
            {
                id: 'erase',
                text: 'Rename every value after every step.',
                detail: 'That hides the meaning instead of clarifying it.',
                isCorrect: false
            }
        ],
        predictPrompt: 'Trace through this code. What does it print?',
        predictSnippet: 'let ember = 2;\nember = ember + 3;\nconsole.log(ember);',
        predictLanguage: 'javascript',
        predictOptions: [
            { id: 'five', text: '5', isCorrect: true },
            { id: 'two', text: '2', isCorrect: false },
            { id: 'twenty_three', text: '23', isCorrect: false }
        ],
        traceSteps: [
            { line: 1, vars: { ember: 2 }, note: 'ember is created and set to 2' },
            { line: 2, vars: { ember: 5 }, note: 'ember is updated: 2 + 3 = 5' },
            { line: 3, vars: { ember: 5 }, note: 'console.log prints: 5' }
        ],
        sandboxChallenge: {
            prompt: 'Create two variables: "health" set to 100 and "damage" set to 35. Then print health minus damage.',
            starterCode: '// Create your variables below\n\n\n// Print the result\nconsole.log(health - damage);',
            expectedOutput: '65',
            language: 'javascript',
            hint: 'Use let to declare variables. Set health = 100 and damage = 35.',
            successText: 'You stored values and computed the result. That is variable thinking in action.'
        },
        debugChallenge: {
            prompt: 'This code should print 10, but it prints something wrong. Find and fix the bug.',
            buggyCode: 'let score = 5;\nlet bonus = 5;\nlet total = score + bnus;\nconsole.log(total);',
            expectedOutput: '10',
            language: 'javascript',
            bugHint: 'Check the variable names carefully. Is every name spelled correctly?',
            successText: 'Typos in variable names are the most common bug. You caught it.'
        },
        sequencePrompt: 'Choose the order for working with a variable.',
        sequenceItems: [
            { id: 'name', label: 'Name the value clearly.' },
            { id: 'set', label: 'Set the starting value.' },
            { id: 'use', label: 'Read or update it when the logic needs it.' }
        ],
        prepChecklist: [
            'Know what each value represents.',
            'Track how values change between steps.',
            'Read the current value before deciding what happens next.'
        ],
        keyTakeaway: 'Variables are containers with names. Store, update, and reuse them to control your logic.'
    },
    expression: {
        icon: 'Anvil',
        storyBeats: [
            'Operators are the verbs of code. They combine, compare, and transform values.',
            'An expression is a small machine that turns input into a result.',
            'Before a boss asks for logic, you need to trust how the symbols behave.'
        ],
        mentorDialogue: [
            'The Mountain King speaks in riddles made of operators.',
            'If you cannot evaluate an expression quickly, his puzzles will crush you.',
            'Let me train your eyes to read expressions like a warrior reads terrain.'
        ],
        scenarioDescription: 'The Mountain King challenges you with a locked gate. The combination is a math expression. You must evaluate it correctly to pass.',
        scenarioQuestion: 'Can you work through the expression step by step?',
        choicePrompt: 'What is the real job of an operator?',
        choiceOptions: [
            {
                id: 'combine_compare',
                text: 'Combine or compare values to produce a result.',
                detail: 'That is how expressions become useful decisions.',
                isCorrect: true
            },
            {
                id: 'rename_only',
                text: 'Rename every variable in the program.',
                detail: 'Naming belongs to variables, not operators.',
                isCorrect: false
            },
            {
                id: 'pause',
                text: 'Pause the program until the player reacts.',
                detail: 'Operators evaluate data. They do not control time.',
                isCorrect: false
            }
        ],
        predictPrompt: 'Evaluate this expression. What does it print?',
        predictSnippet: 'const total = 3 * 2 + 1;\nconsole.log(total);',
        predictLanguage: 'javascript',
        predictOptions: [
            { id: 'seven', text: '7', isCorrect: true },
            { id: 'nine', text: '9', isCorrect: false },
            { id: 'six', text: '6', isCorrect: false }
        ],
        traceSteps: [
            { line: 1, vars: { total: '?' }, note: 'Evaluate: 3 * 2 = 6, then 6 + 1 = 7' },
            { line: 1, vars: { total: 7 }, note: 'total is set to 7' },
            { line: 2, vars: { total: 7 }, note: 'console.log prints: 7' }
        ],
        sandboxChallenge: {
            prompt: 'Calculate the area of a rectangle with width 8 and height 5. Print the result.',
            starterCode: '// Calculate the area (width * height)\nlet width = 8;\nlet height = 5;\n\n// Print the area below\n',
            expectedOutput: '40',
            language: 'javascript',
            hint: 'Multiply width by height and use console.log to print.',
            successText: 'You used the multiplication operator to solve a real problem. Operators are your tools.'
        },
        debugChallenge: {
            prompt: 'This code should check if 15 is greater than 10 and print true. But it prints the wrong thing.',
            buggyCode: 'let a = 15;\nlet b = 10;\nconsole.log(a < b);',
            expectedOutput: 'true',
            language: 'javascript',
            bugHint: 'Look at the comparison operator. Does < mean "greater than"?',
            successText: 'Mixing up < and > is a classic. Your eyes are getting sharper.'
        },
        sequencePrompt: 'How do you work through an expression cleanly?',
        sequenceItems: [
            { id: 'identify', label: 'Identify the operators in play.' },
            { id: 'evaluate', label: 'Evaluate them in the correct order.' },
            { id: 'compare', label: 'Use the result for the next decision.' }
        ],
        prepChecklist: [
            'Know whether you are combining or comparing.',
            'Watch evaluation order before trusting the result.',
            'Use the result to feed the next decision.'
        ],
        keyTakeaway: 'Operators transform and compare values. Master their order and you control the outcome.'
    },
    branching: {
        icon: 'Branch',
        storyBeats: [
            'Conditionals decide which path the program follows next.',
            'A true condition opens one branch. A false condition sends you somewhere else.',
            'Strong programmers test the rule first, then predict both outcomes.'
        ],
        mentorDialogue: [
            'The Archer never fires blindly. Every arrow follows a condition.',
            'if the target is close, use a short bow. else, use a long bow.',
            'Your code must make the same kind of decision. Let me show you.'
        ],
        scenarioDescription: 'The Archer guards a fork in the road. One path is safe, the other is trapped. A sign shows a condition — only the branch that evaluates to true is safe.',
        scenarioQuestion: 'Can you read the condition and pick the safe path?',
        choicePrompt: 'Which description fits a conditional?',
        choiceOptions: [
            {
                id: 'branch_rule',
                text: 'A rule that sends execution down different paths.',
                detail: 'That is the heart of branching logic.',
                isCorrect: true
            },
            {
                id: 'repeat_rule',
                text: 'A loop that repeats forever.',
                detail: 'That is repetition, not branching.',
                isCorrect: false
            },
            {
                id: 'storage_rule',
                text: 'A container that stores a value.',
                detail: 'That is variable behavior, not a conditional.',
                isCorrect: false
            }
        ],
        predictPrompt: 'Read this code. Which branch runs?',
        predictSnippet: 'const energy = 4;\nif (energy > 3) {\n  console.log("Go");\n} else {\n  console.log("Wait");\n}',
        predictLanguage: 'javascript',
        predictOptions: [
            { id: 'go', text: 'Go', isCorrect: true },
            { id: 'wait', text: 'Wait', isCorrect: false },
            { id: 'both', text: 'Both lines print', isCorrect: false }
        ],
        traceSteps: [
            { line: 1, vars: { energy: 4 }, note: 'energy is set to 4' },
            { line: 2, vars: { energy: 4 }, note: 'Check: is 4 > 3? YES → enter the if block' },
            { line: 3, vars: { energy: 4 }, note: 'Prints: "Go"' }
        ],
        sandboxChallenge: {
            prompt: 'Write code that checks if a player\'s health is above 50. If yes, print "Fight". Otherwise, print "Retreat".',
            starterCode: 'let health = 75;\n\n// Write your if/else below\n',
            expectedOutput: 'Fight',
            language: 'javascript',
            hint: 'Use if (health > 50) { ... } else { ... } with console.log inside each branch.',
            successText: 'Your code makes a decision based on data. That is conditional thinking.'
        },
        debugChallenge: {
            prompt: 'This code should print "Adult" when age is 20, but it prints "Minor" instead. Fix it.',
            buggyCode: 'let age = 20;\nif (age < 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}',
            expectedOutput: 'Adult',
            language: 'javascript',
            bugHint: 'The messages are in the wrong branches. Which block runs when age >= 18?',
            successText: 'Swapped branches are sneaky bugs. You just learned to trace before trusting.'
        },
        sequencePrompt: 'Build the branching routine.',
        sequenceItems: [
            { id: 'read', label: 'Read the current state.' },
            { id: 'test', label: 'Test the condition.' },
            { id: 'branch', label: 'Follow the branch that matches.' }
        ],
        prepChecklist: [
            'Read the condition carefully.',
            'Predict both branches before choosing one.',
            'Remember that only one matching branch runs.'
        ],
        keyTakeaway: 'Conditionals steer your code. Test the condition, predict both outcomes, then trust the branch.'
    },
    iteration: {
        icon: 'Loop',
        storyBeats: [
            'Loops repeat a controlled action until the stop rule says otherwise.',
            'Good loop thinking always tracks start, stop, and update.',
            'If you cannot name the repeated step, the loop will feel chaotic.'
        ],
        mentorDialogue: [
            'The Bishop recites prayers in loops. For-loops, while-loops, infinite loops.',
            'If you cannot control repetition, his Cathedral will trap you forever.',
            'Let me teach you the rhythm: start, check, act, update, repeat.'
        ],
        scenarioDescription: 'The Bishop\'s Cathedral has 5 locked doors in a row. Each door opens when you ring a bell numbered 0 through 4. You need to ring them in order, automatically.',
        scenarioQuestion: 'How would you write a pattern that repeats an action exactly 5 times?',
        choicePrompt: 'What makes a loop healthy?',
        choiceOptions: [
            {
                id: 'clear_repeat',
                text: 'A clear repeated step with a visible stopping rule.',
                detail: 'That is how loops stay useful instead of endless.',
                isCorrect: true
            },
            {
                id: 'random_repeat',
                text: 'Repeat at random and hope it ends soon.',
                detail: 'That produces confusion, not control.',
                isCorrect: false
            },
            {
                id: 'no_change',
                text: 'Never update the loop state.',
                detail: 'Without an update, the exit condition cannot progress.',
                isCorrect: false
            }
        ],
        predictPrompt: 'Trace this loop. What does it print?',
        predictSnippet: 'let out = [];\nfor (let i = 0; i < 3; i += 1) {\n  out.push(i);\n}\nconsole.log(out.join(" "));',
        predictLanguage: 'javascript',
        predictOptions: [
            { id: '012', text: '0 1 2', isCorrect: true },
            { id: '123', text: '1 2 3', isCorrect: false },
            { id: '000', text: '0 0 0', isCorrect: false }
        ],
        traceSteps: [
            { line: 1, vars: { out: '[]', i: '—' }, note: 'out starts as an empty array' },
            { line: 2, vars: { out: '[]', i: 0 }, note: 'i starts at 0. Is 0 < 3? YES' },
            { line: 3, vars: { out: '[0]', i: 0 }, note: 'Push 0 into out' },
            { line: 2, vars: { out: '[0]', i: 1 }, note: 'i becomes 1. Is 1 < 3? YES' },
            { line: 3, vars: { out: '[0, 1]', i: 1 }, note: 'Push 1 into out' },
            { line: 2, vars: { out: '[0, 1]', i: 2 }, note: 'i becomes 2. Is 2 < 3? YES' },
            { line: 3, vars: { out: '[0, 1, 2]', i: 2 }, note: 'Push 2 into out' },
            { line: 2, vars: { out: '[0, 1, 2]', i: 3 }, note: 'i becomes 3. Is 3 < 3? NO → exit loop' },
            { line: 5, vars: { out: '[0, 1, 2]' }, note: 'Prints: "0 1 2"' }
        ],
        sandboxChallenge: {
            prompt: 'Use a for loop to print the numbers 1 through 5, separated by spaces.',
            starterCode: '// Print numbers 1 to 5 using a for loop\nlet result = [];\n\n// Write your loop below\n\n\nconsole.log(result.join(" "));',
            expectedOutput: '1 2 3 4 5',
            language: 'javascript',
            hint: 'for (let i = 1; i <= 5; i++) { result.push(i); }',
            successText: 'You wrote a loop that repeats exactly 5 times. The Bishop would be impressed.'
        },
        debugChallenge: {
            prompt: 'This loop should print "0 1 2 3 4" but it runs forever. Fix the bug.',
            buggyCode: 'let result = [];\nfor (let i = 0; i < 5; ) {\n  result.push(i);\n}\nconsole.log(result.join(" "));',
            expectedOutput: '0 1 2 3 4',
            language: 'javascript',
            bugHint: 'The loop counter never changes. What is missing from the for statement?',
            successText: 'A loop without an update runs forever. You just saved the program from an infinite trap.'
        },
        sequencePrompt: 'Assemble the loop rhythm.',
        sequenceItems: [
            { id: 'start', label: 'Set the starting state.' },
            { id: 'check', label: 'Check whether the loop should continue.' },
            { id: 'update', label: 'Update the state for the next pass.' }
        ],
        prepChecklist: [
            'Know the repeated action.',
            'Track the value that changes every pass.',
            'Name the condition that ends the loop.'
        ],
        keyTakeaway: 'Loops repeat controlled actions. Always know: what starts, what checks, and what updates.'
    },
    integration: {
        icon: 'Crown',
        storyBeats: [
            'Composite syntax is not a new spell. It is several basic moves working together cleanly.',
            'Variables hold state, operators transform it, conditionals steer it, and loops scale it.',
            'The final battle tests orchestration, not isolated trivia.'
        ],
        mentorDialogue: [
            'The Mage combines every trick you have faced into one assault.',
            'Variables, operators, conditions, loops — all at once.',
            'Your weapon is composition. Let me show you how the pieces connect.'
        ],
        scenarioDescription: 'The Mage has encrypted a message. To decode it, you need a loop that checks each character, transforms it with an operator, and stores the result in a variable.',
        scenarioQuestion: 'Can you combine all your skills — variables, operators, conditionals, and loops — into one solution?',
        choicePrompt: 'What does syntax fusion really test?',
        choiceOptions: [
            {
                id: 'combine_tools',
                text: 'How several basic tools work together to solve one problem.',
                detail: 'Integration is about composition, not memorizing isolated facts.',
                isCorrect: true
            },
            {
                id: 'single_fact',
                text: 'One disconnected syntax fact at a time.',
                detail: 'That misses the point of the final trial.',
                isCorrect: false
            },
            {
                id: 'ui_only',
                text: 'Only how the interface looks on screen.',
                detail: 'The challenge is logic and composition, not decoration.',
                isCorrect: false
            }
        ],
        predictPrompt: 'This code combines a loop and a conditional. What does it print?',
        predictSnippet: 'let total = 0;\nfor (let i = 1; i <= 4; i += 1) {\n  if (i % 2 === 0) total += i;\n}\nconsole.log(total);',
        predictLanguage: 'javascript',
        predictOptions: [
            { id: 'six', text: '6', isCorrect: true },
            { id: 'ten', text: '10', isCorrect: false },
            { id: 'four', text: '4', isCorrect: false }
        ],
        traceSteps: [
            { line: 1, vars: { total: 0 }, note: 'total starts at 0' },
            { line: 2, vars: { total: 0, i: 1 }, note: 'i=1. Is 1 <= 4? YES' },
            { line: 3, vars: { total: 0, i: 1 }, note: '1 % 2 = 1 (odd). Skip.' },
            { line: 2, vars: { total: 0, i: 2 }, note: 'i=2. Is 2 <= 4? YES' },
            { line: 3, vars: { total: 2, i: 2 }, note: '2 % 2 = 0 (even). total += 2 → total = 2' },
            { line: 2, vars: { total: 2, i: 3 }, note: 'i=3. Is 3 <= 4? YES' },
            { line: 3, vars: { total: 2, i: 3 }, note: '3 % 2 = 1 (odd). Skip.' },
            { line: 2, vars: { total: 2, i: 4 }, note: 'i=4. Is 4 <= 4? YES' },
            { line: 3, vars: { total: 6, i: 4 }, note: '4 % 2 = 0 (even). total += 4 → total = 6' },
            { line: 5, vars: { total: 6 }, note: 'Prints: 6' }
        ],
        sandboxChallenge: {
            prompt: 'Count how many numbers from 1 to 10 are greater than 5. Print the count.',
            starterCode: '// Count numbers from 1 to 10 that are greater than 5\nlet count = 0;\n\n// Write your loop + conditional below\n\n\nconsole.log(count);',
            expectedOutput: '5',
            language: 'javascript',
            hint: 'Loop from 1 to 10. Inside the loop, use if (i > 5) to increment count.',
            successText: 'You combined a loop, a conditional, and a variable. That is integration.'
        },
        debugChallenge: {
            prompt: 'This code should sum all odd numbers from 1 to 5 (1+3+5=9). But it gives the wrong answer.',
            buggyCode: 'let sum = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i % 2 === 0) sum += i;\n}\nconsole.log(sum);',
            expectedOutput: '9',
            language: 'javascript',
            bugHint: 'The condition checks for even numbers. What should it check for odd numbers?',
            successText: 'Even vs odd — one operator flip changes everything. Your debugging instinct is sharp.'
        },
        sequencePrompt: 'Build the final problem-solving flow.',
        sequenceItems: [
            { id: 'state', label: 'Track state with variables.' },
            { id: 'transform', label: 'Transform values with expressions.' },
            { id: 'decide', label: 'Use conditions to steer the flow.' }
        ],
        prepChecklist: [
            'Combine simple tools instead of searching for one giant trick.',
            'Track state changes across the whole solution.',
            'Think in small steps, then chain them together.'
        ],
        keyTakeaway: 'The Mage uses every concept at once. Your power is composition — chaining small, correct moves.'
    },
    default: {
        icon: 'Book',
        storyBeats: [
            'Every lesson starts by naming the purpose of the concept.',
            'Then you test what changes when the concept is applied.',
            'Finally, you rehearse the move you will need in the next challenge.'
        ],
        choicePrompt: 'What is the safest way to learn a new concept?',
        choiceOptions: [
            {
                id: 'purpose',
                text: 'Understand the purpose, then practice the move.',
                detail: 'Purpose and repetition build stable intuition.',
                isCorrect: true
            },
            {
                id: 'memorize',
                text: 'Memorize one sentence and stop there.',
                detail: 'Static recall collapses under pressure.',
                isCorrect: false
            },
            {
                id: 'guess',
                text: 'Skip understanding and guess during battle.',
                detail: 'That turns every challenge into panic.',
                isCorrect: false
            }
        ],
        predictPrompt: 'What should happen next?',
        predictSnippet: 'Read the rule.\nApply the rule.\nCheck the result.',
        predictOptions: [
            { id: 'result', text: 'You get a predictable result.', isCorrect: true },
            { id: 'crash', text: 'The lesson always crashes.', isCorrect: false },
            { id: 'freeze', text: 'Nothing changes.', isCorrect: false }
        ],
        sequencePrompt: 'Set the learning loop.',
        sequenceItems: [
            { id: 'observe', label: 'Observe the pattern.' },
            { id: 'practice', label: 'Practice the move.' },
            { id: 'prepare', label: 'Use it in the next challenge.' }
        ],
        prepChecklist: [
            'Name the idea clearly.',
            'Practice one concrete move.',
            'Enter the next challenge with intent.'
        ]
    }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const addUnique = (list, value) => {
    if (value && !list.includes(value)) {
        list.push(value);
    }
};

const ensureLessonProgressDefaults = (user) => {
    if (!user.lessonProgress || typeof user.lessonProgress !== 'object' || Array.isArray(user.lessonProgress)) {
        user.lessonProgress = {};
    }

    user.lessonProgress.completedLessonIds = ensureArray(user.lessonProgress.completedLessonIds);
    user.lessonProgress.skippedLessonIds = ensureArray(user.lessonProgress.skippedLessonIds);
    user.lessonProgress.lastLessonId = user.lessonProgress.lastLessonId || null;
    user.lessonProgress.lastResolution = user.lessonProgress.lastResolution || null;

    return user.lessonProgress;
};

const buildProgressTokens = (user) => {
    const tokens = new Set();
    if (!user) {
        return tokens;
    }

    const questFlags = user.questFlags || {};
    if (questFlags.movementUnlocked) tokens.add('tutorial_completed');
    if (questFlags.codeDexUnlocked) tokens.add('codedex_unlocked');
    if (questFlags.kingGateCleared) tokens.add('castle_key');
    if (questFlags.princessAudienceGranted) tokens.add('princess_audience');
    if (questFlags.syntaxProvinceCompleted) tokens.add('map_1_complete');

    ensureArray(user.medalsCount).forEach((label) => {
        if (MEDAL_TOKEN_BY_LABEL[label]) {
            tokens.add(MEDAL_TOKEN_BY_LABEL[label]);
        }
    });

    return tokens;
};

const findLessonArc = (lessonId) => LESSON_ARCS.find((arc) => arc.id === lessonId) || null;

const isLessonUnlocked = (arc, tokens) => arc.unlockTokens.every((token) => tokens.has(token));

const isLessonResolved = (user, arc, tokens = buildProgressTokens(user)) => {
    const lessonProgress = ensureLessonProgressDefaults(user);
    const explicitCompletion = lessonProgress.completedLessonIds.includes(arc.id) || lessonProgress.skippedLessonIds.includes(arc.id);
    const tokenResolution = arc.resolvedByTokens.some((token) => tokens.has(token));
    return explicitCompletion || tokenResolution;
};

const getCurrentLessonArc = (user) => {
    const tokens = buildProgressTokens(user);
    ensureLessonProgressDefaults(user);

    return LESSON_ARCS.find((arc) => isLessonUnlocked(arc, tokens) && !isLessonResolved(user, arc, tokens)) || null;
};

const getFamilyBlueprint = (arc) => FAMILY_BLUEPRINTS[arc.family] || FAMILY_BLUEPRINTS.default;

const buildLessonPreview = (arc) => ({
    id: arc.id,
    chapterNumber: arc.chapterNumber,
    chapterTitle: arc.chapterTitle,
    title: arc.title,
    topic: arc.topic,
    mentorNpcId: arc.mentorNpcId,
    mentorName: arc.mentorName,
    gateNpcIds: arc.gateNpcIds,
    gateNpcName: arc.gateNpcName,
    objective: `Return to ${arc.mentorName} and train ${arc.topic} before challenging ${arc.gateNpcName}.`,
    reminderText: `${arc.mentorName} has the next lesson ready. Complete it or skip it before pushing forward.`,
    introDialogue: [
        `${arc.mentorName}: Before you face ${arc.gateNpcName}, train your ${arc.topic.toLowerCase()} instincts with me.`,
        `${arc.mentorName}: We will learn it in motion, then you can walk into the next challenge prepared.`
    ],
    blockMessage: `${arc.gateNpcName} will not open yet. ${arc.mentorName} is waiting to train you in ${arc.topic}.`,
    icon: getFamilyBlueprint(arc).icon
});

const buildLessonState = (user) => {
    const lessonProgress = ensureLessonProgressDefaults(user);
    const currentLesson = getCurrentLessonArc(user);

    if (!currentLesson) {
        return {
            status: 'clear',
            needsMentorVisit: false,
            completedLessonIds: lessonProgress.completedLessonIds,
            skippedLessonIds: lessonProgress.skippedLessonIds,
            currentLesson: null,
            blockedNpcIds: []
        };
    }

    const preview = buildLessonPreview(currentLesson);

    return {
        status: 'lesson_available',
        needsMentorVisit: true,
        mentorNpcId: currentLesson.mentorNpcId,
        completedLessonIds: lessonProgress.completedLessonIds,
        skippedLessonIds: lessonProgress.skippedLessonIds,
        blockedNpcIds: currentLesson.gateNpcIds,
        currentLesson: preview
    };
};

const getLessonBlockForNpc = (user, npcId) => {
    const activeLesson = getCurrentLessonArc(user);
    if (!activeLesson || !activeLesson.gateNpcIds.includes(npcId)) {
        return null;
    }

    return buildLessonPreview(activeLesson);
};

const buildInteractiveLesson = (arc) => {
    const blueprint = getFamilyBlueprint(arc);
    const preview = buildLessonPreview(arc);

    // Build scenario-driven steps that teach through active problem-solving
    const steps = [];

    // Step 1: Scenario Briefing — NPC presents a PROBLEM, not definitions
    steps.push({
        id: `${arc.id}_scenario`,
        type: 'scenario',
        title: `${arc.mentorName}'s Briefing`,
        prompt: blueprint.scenarioPrompt || `${arc.mentorName} presents a real situation involving ${arc.topic}.`,
        mentorDialogue: blueprint.mentorDialogue || [
            `Before you face ${arc.gateNpcName}, let me show you something.`,
            `${arc.topic} is not about memorizing rules. It is about solving problems.`,
            `Let me walk you through a real situation.`
        ],
        scenarioDescription: blueprint.scenarioDescription || `You encounter a problem that requires ${arc.topic.toLowerCase()}.`,
        scenarioQuestion: blueprint.scenarioQuestion || `How would you approach this?`,
        successText: `Good. You understand the problem. Now let us learn how to solve it.`
    });

    // Step 2: Choice — Scenario-driven decision with consequence
    steps.push({
        id: `${arc.id}_choice`,
        type: 'choice',
        title: 'Pick the Right Move',
        prompt: blueprint.choicePrompt,
        options: blueprint.choiceOptions,
        successText: `Good. That is the practical shape of ${arc.topic}.`
    });

    // Step 3: Predict — Trace through code and predict the output
    steps.push({
        id: `${arc.id}_predict`,
        type: 'predict',
        title: 'Read the Signal',
        prompt: blueprint.predictPrompt,
        snippet: blueprint.predictSnippet,
        options: blueprint.predictOptions,
        codeLanguage: blueprint.predictLanguage || 'javascript',
        traceSteps: blueprint.traceSteps || null,
        successText: `You are reading the flow correctly now.`
    });

    // Step 4: Sandbox — Write or modify real code
    if (blueprint.sandboxChallenge) {
        steps.push({
            id: `${arc.id}_sandbox`,
            type: 'sandbox',
            title: 'Write the Code',
            prompt: blueprint.sandboxChallenge.prompt,
            starterCode: blueprint.sandboxChallenge.starterCode || '',
            expectedOutput: blueprint.sandboxChallenge.expectedOutput || '',
            stdin: blueprint.sandboxChallenge.stdin || '',
            language: blueprint.sandboxChallenge.language || 'javascript',
            hint: blueprint.sandboxChallenge.hint || null,
            successText: blueprint.sandboxChallenge.successText || `Your code works. That is how ${arc.topic.toLowerCase()} translates into action.`
        });
    }

    // Step 5: Debug — Find and fix the bug
    if (blueprint.debugChallenge) {
        steps.push({
            id: `${arc.id}_debug`,
            type: 'debug',
            title: 'Fix the Bug',
            prompt: blueprint.debugChallenge.prompt,
            buggyCode: blueprint.debugChallenge.buggyCode || '',
            expectedOutput: blueprint.debugChallenge.expectedOutput || '',
            stdin: blueprint.debugChallenge.stdin || '',
            language: blueprint.debugChallenge.language || 'javascript',
            bugHint: blueprint.debugChallenge.bugHint || null,
            successText: blueprint.debugChallenge.successText || `Bug squashed. Debugging is half the battle.`
        });
    }

    // Step 6: Battle Prep — Review + confidence check
    steps.push({
        id: `${arc.id}_checkpoint`,
        type: 'checkpoint',
        title: 'Battle Prep',
        prompt: `Lock in the essentials before you return to ${arc.gateNpcName}.`,
        checklist: blueprint.prepChecklist,
        keyTakeaway: blueprint.keyTakeaway || `You now know enough to handle ${arc.topic.toLowerCase()} under pressure.`,
        successText: `${arc.gateNpcName} is no longer just a wall. You have a plan.`
    });

    return {
        id: arc.id,
        mode: 'mentor_journey',
        chapterNumber: arc.chapterNumber,
        chapterTitle: arc.chapterTitle,
        title: arc.title,
        topic: arc.topic,
        mentor: {
            npcId: arc.mentorNpcId,
            name: arc.mentorName,
            role: 'mentor'
        },
        upcomingChallenge: {
            npcId: arc.gateNpcIds[0],
            name: arc.gateNpcName,
            topic: arc.topic
        },
        canSkip: true,
        skipLabel: "I'll Skip This Lesson",
        skipSummary: `You can skip and continue, but ${arc.gateNpcName} will test ${arc.topic.toLowerCase()} immediately.`,
        completionReward: {
            xp: arc.completeXp
        },
        objective: preview.objective,
        steps
    };
};

const applyLessonEffects = (user, arc) => {
    const effects = arc.effects || {};

    if (!user.questFlags || typeof user.questFlags !== 'object') {
        user.questFlags = {};
    }

    Object.entries(effects.questFlags || {}).forEach(([key, value]) => {
        user.questFlags[key] = value;
    });

    if (!Array.isArray(user.completedNpcInteractions)) {
        user.completedNpcInteractions = [];
    }

    ensureArray(effects.completedNpcInteractions).forEach((npcId) => {
        addUnique(user.completedNpcInteractions, npcId);
    });
};

const resolveLesson = (user, lessonId, action = 'complete') => {
    const arc = findLessonArc(lessonId);
    if (!arc) {
        throw new Error('Lesson not found');
    }

    const tokens = buildProgressTokens(user);
    if (!isLessonUnlocked(arc, tokens) && !isLessonResolved(user, arc, tokens)) {
        throw new Error('Lesson is not unlocked yet');
    }

    const lessonProgress = ensureLessonProgressDefaults(user);
    lessonProgress.completedLessonIds = ensureArray(lessonProgress.completedLessonIds);
    lessonProgress.skippedLessonIds = ensureArray(lessonProgress.skippedLessonIds);

    lessonProgress.completedLessonIds = lessonProgress.completedLessonIds.filter((id) => id !== arc.id);
    lessonProgress.skippedLessonIds = lessonProgress.skippedLessonIds.filter((id) => id !== arc.id);

    if (action === 'skip') {
        lessonProgress.skippedLessonIds.push(arc.id);
    } else {
        lessonProgress.completedLessonIds.push(arc.id);
    }

    lessonProgress.lastLessonId = arc.id;
    lessonProgress.lastResolution = action;

    applyLessonEffects(user, arc);

    if (action === 'complete') {
        if (!Array.isArray(user.learnedTopics)) {
            user.learnedTopics = [];
        }
        addUnique(user.learnedTopics, arc.topic);
        user.xp = Number(user.xp || 0) + Number(arc.completeXp || 0);
    }

    return {
        lesson: buildLessonPreview(arc),
        reward: {
            xp: action === 'complete' ? Number(arc.completeXp || 0) : 0
        }
    };
};

const getLessonOfferForNpc = (user, npcId) => {
    const activeLesson = getCurrentLessonArc(user);
    if (!activeLesson || activeLesson.mentorNpcId !== npcId) {
        return null;
    }

    return buildInteractiveLesson(activeLesson);
};

module.exports = {
    LESSON_ARCS,
    ensureLessonProgressDefaults,
    buildProgressTokens,
    buildLessonState,
    getCurrentLessonArc,
    getLessonBlockForNpc,
    getLessonOfferForNpc,
    resolveLesson
};
