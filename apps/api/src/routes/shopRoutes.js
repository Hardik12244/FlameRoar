const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { isMock } = require('../config/env');
const { 
    getShopItems, 
    purchaseItem 
} = require('../controllers/shopController');

const protect = isMock ? (req, res, next) => { req.auth = { userId: 'test_hero_123' }; next(); } : requireAuth();

/**
 * @swagger
 * /api/shop/items:
 *   get:
 *     summary: View all legendary items in the shop
 *     tags: [Shop]
 *     responses:
 *       200:
 *         description: List of shop items
 */
router.get('/items', getShopItems);

/**
 * @swagger
 * /api/shop/buy:
 *   post:
 *     summary: Purchase an item with coins
 *     tags: [Shop]
 *     security:
 *       - bearerAuth: []
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
 *         description: Purchase successful
 */
router.post('/buy', protect, purchaseItem);

module.exports = router;
