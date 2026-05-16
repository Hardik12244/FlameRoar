/**
 * Source of Truth for Environment Configuration
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });
// fallback to standard loaded env if root isn't found
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const isMock = !isProduction && (
    process.env.MOCK_MODE === 'true' ||
    !process.env.MONGODB_URI ||
    !process.env.CLERK_SECRET_KEY
);

const hasAIKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENAI_API_KEY
);

const isAIMock = isMock || !hasAIKey;

if (isMock) {
    console.log("\x1b[33m⚠️  SYSTEM RUNNING IN ZERO-CONFIG MOCK MODE\x1b[0m");
} else if (isProduction) {
    console.log("\x1b[35m🚀 SYSTEM RUNNING IN PRODUCTION MODE\x1b[0m");
}

const getModels = () => {
    if (isMock) {
        return {
            User: require('../services/MockDB').User,
            Question: require('../services/MockDB').Question
        };
    } else {
        return {
            User: require('../models/User'),
            Question: require('../models/Question')
        };
    }
};

module.exports = {
    isMock,
    isAIMock,
    models: getModels(),
    port: process.env.PORT || 5001
};
