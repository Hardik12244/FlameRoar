const { models } = require('../config/env');
const User = models.User;
const MechanicsService = require('../services/MechanicsService');
const LessonService = require('../services/LessonService');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Onboard new user / Create Hero
 * @route   POST /api/user/onboard
 */
const onboardUser = asyncHandler(async (req, res) => {
    const { username, email, selectedClass } = req.body;
    // Extract ID from verified auth session instead of body to prevent spoofing
    const clerkId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;

    if (!username || typeof username !== 'string' || username.trim().length < 2 || username.length > 30) {
        res.status(400);
        throw new Error('Hero name must be between 2 and 30 characters');
    }
    const validClasses = ['Array Knight', 'Recursion Mage', 'Graph Assassin', 'Pointer Paladin'];
    if (!selectedClass || !validClasses.includes(selectedClass)) {
        res.status(400);
        throw new Error('Invalid hero class selected');
    }

    const userExists = await User.findOne({ clerkId });
    if (userExists) {
        res.status(400);
        throw new Error('Hero already exists');
    }

    // Titanium Hardening: Strict sanitization to prevent cheats
    const user = await User.create({
        clerkId,
        username: username.trim(),
        email: typeof email === 'string' ? email.trim() : '',
        class: selectedClass,
        // Enforce defaults
        level: 1,
        xp: 0,
        coins: 50,
        focusEnergy: 100
    });

    res.status(201).json(user);
});

/**
 * @desc    Get User Profile & Stats
 * @route   GET /api/user/profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
    // req.auth is provided by Clerk middleware
    const user = await User.findOne({ clerkId: (typeof req.auth === 'function' ? req.auth().userId : req.auth.userId) });
    
    if (!user) {
        res.status(404);
        throw new Error('Hero not found');
    }

    // Dynamic speed update based on current mastery
    MechanicsService.calculateSpeed(user);
    LessonService.ensureLessonProgressDefaults(user);
    await user.save();

    res.json({
        ...(typeof user.toObject === 'function' ? user.toObject() : user),
        lessonState: LessonService.buildLessonState(user)
    });
});

/**
 * @desc    Manual Stat Update (e.g. from NPC interactions)
 * @route   PATCH /api/user/stats
 */
const updateStats = asyncHandler(async (req, res) => {
    // SECURITY: This endpoint is for system-internal updates only. 
    // In production, you would add a secret key or remove this.
    const { energyChange, xpChange, coinChange, secretKey } = req.body;
    
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.SYSTEM_SECRET) {
        res.status(403);
        throw new Error('Unauthorized system call');
    }

    if (energyChange !== undefined && (typeof energyChange !== 'number' || isNaN(energyChange))) {
        res.status(400);
        throw new Error('energyChange must be a valid number');
    }
    if (coinChange !== undefined && (typeof coinChange !== 'number' || isNaN(coinChange) || Math.abs(coinChange) > 10000)) {
        res.status(400);
        throw new Error('coinChange exceeds allowed limits or is invalid');
    }
    if (xpChange !== undefined && (typeof xpChange !== 'number' || isNaN(xpChange) || Math.abs(xpChange) > 50000)) {
        res.status(400);
        throw new Error('xpChange exceeds allowed limits or is invalid');
    }

    const clerkId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;
    const user = await User.findOne({ clerkId });

    if (user) {
        if (energyChange) MechanicsService.updateFocusEnergy(user, energyChange);
        if (coinChange) user.coins += coinChange;
        if (xpChange) {
            user.xp += xpChange;
            MechanicsService.handleLevelUp(user);
        }
        await user.save();
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Save Explored Area (Fog of Knowledge chunk reveal)
 * @route   PATCH /api/user/explore
 */
const saveExploredChunk = asyncHandler(async (req, res) => {
    const { chunkKey } = req.body;

    if (!chunkKey || typeof chunkKey !== 'string' || chunkKey.length > 50) {
        res.status(400);
        throw new Error('Valid chunk key required (max 50 chars)');
    }

    const clerkId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;
    const user = await User.findOne({ clerkId });

    if (user) {
        if (!user.exploredTiles) {
            user.exploredTiles = [];
        }
        if (!user.exploredTiles.includes(chunkKey)) {
            user.exploredTiles.push(chunkKey);
            // Optionally reward XP or focus for exploring
            MechanicsService.updateFocusEnergy(user, 1);
            user.xp += 5;
            MechanicsService.handleLevelUp(user);
            await user.save();
        }
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Get Leaderboard Data
 * @route   GET /api/user/leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {
    const { track, collegeID } = req.query;

    // Base match query
    const matchQuery = {};
    if (track && track !== 'Global' && track !== 'all') {
        matchQuery.class = track;
    }
    if (collegeID) {
        matchQuery.collegeID = collegeID;
    }

    const users = await User.find(matchQuery)
        .select('username class level xp currentStreak medalsCount bossesDefeated mastery questionsSolved questionsAttempted collegeID')
        .lean();

    // Compute derived stats for ranking
    const rankedUsers = users.map(user => {
        const medals = user.medalsCount ? user.medalsCount.length : 0;
        const bosses = user.bossesDefeated ? user.bossesDefeated.length : 0;
        const accuracy = user.questionsAttempted > 0
            ? ((user.questionsSolved || 0) / user.questionsAttempted) * 100
            : 0;

        // Compute average mastery
        let avgMastery = 0;
        if (user.mastery) {
            const keys = Object.keys(user.mastery);
            if (keys.length > 0) {
                const totalMastery = keys.reduce((sum, k) => sum + user.mastery[k], 0);
                avgMastery = totalMastery / keys.length;
            }
        }

        // Leaderboard Score Formula
        // Core progress: xp (1 pt per xp)
        // Achievements: medals (1000 pts), bosses (2000 pts)
        // Action: questions solved (50 pts)
        // Consistency: streak (100 pts)
        const score = (user.xp || 0)
            + (medals * 1000)
            + (bosses * 2000)
            + ((user.questionsSolved || 0) * 50)
            + ((user.currentStreak || 0) * 100);

        return {
            _id: user._id,
            username: user.username,
            track: user.class,
            collegeID: user.collegeID,
            level: user.level || 1,
            xp: user.xp || 0,
            medals,
            bossesDefeated: bosses,
            streak: user.currentStreak || 0,
            questionsSolved: user.questionsSolved || 0,
            accuracy: accuracy.toFixed(1),
            masteryPercentage: avgMastery.toFixed(1),
            score
        };
    });

    // Sort descending by calculated score
    rankedUsers.sort((a, b) => b.score - a.score);

    // Assign ranks
    rankedUsers.forEach((user, index) => {
        user.rank = index + 1;
    });

    res.json({
        success: true,
        count: rankedUsers.length,
        data: rankedUsers
    });
});

const getUserHistory = asyncHandler(async (req, res) => {
    const clerkId = typeof req.auth === 'function' ? req.auth().userId : req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) {
        res.status(404);
        throw new Error('Hero not found');
    }
    res.json({
        activityHistory: user.activityHistory || [],
        questionsSolved: user.questionsSolved || 0,
        questionsAttempted: user.questionsAttempted || 0,
        learnedTopics: user.learnedTopics || [],
        bossesDefeated: user.bossesDefeated || [],
        medalsCount: user.medalsCount || [],
        skillDex: user.skillDex || []
    });
});

module.exports = {
    onboardUser,
    getUserProfile,
    getUserHistory,
    updateStats,
    saveExploredChunk,
    getLeaderboard
};
