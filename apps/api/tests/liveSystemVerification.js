const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;

async function runLiveVerification() {
    console.log('\n⚔️  INITIATING FULL BACKEND LIVE VERIFICATION...\n');

    try {
        // 1. IDENTITY MODULE: Profile Fetch (Tests Clerk + DB)
        console.log('[1/5] MODULE: IDENTITY (Clerk/DB)');
        // In MOCK or LIVE mode, the server knows who the user is from the header/middleware
        const profile = await axios.get(`${API_BASE}/user/profile`);
        console.log(`✅ Success: Found Hero "${profile.data.username}" (Level ${profile.data.level})`);

        // 2. INTELLIGENCE MODULE: AI Challenge Generation (Tests OpenAI)
        console.log('\n[2/5] MODULE: INTELLIGENCE (OpenAI)');
        const challenge = await axios.get(`${API_BASE}/game/challenge/Arrays`);
        console.log(`✅ Success: Generated Challenge: "${challenge.data.question.questionText.substring(0, 50)}..."`);
        console.log(`   Phase: ${challenge.data.question.learningPhase}`);

        // 3. MECHANICS MODULE: RPG Stat Shifts (Tests Logic)
        console.log('\n[3/5] MODULE: MECHANICS (Battle Logic)');
        const submit = await axios.post(`${API_BASE}/game/submit`, {
            topic: 'Arrays',
            isCorrect: true,
            timeTaken: 15
        });
        console.log(`✅ Success: Correct Answer Processed.`);
        console.log(`   XP Gained: +${submit.data.xpGained} | New Focus: ${submit.data.stats.focusEnergy}`);

        // 4. ECONOMY MODULE: Bazaar (Tests Inventory/Coins)
        console.log('\n[4/5] MODULE: ECONOMY (Bazaar)');
        const shop = await axios.get(`${API_BASE}/shop/items`);
        const itemNames = Object.keys(shop.data);
        console.log(`✅ Success: Fetched ${itemNames.length} items from Bazaar.`);
        console.log(`   Sample Item: ${itemNames[0]} (${shop.data[itemNames[0]].price} Credits)`);

        // 5. SUPPORT MODULE: Bit (System Sprite)
        console.log('\n[5/5] MODULE: SUPPORT (AI Conversational)');
        const chat = await axios.post(`${API_BASE}/game/support/chat`, {
            message: "What is an array?"
        });
        console.log(`✅ Success: Bit responded: "${chat.data.response.substring(0, 50)}..."`);

        console.log('\n🛡️  FULL SYSTEM LOGIC VALIDATED: ALL MODULES OPERATIONAL\n');
    } catch (err) {
        console.error('❌ VERIFICATION FAILED!');
        console.error('Error:', err.response?.data?.message || err.message);
        if (err.response?.data?.stack) console.error(err.response.data.stack);
    }
}

runLiveVerification();
