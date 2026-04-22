const User = require('../models/User');
const Question = require('../models/Question');
const MechanicsService = require('../services/MechanicsService');

/**
 * GET /challenge/:topic
 * Fetches a random challenge based on the topic.
 */
exports.getChallenge = async (req, res) => {
  try {
    const { topic } = req.params;
    const count = await Question.countDocuments({ category: topic });
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne({ category: topic }).skip(random);

    if (!question) {
      return res.status(404).json({ message: 'No challenges found for this topic.' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /challenge/submit
 * Submits a challenge answer and updates user XP/progress.
 */
exports.submitChallenge = async (req, res) => {
  try {
    const { clerkId, questionId, answer, language } = req.body;
    const user = await User.findOne({ clerkId });
    const question = await Question.findById(questionId);

    if (!user || !question) {
      return res.status(404).json({ message: 'User or Question not found.' });
    }

    let isCorrect = false;

    if (question.type === 'mcq') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.text === answer;
    } else if (question.type === 'coding') {
      // In a real scenario, this would involve a secure code execution engine (e.g., piston, Judge0)
      // For now, we simulate success if the answer matches some basic logic or just returns true
      // This is a placeholder for actual code evaluation logic
      isCorrect = true;
    }

    if (isCorrect) {
      user.xp += question.xpReward || 10;
      // Simple level up logic: level = floor(xp / 100) + 1
      user.level = Math.floor(user.xp / 100) + 1;
      await user.save();

      return res.json({
        success: true,
        message: 'Correct!',
        xpGained: question.xpReward,
        newXp: user.xp,
        newLevel: user.level
      });
    } else {
      return res.json({ success: false, message: 'Incorrect answer. Try again!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /answer/submit
 * Submits an answer (correct or incorrect) and updates user stats accordingly.
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { clerkId, isCorrect, topic, difficulty } = req.body;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let failureLesson = null;

    if (isCorrect) {
      user.streak += 1;
      const xpGained = MechanicsService.calculateXP(difficulty, user.streak);
      user.xp += xpGained;
      user.focusEnergy = Math.min(100, user.focusEnergy + 20); // Cap at 100 focus energy

      const currentMastery = user.topicMastery.get(topic) || 0;
      user.topicMastery.set(topic, currentMastery + 1);

      if (!user.learnedTopics.includes(topic)) {
        user.learnedTopics.push(topic);
      }

      // Simple level up logic: 100 xp per level
      user.level = Math.floor(user.xp / 100) + 1;
    } else {
      user.streak = 0;
      user.focusEnergy = Math.max(0, user.focusEnergy - 15);
      failureLesson = `You struggled with ${topic}. Here's a quick refresher to help you understand the concepts better.`;
    }

    await user.save();

    return res.json({
      stats: {
        level: user.level,
        xp: user.xp,
        focusEnergy: user.focusEnergy,
        speed: user.speed
      },
      failureLesson
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /npc/interact/:npcId
 * Handles interaction with NPCs based on progress tokens.
 */
exports.interactNPC = async (req, res) => {
  try {
    const { npcId } = req.params;
    const { clerkId } = req.body;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // This logic mirrors the front-end token system
    const tokens = new Set();
    user.questFlags.forEach((value, key) => { if (value) tokens.add(key); });
    user.medals.forEach(medal => tokens.add(`medal:${medal}`));

    // In a full implementation, we would fetch NPC requirements from mapProgression.json or a DB
    // For now, let's simulate a response based on common NPC IDs
    let responseText = "They don't seem to want to talk right now.";
    let canInteract = true;

    if (npcId === 'generic_guard') {
      if (!tokens.has('tutorial_completed')) {
        responseText = "You need to finish your training with Elder Kai before leaving.";
        canInteract = false;
      } else {
        responseText = "Move along, traveler.";
      }
    } else if (npcId === 'elder_kai') {
      responseText = "Welcome, traveler! Your journey begins here. (Tutorial start)";
      // Example: set a flag after talking
      user.questFlags.set('met_elder_kai', true);
      await user.save();
    }

    res.json({
      npcId,
      message: responseText,
      canInteract,
      tokens: Array.from(tokens)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

