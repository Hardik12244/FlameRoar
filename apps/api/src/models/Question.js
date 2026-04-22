const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['mcq', 'coding'],
        default: 'mcq',
        required: true
    },
    topic: {
        type: String,
        required: true,
        index: true
    },
    difficulty: {
        type: Number, // 1: Easy, 2: Medium, 3: Hard, 4: Boss
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    codingDetails: {
        inputFormat: String,
        outputFormat: String,
        sampleInput: String,
        sampleOutput: String,
        baseCode: {
            type: Map,
            of: String // e.g., { python: "def solve(arr):...", javascript: "function solve(arr) {...}" }
        },
        testCases: [{
            input: String,
            expectedOutput: String,
            isHidden: Boolean
        }]
    },
    explanation: String,
    learningPhase: String,
    isAIGenerated: {
        type: Boolean,
        default: false
    },
    tags: [String],
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
