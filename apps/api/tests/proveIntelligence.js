const AIService = require('../services/AIService');
const MechanicsService = require('../services/MechanicsService');
const User = require('../models/User'); // We can't easily use full Model without DB connection

async function proveIntelligence() {
    console.log('\n🧠 STARTING STANDALONE INTELLIGENCE TEST (OpenAI Check)...\n');
    
    try {
        const topic = 'Recursion';
        console.log(`[1] Requesting Level-1 Challenge for "${topic}"...`);
        const question = await AIService.generateQuestion(topic, 1);
        
        console.log('✅ AI RESPONDED SUCCESSFULLY:');
        console.log(`   Question: ${question.questionText}`);
        console.log(`   Correct Option: ${question.options.find(o => o.isCorrect).text}`);
        
        console.log(`\n[2] Requesting Battle Scroll (Lesson) for "${topic}"...`);
        const lesson = await AIService.generateLesson(topic);
        console.log('✅ AI RESPONDED SUCCESSFULLY:');
        console.log(`   Title: ${lesson.title}`);
        console.log(`   Lore: ${lesson.lore}`);

        console.log('\n🛡️  AI MODULE IS FULLY OPERATIONAL WITH LIVE CREDENTIALS\n');
    } catch (err) {
        console.error('❌ AI MODULE FAILED!');
        console.error('Error:', err.message);
    }
}

proveIntelligence();
