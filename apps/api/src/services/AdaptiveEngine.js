/**
 * Adaptive Difficulty Engine
 * Formula: New difficulty = current ± (0.3 × performance delta)
 */

const calculatePerformanceDelta = (results) => {
    // results: array of { isCorrect, timeTaken, hintsUsed }
    // Weighted performance: 
    // - isCorrect: 0.6
    // - timeTaken: 0.2 (scaled vs average)
    // - hintsUsed: 0.2 (0 hints = 1, 3 hints = 0)
    
    if (results.length === 0) return 0;
    
    const score = results.reduce((acc, r) => {
        let rScore = r.isCorrect ? 1 : -1;
        if (r.hintsUsed > 0) rScore -= (r.hintsUsed * 0.2);
        // Time factor (simplified: < 15s is good)
        if (r.timeTaken < 15000) rScore += 0.1;
        return acc + rScore;
    }, 0) / results.length;

    return score;
};

const getNextDifficulty = (currentDifficulty, recentResults) => {
    const delta = calculatePerformanceDelta(recentResults);
    
    // Formula from requirement: current ± (0.3 × performance delta)
    let newDiff = currentDifficulty + (0.3 * delta);
    
    // Constraints
    newDiff = Math.max(1, Math.min(4, newDiff));
    
    return Math.round(newDiff);
};

module.exports = {
    getNextDifficulty
};
