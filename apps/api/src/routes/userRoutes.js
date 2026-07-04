const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { 
    onboardUser, 
    getUserProfile, 
    getUserHistory,
    updateStats,
    saveExploredChunk,
    getLeaderboard
} = require('../controllers/userController');

const { isMock, models } = require('../config/env');
const User = models.User;
const protect = isMock ? (req, res, next) => { req.auth = { userId: 'test_hero_123' }; next(); } : requireAuth();

/**
 * @swagger
 * /api/user/onboard:
 *   post:
 *     summary: Create your Hero (Onboarding)
 *     tags: [Hero]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clerkId: { type: string }
 *               username: { type: string }
 *               email: { type: string }
 *               selectedClass: { type: string, enum: ['Array Knight', 'Recursion Mage', 'Graph Assassin', 'Pointer Paladin'] }
 *     responses:
 *       201:
 *         description: Hero created successfully
 */
router.post('/onboard', onboardUser);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get Hero Profile & Stats
 *     tags: [Hero]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hero profile data
 */
router.get('/profile', protect, getUserProfile);
router.get('/history', protect, getUserHistory);

/**
 * @swagger
 * /api/user/stats:
 *   patch:
 *     summary: Manually update your stats (NPC Refills)
 *     tags: [Hero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               energyChange: { type: number }
 *               xpChange: { type: number }
 *     responses:
 *       200:
 *         description: Stats updated
 */
router.patch('/stats', protect, updateStats);

/**
 * @swagger
 * /api/user/explore:
 *   patch:
 *     summary: Mark a map chunk as explored (Fog of Knowledge)
 *     tags: [Hero]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chunkKey: { type: string }
 *     responses:
 *       200:
 *         description: Chunk marked as explored
 */
router.patch('/explore', protect, saveExploredChunk);

/**
 * @swagger
 * /api/user/leaderboard:
 *   get:
 *     summary: Get Leaderboard Rankings
 *     tags: [Progress]
 *     parameters:
 *       - in: query
 *         name: track
 *         schema:
 *           type: string
 *         description: Filter by class/track
 *       - in: query
 *         name: collegeID
 *         schema:
 *           type: string
 *         description: Filter by college
 *     responses:
 *       200:
 *         description: List of ranked users
 */
router.get('/leaderboard', getLeaderboard);

module.exports = router;
