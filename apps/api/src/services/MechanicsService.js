/**
 * Mechanics Service
 * Handles core RPG math and stat transformations
 */

const XP_PER_LEVEL_BASE = 100;

const calculateXPGain = (difficulty, streak, hasBonus = false) => {
    // difficulty 1-4
    const baseXP = [10, 25, 50, 250]; 
    let gain = baseXP[difficulty - 1] || 10;
    
    // Streak multiplier (10% bonus per streak point above 3)
    if (streak >= 3) {
        gain = Math.floor(gain * (1 + (streak * 0.1)));
    }

    if (hasBonus) gain *= 1.5; // Victory Rush or Inferno mode

    return gain;
};

const handleLevelUp = (user) => {
    let leveledUp = false;
    while (user.xp >= (user.level * XP_PER_LEVEL_BASE)) {
        user.xp -= (user.level * XP_PER_LEVEL_BASE);
        user.level += 1;
        leveledUp = true;
    }
    return leveledUp;
};

const updateFocusEnergy = (user, amount) => {
    user.focusEnergy = Math.min(1000, Math.max(0, user.focusEnergy + amount));
};

const calculateSpeed = (user, globalMastery) => {
    // Every topic mastered (100%) -> +0.2x speed
    // This would be calculated based on user.mastery Map
    let bonus = 0;
    user.mastery.forEach((percent) => {
        if (percent >= 100) bonus += 0.2;
    });
    
    user.playerSpeed = Math.min(3.0, 1.0 + bonus);
    return user.playerSpeed;
};

module.exports = {
    calculateXPGain,
    handleLevelUp,
    updateFocusEnergy,
    calculateSpeed
};
