/**
 * RPG Interactive Duel (CLI)
 * Test yourself directly in the terminal!
 */
const { io } = require("socket.io-client");
const readline = require("readline");
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const socket = io(process.env.SOCKET_URL || `http://localhost:${process.env.PORT || 5000}`);

console.log("\x1b[35m\x1b[1m\n========================================");
console.log("   ⚔️  WELCOME TO THE CODE ARENA  ⚔️");
console.log("========================================\n\x1b[0m");

socket.on("connect", () => {
    console.log("\x1b[32m✔ Connected to Realm. Preparing your first challenge...\x1b[0m\n");
    
    // Start with a default topic
    socket.emit("summon_ai_challenger", {
        clerkId: "manual_tester",
        topic: "Data Structures",
        currentLevel: 1
    });
});

socket.on("battle_start", (data) => {
    const { question, aiTime } = data;
    
    console.log(`\x1b[33m\x1b[1mTOPIC: ${question.topic} | DIFFICULTY: ${question.difficulty}\x1b[0m`);
    console.log(`\x1b[1mQUESTION:\x1b[0m ${question.questionText}\n`);
    
    question.options.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt.text}`);
    });

    console.log(`\n\x1b[36m⏱️  YOU HAVE ${(aiTime/1000).toFixed(1)} SECONDS TO BEAT THE AI!\x1b[0m`);
    
    const startTime = Date.now();

    rl.question("\n\x1b[1mChoose wisely (1-4):\x1b[0m ", (answer) => {
        const timeTaken = Date.now() - startTime;
        const answerIdx = parseInt(answer) - 1;
        
        if (answerIdx >= 0 && answerIdx < 4) {
            const isCorrect = question.options[answerIdx].isCorrect;
            
            socket.emit("submit_battle_answer", {
                clerkId: "manual_tester",
                isCorrect,
                timeTaken,
                aiTime
            });
        } else {
            console.log("\x1b[31m✘ Invalid choice! The AI strikes while you hesitate.\x1b[0m");
            process.exit();
        }
    });
});

socket.on("battle_result", (data) => {
    console.log("\n----------------------------------------");
    if (data.result === 'VICTORY') {
        process.stdout.write("\x1b[32m\x1b[1m  🏆 VICTORY! ");
    } else {
        process.stdout.write("\x1b[31m\x1b[1m  💀 DEFEAT! ");
    }
    console.log(`Result: ${data.result}\x1b[0m`);
    console.log(`   XP Gained: +${data.xpGained}`);
    console.log(`   Current Energy: ${data.newStats.focusEnergy}/100`);
    console.log("----------------------------------------\n");

    rl.question("Want another challenge? (y/n) ", (choice) => {
        if (choice.toLowerCase() === 'y') {
            console.log("\x1b[36mSearching for a new opponent...\x1b[0m\n");
            socket.emit("summon_ai_challenger", {
                clerkId: "manual_tester",
                topic: "Data Structures",
                currentLevel: data.newStats.level
            });
        } else {
            console.log("\x1b[35mFarewell, Hero!\x1b[0m");
            process.exit();
        }
    });
});

socket.on("error", (err) => {
    console.error("\x1b[31m✘ AI Error:\x1b[0m", err.message);
    process.exit();
});

socket.on("disconnect", () => {
    console.log("\x1b[31m✘ Lost connection to the server.\x1b[0m");
});
