/**
 * Game Sockets Handler
 * Manages real-time PvAI battles and exploration events
 */

const AIService = require('../services/AIService');
const MechanicsService = require('../services/MechanicsService');
const { models } = require('../config/env');
const User = models.User;

module.exports = (io, socket) => {
    
    // ⚔️ AI CHALLENGER SUMMON
    socket.on('summon_ai_challenger', async (data) => {
        const { clerkId, topic, currentLevel } = data;
        
        console.log(`\x1b[33m⚔️ AI Challenger Appears for ${clerkId}!\x1b[0m`);
        
        try {
            // 1. Generate Question for the duel
            const question = await AIService.generateQuestion(topic, Math.min(4, Math.ceil(currentLevel / 10)));
            
            // 2. Simulate AI response time
            const aiTime = AIService.simulateAIResponseTime(question.difficulty);
            
            // 3. Emit battle start
            socket.emit('battle_start', {
                question,
                aiTime, // Frontend uses this to show AI "thinking" or "typing"
                healthBars: { player: 100, ai: 100 }
            });
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // 🏆 SUBMIT BATTLE ANSWER
    socket.on('submit_battle_answer', async (data) => {
        try {
            const { clerkId, isCorrect, timeTaken, aiTime } = data;
            
            const user = await User.findOne({ clerkId });
            if (!user) {
                return socket.emit('error', { message: 'Hero not found in the realm.' });
            }

            let result = 'DRAW';
            let xpGained = 0;

            if (isCorrect && timeTaken < aiTime) {
                result = 'VICTORY';
                xpGained = 250; 
                user.xp += xpGained;
                MechanicsService.handleLevelUp(user);
            } else if (!isCorrect || timeTaken > aiTime) {
                result = 'DEFEAT';
                MechanicsService.updateFocusEnergy(user, -10);
            }

            await user.save();

            socket.emit('battle_result', {
                result,
                xpGained,
                newStats: {
                    xp: user.xp,
                    level: user.level,
                    focusEnergy: user.focusEnergy
                }
            });
        } catch (error) {
            console.error('Socket Battle Error:', error);
            socket.emit('error', { message: 'The Code spirits are turbulent. Battle failed.' });
        }
    });

    // 🏃 EXPLORATION EVENTS
    socket.on('explore_step', (data) => {
        try {
            const { count } = data; 
            
            if (count % 5 === 0) {
                socket.emit('exploration_bonus', {
                    xp: 3,
                    message: "Exploration Bonus +3 XP"
                });
            }

            if (Math.random() < 0.25) {
                const types = ['encounter', 'nugget'];
                const type = types[Math.floor(Math.random() * types.length)];
                
                socket.emit('exploration_event', {
                    type,
                    reward: type === 'nugget' ? { xp: 5, text: "+5 Insight!" } : null
                });
            }
        } catch (error) {
            console.error('Socket Explore Error:', error);
        }
    });

};
