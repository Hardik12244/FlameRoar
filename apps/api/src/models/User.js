const mongoose = require('mongoose');

const unlockedRegionsSchema = new mongoose.Schema({
    academy: {
        type: Boolean,
        default: true
    },
    outlawTrail: {
        type: Boolean,
        default: false
    },
    crossroads: {
        type: Boolean,
        default: false
    },
    ridge: {
        type: Boolean,
        default: false
    },
    cathedral: {
        type: Boolean,
        default: false
    },
    royalGate: {
        type: Boolean,
        default: false
    },
    finalArena: {
        type: Boolean,
        default: false
    },
    map2Unlocked: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const questFlagsSchema = new mongoose.Schema({
    movementUnlocked: {
        type: Boolean,
        default: false
    },
    codeDexUnlocked: {
        type: Boolean,
        default: false
    },
    kingGateCleared: {
        type: Boolean,
        default: false
    },
    princessAudienceGranted: {
        type: Boolean,
        default: false
    },
    syntaxProvinceCompleted: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const lessonProgressSchema = new mongoose.Schema({
    completedLessonIds: {
        type: [String],
        default: []
    },
    skippedLessonIds: {
        type: [String],
        default: []
    },
    lastLessonId: {
        type: String,
        default: null
    },
    lastResolution: {
        type: String,
        default: null
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: String,
    email: String,
    
    // Core RPG Stats
    class: {
        type: String,
        enum: ['Array Knight', 'Recursion Mage', 'Graph Assassin', 'Pointer Paladin'],
        required: true
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    focusEnergy: {
        type: Number,
        default: 100,
        max: 1000
    },
    playerSpeed: {
        type: Number,
        default: 1.0,
        max: 3.0
    },
    streak: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },

    // Mastery & World Progress
    currentRegion: {
        type: String,
        default: 'Academy'
    },
    unlockedRegions: {
        type: unlockedRegionsSchema,
        default: () => ({})
    },
    exploredTiles: {
        type: [String], // Array of tile keys like "x,y" to represent fog of knowledge clearing
        default: []
    },
    bossesDefeated: {
        type: [String],
        default: []
    },
    completedNpcInteractions: {
        type: [String],
        default: []
    },
    npcFailureCounts: {
        type: Object,
        default: {}
    },
    medalsCount: {
        type: [String],
        default: []
    },
    skillDex: {
        type: [String],
        default: []
    },
    collegeID: {
        type: String,
        trim: true,
        index: true
    },
    questFlags: {
        type: questFlagsSchema,
        default: () => ({})
    },
    lessonProgress: {
        type: lessonProgressSchema,
        default: () => ({})
    },
    activeCompanions: {
        type: [String], // 'Papa', 'Queen', 'Princess', 'Shadow Rival'
        default: []
    },
    titles: {
        type: [String],
        default: ['Rookie Coder']
    },
    activeTitle: {
        type: String,
        default: 'Rookie Coder'
    },

    mastery: {
        type: Map,
        of: Number, // Percentage 0-100
        default: {}
    },

    // Leaderboard Specific Stats
    questionsSolved: {
        type: Number,
        default: 0
    },
    questionsAttempted: {
        type: Number,
        default: 0
    },

    // Inventory & Economy
    coins: {
        type: Number,
        default: 50
    },
    learnedTopics: [{ type: String }], // List of topics they've studied
    inventory: [{
        itemType: {
            type: String,
            enum: ['Hint Potion', 'Topic Revealer', 'Hint Revealer', 'XP Multiplier Crystal', 'Luck Charm', 'Health Potion', 'Speed Token', 'Focus Refill', 'Boss Key', 'Region Map Fragment', 'Cosmetic Crate'],
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],

    // Daily Quests & Streaks
    dailyQuests: {
        type: [{
            questId: String,
            description: String,
            targetCount: Number,
            currentProgress: { type: Number, default: 0 },
            rewardCoins: Number,
            rewardXP: Number,
            isCompleted: { type: Boolean, default: false }
        }],
        default: []
    },
    lastQuestReset: {
        type: Date,
        default: Date.now
    },

    // Knowledge/Skill Tree
    skillTree: {
        type: Map,
        of: {
            mastery: Number,
            isUnlocked: Boolean,
            version: String // e.g., 'Arrays' -> '2D Arrays'
        },
        default: {}
    },

    activityHistory: {
        type: [{
            type: { type: String, enum: ['challenge', 'lesson', 'boss'], required: true },
            topic: { type: String, required: true },
            isCorrect: { type: Boolean, default: true },
            xpGained: { type: Number, default: 0 },
            timestamp: { type: Date, default: Date.now }
        }],
        default: []
    },

    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for next level XP
userSchema.virtual('nextLevelXP').get(function() {
    return this.level * 100;
});

const User = mongoose.model('User', userSchema);
module.exports = User;
