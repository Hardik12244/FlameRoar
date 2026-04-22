const { models } = require('../config/env');
const User = models.User;
const asyncHandler = require('express-async-handler');

const SHOP_ITEMS = {
    'Topic Revealer': { price: 200, description: 'Reveals hidden concepts on the map.' },
    'Hint Revealer': { price: 100, description: 'Gives one free Level-3 hint.' },
    'XP Multiplier Crystal': { price: 300, description: '+50% XP for next 5 encounters.' },
    'Luck Charm': { price: 150, description: 'Increases AI summon chance.' },
    'Health Potion': { price: 50, description: 'Restores 20 Focus Energy.' }
};

/**
 * @desc    Get all shop items
 * @route   GET /api/shop/items
 */
const getShopItems = asyncHandler(async (req, res) => {
    res.json(SHOP_ITEMS);
});

/**
 * @desc    Purchase an item
 * @route   POST /api/shop/buy
 */
const purchaseItem = asyncHandler(async (req, res) => {
    const { itemType } = req.body;
    const item = SHOP_ITEMS[itemType];

    if (!item) {
        res.status(400);
        throw new Error('Invalid item type');
    }

    const user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
        res.status(404);
        throw new Error('Hero not found in the realm. Register first!');
    }

    if (user.coins < item.price) {
        res.status(400);
        throw new Error('Insufficient coins');
    }

    // Deduct coins & Add to inventory
    user.coins -= item.price;
    
    const inventoryItem = user.inventory.find(i => i.itemType === itemType);
    if (inventoryItem) {
        inventoryItem.quantity += 1;
    } else {
        user.inventory.push({ itemType, quantity: 1 });
    }

    await user.save();

    res.json({
        message: `Purchased ${itemType}!`,
        remainingCoins: user.coins,
        inventory: user.inventory
    });
});

module.exports = {
    getShopItems,
    purchaseItem
};
