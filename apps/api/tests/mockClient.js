/**
 * Mock RPG Client
 * Use this to test Socket.io events without a frontend.
 */
const { io } = require("socket.io-client");
require('dotenv').config();

// Change to your server URL if different
const URL = process.env.SOCKET_URL || `http://localhost:${process.env.PORT || 5000}`;
const socket = io(URL);

console.log("\x1b[35m--- RPG ENGINE TEST CLIENT ---\x1b[0m");

socket.on("connect", () => {
    console.log("\x1b[32m✔ Connected to Realm!\x1b[0m (ID: " + socket.id + ")");

    // 1. Test Exploration Loop
    console.log("\x1b[36m🏃 Walking into the forest...\x1b[0m");
    for (let i = 1; i <= 6; i++) {
        setTimeout(() => {
            console.log(`   Step ${i}...`);
            socket.emit("explore_step", { count: i });
        }, i * 500);
    }

    // 2. Test AI Challenger Summon (triggered after steps)
    setTimeout(() => {
        console.log("\x1b[33m⚔️ Intentional AI Summon Test...\x1b[0m");
        socket.emit("summon_ai_challenger", {
            clerkId: "test_hero_123",
            topic: "Arrays",
            currentLevel: 5
        });
    }, 4000);
});

// EVENT LISTENERS
socket.on("exploration_bonus", (data) => {
    console.log(`\x1b[32m✨ ${data.message} (+${data.xp} XP)\x1b[0m`);
});

socket.on("exploration_event", (data) => {
    if (data.type === 'nugget') {
        console.log(`\x1b[34m💎 Found a Knowledge Nugget: ${data.reward.text}\x1b[0m`);
    } else {
        console.log("\x1b[31m⚔️ A Random Encounter appeared!\x1b[0m");
    }
});

socket.on("battle_start", (data) => {
    console.log("\x1b[35m--- AI BATTLE START ---\x1b[0m");
    console.log("Question:", data.question.questionText);
    console.log("AI will answer in:", (data.aiTime / 1000).toFixed(2), "seconds.");
    
    // Simulate player answering fast
    setTimeout(() => {
        console.log("📝 Submitting correct answer in 2s...");
        socket.emit("submit_battle_answer", {
            clerkId: "test_hero_123",
            isCorrect: true,
            timeTaken: 2000,
            aiTime: data.aiTime
        });
    }, 1000);
});

socket.on("battle_result", (data) => {
    console.log(`\x1b[1m\x1b[33m🏆 RESULT: ${data.result}\x1b[0m`);
    console.log(`   XP Gained: ${data.xpGained}`);
    console.log(`   Current Energy: ${data.newStats.focusEnergy}`);
    
    console.log("\n\x1b[35mTests completed. Press Ctrl+C to exit.\x1b[0m");
});

socket.on("error", (err) => {
    console.error("\x1b[31m✘ Error:\x1b[0m", err.message);
});

socket.on("disconnect", () => {
    console.log("\x1b[31m✘ Disconnected from Realm\x1b[0m");
});
