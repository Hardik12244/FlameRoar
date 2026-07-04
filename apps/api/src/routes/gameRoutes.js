const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { 
    getChallenge, 
    submitAnswer, 
    getBossChallenge,
    getLesson,
    resolveLesson,
    getSyntaxProvinceProgress,
    getNpcInteractionStatus,
    interactWithNpc,
    resolveNpcBattle,
    consumeItem,
    getHint
} = require('../controllers/gameController');

const { isMock, models } = require('../config/env');
const User = models.User;
const Question = models.Question;
const protect = isMock ? (req, res, next) => { req.auth = { userId: 'test_hero_123' }; next(); } : requireAuth();

/**
 * @swagger
 * /api/game/study/{topic}:
 *   get:
 *     summary: Read an Ancient Battle Scroll (Lesson)
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lesson data and XP reward
 */
router.get('/study/:topic', protect, getLesson);

/**
 * @swagger
 * /api/game/progression/syntax-province:
 *   get:
 *     summary: Get current Syntax Province quest and medal state
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progression and NPC unlock status
 */
router.get('/progression/syntax-province', protect, getSyntaxProvinceProgress);

/**
 * @swagger
 * /api/game/challenge/{topic}:
 *   get:
 *     summary: Get an adaptive AI questions for a topic
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Game challenge data
 */
router.get('/challenge/:topic', protect, getChallenge);

/**
 * @swagger
 * /api/game/submit:
 *   post:
 *     summary: Submit an answer and gain rewards
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isCorrect: { type: boolean }
 *               timeTaken: { type: number }
 *               topic: { type: string }
 *     responses:
 *       200:
 *         description: Result of the encounter
 */
router.post('/submit', protect, submitAnswer);

/**
 * @swagger
 * /api/game/npc/{npcId}:
 *   get:
 *     summary: Get a Syntax Province NPC interaction status
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: NPC unlock and progression state
 */
router.get('/npc/:npcId', protect, getNpcInteractionStatus);

/**
 * @swagger
 * /api/game/npc/{npcId}/interact:
 *   post:
 *     summary: Interact with a Syntax Province NPC
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Interaction result or battle handoff
 */
router.post('/npc/:npcId/interact', protect, interactWithNpc);

/**
 * @swagger
 * /api/game/npc/{npcId}/resolve:
 *   post:
 *     summary: Resolve a Syntax Province NPC battle and award progression
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Battle resolution with medal and unlock updates
 */
router.post('/npc/:npcId/resolve', protect, resolveNpcBattle);

/**
 * @swagger
 * /api/game/boss/{topic}:
 *   get:
 *     summary: Initiate an Epic Boss Battle
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Boss phases data
 */
router.get('/boss/:topic', protect, getBossChallenge);

router.post('/lesson/:lessonId/resolve', protect, resolveLesson);

/**
 * @swagger
 * /api/game/hint:
 *   post:
 *     summary: Get an AI-generated hint for a question
 *     tags: [Quest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText: { type: string }
 *               topic: { type: string }
 *               difficulty: { type: number }
 *               hintLevel: { type: number }
 *     responses:
 *       200:
 *         description: AI-generated hint text
 */
router.post('/hint', protect, getHint);

/**
 * @swagger
 * /api/game/inventory/consume:
 *   post:
 *     summary: Consume an item from inventory
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemType: { type: string }
 *     responses:
 *       200:
 *         description: Result of the consumed item
 */
router.post('/inventory/consume', protect, consumeItem);

module.exports = router;
