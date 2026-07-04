const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5055}/api`;
const SYSTEM_SECRET = process.env.SYSTEM_SECRET;

const auditAxios = axios.create({
    headers: { 'x-audit-token': SYSTEM_SECRET }
});

async function runMasterAudit() {
    console.log('\n⚔️ ⚔️ ⚔️  OBSIDIAN MASTER API AUDIT: INITIATED  ⚔️ ⚔️ ⚔️\n');
    let failCount = 0;

    const auditStep = async (name, operation) => {
        try {
            console.log(`[ ] ${name}...`);
            await operation();
            console.log(`✅ ${name}: PASSED`);
        } catch (err) {
            console.error(`❌ ${name}: FAILED`);
            console.error(`   Error: ${err.response?.data?.message || err.message}`);
            failCount++;
        }
    };

    // --- IDENTITY GAUNTLET ---
    console.log('\n--- MODULE: IDENTITY & PROFILE ---');
    await auditStep('Onboard Audit Hero', async () => {
        // We handle the existing user case gracefully
        try {
            await auditAxios.post(`${API_BASE}/user/onboard`, {
                username: 'Audit_Paladin',
                email: 'audit@ace.hack',
                selectedClass: 'Array Knight'
            });
        } catch (e) {
            if (e.response?.status !== 400) throw e; 
        }
    });

    await auditStep('Fetch Hero Profile', async () => {
        const res = await auditAxios.get(`${API_BASE}/user/profile`);
        if (!res.data.clerkId) throw new Error('clerkId missing in response');
    });

    // --- INTELLIGENCE GAUNTLET ---
    console.log('\n--- MODULE: AI & INTELLIGENCE (GEMINI) ---');
    await auditStep('Generate AI Challenge (Arrays)', async () => {
        const res = await auditAxios.get(`${API_BASE}/game/challenge/Arrays`);
        if (!res.data.question) throw new Error('AI Question failed to generate');
    });

    await auditStep('Fetch Battle Scroll (Lesson)', async () => {
        const res = await auditAxios.get(`${API_BASE}/game/study/Arrays`);
        if (!res.data.lesson) throw new Error('AI Lesson failed to generate');
        if (res.data.lesson.title === "Smudged Ink") throw new Error('AI Lesson returned fallback: Smudged Ink');
    });

    // --- MECHANICS GAUNTLET ---
    console.log('\n--- MODULE: RPG MECHANICS ---');
    let startingXP = 0;
    let startingLevel = 0;
    await auditStep('Submit Correct Answer (XP Check)', async () => {
        const profile = await auditAxios.get(`${API_BASE}/user/profile`);
        startingXP = profile.data.xp;
        startingLevel = profile.data.level;
        
        const res = await auditAxios.post(`${API_BASE}/game/submit`, {
            topic: 'Arrays',
            isCorrect: true,
            timeTaken: 10
        });
        
        if (res.data.xpGained <= 0) throw new Error('XP gain calculation failed');
    });

    await auditStep('Verify Level Up Simulation', async () => {
        const profile = await auditAxios.get(`${API_BASE}/user/profile`);
        const progressed = (profile.data.level > startingLevel) || (profile.data.xp > startingXP);
        if (!progressed) {
            throw new Error(`Progression failed. XP: ${startingXP}->${profile.data.xp}, Level: ${startingLevel}->${profile.data.level}`);
        }
    });

    // --- ECONOMY GAUNTLET ---
    console.log('\n--- MODULE: BAZAAR ECONOMY ---');
    await auditStep('Fetch Bazaar Catalog', async () => {
        const res = await auditAxios.get(`${API_BASE}/shop/items`);
        if (Object.keys(res.data).length === 0) throw new Error('Bazaar catalog empty');
    });

    await auditStep('Purchase Topic Revealer', async () => {
        // Ensure user has coins (Add coins via hack since we are auditing)
        await auditAxios.patch(`${API_BASE}/user/stats`, { coinChange: 500, secretKey: SYSTEM_SECRET });
        
        // Use the proper endpoint /shop/buy
        const realBuyRes = await auditAxios.post(`${API_BASE}/shop/buy`, {
            itemType: 'Topic Revealer'
        });
        
        if (!realBuyRes.data.inventory.some(i => i.itemType === 'Topic Revealer')) {
            throw new Error('Inventory update failed');
        }
    });

    // --- ANALYTICS GAUNTLET ---
    console.log('\n--- MODULE: ANALYTICS & HISTORY ---');
    await auditStep('Fetch Activity History', async () => {
        const res = await auditAxios.get(`${API_BASE}/user/history`);
        if (!Array.isArray(res.data.history)) throw new Error('History is not an array');
    });

    console.log('\n' + '⚔️ '.repeat(20));
    if (failCount === 0) {
        console.log('\n🏆  MASTER AUDIT: 100% COMPLETE - SYSTEM STABLE  🏆\n');
    } else {
        console.log(`\n⚠️  MASTER AUDIT: ${failCount} FAILURES DETECTED  ⚠️\n`);
    }
    console.log('⚔️ '.repeat(20) + '\n');
}

runMasterAudit();
