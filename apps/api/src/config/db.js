const mongoose = require('mongoose');
const { isMock } = require('./env');

const connectDB = async () => {
    if (isMock) {
        console.log(`\x1b[33m✔ Running in MOCK MODE (In-memory storage active)\x1b[0m`);
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rpg_learning');
        console.log(`\x1b[32m✔ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    } catch (error) {
        console.error(`\x1b[31m✘ MongoDB Connection Failed: ${error.message}\x1b[0m`);
        console.log(`\x1b[33m💡 Tip: Set MOCK_MODE=true in .env to run without a database.\x1b[0m`);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.log(`\x1b[33m✔ Falling back to MOCK MODE so server stays online without MongoDB!\x1b[0m`);
        }
    }
};

module.exports = connectDB;
