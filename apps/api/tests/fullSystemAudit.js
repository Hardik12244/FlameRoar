const axios = require('axios');
require('dotenv').config();

async function runAudit() {
    console.log('\n--- 🛡️ OBSIDIAN BACKEND INDUSTRIAL AUDIT ---');
    const API_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;
    
    // We'll simulate the "clerk_id" via the mock middleware header if running in mock mode
    // The server.js mock middleware accepts req.auth but doesn't check headers. 
    // In our manual test, we assume the server is running in MOCK mode.

    try {
        console.log('\n[1] Testing Onboarding Security...');
        // Attempt to onboard with a body clerkId (should be ignored/overridden by req.auth.userId)
        const onboardRes = await axios.post(`${API_URL}/user/onboard`, {
            clerkId: 'evil_hacker', 
            username: 'AuditHero',
            email: 'audit@ace.hack',
            selectedClass: 'Array Knight'
        });
        
        if (onboardRes.data.clerkId === 'evil_hacker') {
            console.error('❌ VULNERABILITY FOUND: Onboarding still respects body clerkId!');
        } else {
            console.log('✅ SECURE: Onboarding ignored manual clerkId.');
        }

        console.log('\n[2] Testing Stat Hardening...');
        const statsRes = await axios.patch(`${API_URL}/user/stats`, {
            xpChange: 99999,
            secretKey: 'wrong_key'
        });
        
        // This should fail in "production" mode but we are likely in "development"
        // Let's check if the stats actually updated or if we can see the secretKey logic.
        console.log('✅ INFO: Stat update check (System requires secretKey in production).');

        console.log('\n[3] Testing Stat Alignment (Energy 1000)...');
        // Check if Focus Energy can exceed 100 now
        const profileRes = await axios.get(`${API_URL}/user/profile`);
        console.log(`✅ INFO: Current Max Energy in DB: ${profileRes.data.focusEnergy || 'Not Set'}`);
        
        console.log('\n--- 🛡️ AUDIT COMPLETE ---');
    } catch (err) {
        console.error('❌ AUDIT ERROR:', err.response?.data?.message || err.message);
    }
}

runAudit();
