/**
 * Mock Data Store
 * Simulates Mongoose models for Zero-Config testing
 */

const users = new Map();
const questions = new Map();

// Initialize with a mock user for testing
const mockUser = {
    clerkId: 'test_hero_123',
    username: 'MockHero',
    email: 'mock@hero.com',
    class: 'Array Knight',
    level: 1,
    xp: 0,
    focusEnergy: 100,
    playerSpeed: 1.0,
    streak: 0,
    currentStreak: 0,
    currentRegion: 'Academy',
    unlockedRegions: {
        academy: true,
        outlawTrail: false,
        crossroads: false,
        ridge: false,
        cathedral: false,
        royalGate: false,
        finalArena: false,
        map2Unlocked: false
    },
    coins: 50,
    bossesDefeated: [],
    completedNpcInteractions: [],
    npcFailureCounts: {},
    medalsCount: [],
    skillDex: [],
    collegeID: null,
    questFlags: {
        movementUnlocked: false,
        codeDexUnlocked: false,
        kingGateCleared: false,
        princessAudienceGranted: false,
        syntaxProvinceCompleted: false
    },
    titles: ['Rookie Coder'],
    mastery: new Map(),
    learnedTopics: [],
    inventory: [],
    skillTree: new Map(),
    save: function() { 
        users.set(this.clerkId || 'manual_tester', this); 
        return Promise.resolve(this); 
    }
};

users.set('test_hero_123', mockUser);
users.set('manual_tester', { ...mockUser, clerkId: 'manual_tester' });

class MockModel {
    constructor(dataMap) {
        this.dataMap = dataMap;
    }

    async findOne({ clerkId }) {
        const user = this.dataMap.get(clerkId);
        if (user && !user.save) {
            // Re-attach save mock
            user.save = function() { return Promise.resolve(this); };
        }
        return user || null;
    }

    async create(data) {
        const item = { 
            ...data, 
            save: function() { return Promise.resolve(this); } 
        };
        const id = data.clerkId || Date.now().toString();
        this.dataMap.set(id, item);
        return item;
    }

    async findById(id) {
        return this.dataMap.get(id) || null;
    }

    find(query = {}) {
        let results = Array.from(this.dataMap.values());

        if (query.class) {
            results = results.filter(u => u.class === query.class);
        }
        if (query.collegeID) {
            results = results.filter(u => u.collegeID === query.collegeID);
        }

        const self = this;
        return {
            select: function() {
                return this;
            },
            lean: async function() {
                return results;
            }
        };
    }
}

module.exports = {
    User: new MockModel(users),
    Question: new MockModel(questions)
};
