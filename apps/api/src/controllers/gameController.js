const { models, isMock } = require('../config/env');
const User = models.User;
const AIService = require('../services/AIService');
const MechanicsService = require('../services/MechanicsService');
const AdaptiveEngine = require('../services/AdaptiveEngine');
const LessonService = require('../services/LessonService');
const asyncHandler = require('express-async-handler');

const MEDALS = Object.freeze({
  IDENTITY: 'Identity Medal',
  LOGIC: 'Logic Medal',
  DECISION: 'Decision Medal',
  CYCLE: 'Cycle Medal'
});

const DEFAULT_UNLOCKED_REGIONS = Object.freeze({
  academy: true,
  outlawTrail: false,
  crossroads: false,
  ridge: false,
  cathedral: false,
  royalGate: false,
  finalArena: false,
  map2Unlocked: false
});

const BATTLE_NPC_KINDS = new Set(['miniBoss', 'boss']);

const SYNTAX_PROVINCE_NPCS = Object.freeze({
  pappa_heroka: {
    id: 'pappa_heroka',
    name: 'pappa_heroka',
    kind: 'tutorial',
    region: 'The Academy',
    topic: 'syntax',
    requires: [],
    reward: 'Movement unlocked'
  },
  Queen: {
    id: 'Queen',
    name: 'Queen',
    kind: 'mission',
    region: 'The Academy',
    topic: 'variables',
    requires: [
      { type: 'interaction', npcId: 'pappa_heroka', description: 'Finish pappa_heroka tutorial first.' }
    ],
    reward: 'Code-Dex'
  },
  Thief: {
    id: 'Thief',
    name: 'Thief',
    kind: 'miniBoss',
    region: 'The Outlaw Trail',
    topic: 'variables',
    medal: MEDALS.IDENTITY,
    baseDifficulty: 1,
    requires: [
      { type: 'flag', key: 'codeDexUnlocked', description: 'Get the Code-Dex from Queen first.' }
    ]
  },
  Normalnun: {
    id: 'Normalnun',
    name: 'Normalnun',
    kind: 'healingStation',
    region: 'The Outlaw Trail',
    topic: 'recovery',
    requires: [
      { type: 'interaction', npcId: 'Queen', description: 'Meet Queen before using the Outlaw Trail station.' }
    ],
    reward: 'Full Energy Restore'
  },
  Mountainking: {
    id: 'Mountainking',
    name: 'Mountainking',
    kind: 'miniBoss',
    region: 'The Crossroads',
    topic: 'operators',
    medal: MEDALS.LOGIC,
    baseDifficulty: 2,
    requires: [
      { type: 'boss', npcId: 'Thief', description: 'Defeat Thief before entering The Crossroads.' }
    ]
  },
  Alchemist: {
    id: 'Alchemist',
    name: 'Alchemist',
    kind: 'learningTrigger',
    region: 'The Crossroads',
    topic: 'operators',
    requires: [
      { type: 'boss', npcId: 'Thief', description: 'Defeat Thief before the arithmetic lesson unlocks.' }
    ],
    reward: 'Arithmetic / Logic lesson'
  },
  Archer: {
    id: 'Archer',
    name: 'Archer',
    kind: 'miniBoss',
    region: 'The Ridge',
    topic: 'conditionals',
    medal: MEDALS.DECISION,
    baseDifficulty: 2,
    requires: [
      { type: 'boss', npcId: 'Mountainking', description: 'Defeat Mountainking before challenging Archer.' }
    ]
  },
  Butcher: {
    id: 'Butcher',
    name: 'Butcher',
    kind: 'learningTrigger',
    region: 'The Ridge',
    topic: 'conditionals',
    requires: [
      { type: 'boss', npcId: 'Mountainking', description: 'Defeat Mountainking before unlocking the if/else lesson.' }
    ],
    reward: 'If / Else / Switch lesson'
  },
  Bishop: {
    id: 'Bishop',
    name: 'Bishop',
    kind: 'miniBoss',
    region: 'The Cathedral',
    topic: 'loops',
    medal: MEDALS.CYCLE,
    baseDifficulty: 3,
    requires: [
      { type: 'interaction', npcId: 'Butcher', description: 'Learn conditionals from Butcher before entering The Cathedral.' }
    ]
  },
  King: {
    id: 'King',
    name: 'King',
    kind: 'gatekeeper',
    region: 'The Royal Gate',
    topic: 'syntax_foundations',
    requires: [
      { type: 'medalCount', count: 4, description: 'Earn all four Syntax Province medals first.' }
    ],
    reward: 'Royal Gate access'
  },
  Princess: {
    id: 'Princess',
    name: 'Princess',
    kind: 'bossGate',
    region: 'The Final Arena',
    topic: 'syntax_foundations',
    requires: [
      { type: 'flag', key: 'kingGateCleared', description: 'Pass the Royal Gate before meeting Princess.' }
    ],
    reward: 'Audience with the final boss'
  },
  Mage: {
    id: 'Mage',
    name: 'Mage',
    kind: 'boss',
    region: 'The Final Arena',
    topic: 'syntax_foundations',
    reward: 'Foundations Mastery Certificate',
    baseDifficulty: 3,
    requires: [
      { type: 'flag', key: 'princessAudienceGranted', description: 'Receive Princess approval before challenging Mage.' }
    ]
  }
});

const NPC_ID_ALIASES = Object.freeze({
  pappa: 'pappa_heroka',
  pappa_heroka: 'pappa_heroka',
  queen: 'Queen',
  queen: 'Queen',
  thief: 'Thief',
  thief: 'Thief',
  normalnun: 'Normalnun',
  normalnun: 'Normalnun',
  mountainking: 'Mountainking',
  mountainking: 'Mountainking',
  alchemist: 'Alchemist',
  alchemist: 'Alchemist',
  archer: 'Archer',
  archer: 'Archer',
  butcher: 'Butcher',
  butcher: 'Butcher',
  bishop: 'Bishop',
  bishop: 'Bishop',
  king: 'King',
  king: 'King',
  princess: 'Princess',
  princess: 'Princess',
  mage: 'Mage',
  mage: 'Mage'
});

const toPlainObject = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value.toObject === 'function') {
    return value.toObject();
  }

  return value;
};

const getRequestUserId = (req) => (
  req.auth?.userId ||
  req.headers['x-mock-user-id'] ||
  req.headers['x-clerk-user-id'] ||
  (isMock ? 'manual_tester' : null)
);

const addUnique = (list, value) => {
  if (!Array.isArray(list)) {
    return;
  }

  if (value && !list.includes(value)) {
    list.push(value);
  }
};

const normalizeNpcId = (rawNpcId) => {
  if (!rawNpcId) {
    return null;
  }

  const trimmed = String(rawNpcId).trim();
  if (SYNTAX_PROVINCE_NPCS[trimmed]) {
    return trimmed;
  }

  return NPC_ID_ALIASES[trimmed.toLowerCase()] || null;
};

const buildUnlockedRegions = (user) => {
  const medals = new Set(user.medalsCount || []);
  const questFlags = toPlainObject(user.questFlags);

  return {
    ...DEFAULT_UNLOCKED_REGIONS,
    academy: true,
    outlawTrail: Boolean(questFlags.codeDexUnlocked),
    crossroads: medals.has(MEDALS.IDENTITY),
    ridge: medals.has(MEDALS.LOGIC),
    cathedral: medals.has(MEDALS.DECISION),
    royalGate: medals.has(MEDALS.CYCLE),
    finalArena: Boolean(questFlags.kingGateCleared),
    map2Unlocked: Boolean(questFlags.syntaxProvinceCompleted)
  };
};

const ensureProgressionDefaults = (user) => {
  if (!Array.isArray(user.medalsCount)) {
    user.medalsCount = [];
  }

  if (!Array.isArray(user.skillDex)) {
    user.skillDex = [];
  }

  if (!Array.isArray(user.bossesDefeated)) {
    user.bossesDefeated = [];
  }

  if (!Array.isArray(user.completedNpcInteractions)) {
    user.completedNpcInteractions = [];
  }

  if (!Array.isArray(user.learnedTopics)) {
    user.learnedTopics = [];
  }

  if (!Array.isArray(user.titles)) {
    user.titles = ['Rookie Coder'];
  }

  if (!user.mastery || typeof user.mastery.get !== 'function') {
    user.mastery = new Map(Object.entries(toPlainObject(user.mastery)));
  }

  if (typeof user.currentStreak !== 'number') {
    user.currentStreak = user.streak || 0;
  }

  const questFlags = toPlainObject(user.questFlags);
  user.questFlags = {
    movementUnlocked: false,
    codeDexUnlocked: false,
    kingGateCleared: false,
    princessAudienceGranted: false,
    syntaxProvinceCompleted: false,
    ...questFlags
  };

  const failureCounts = toPlainObject(user.npcFailureCounts);
  user.npcFailureCounts = failureCounts && !Array.isArray(failureCounts) ? failureCounts : {};
  LessonService.ensureLessonProgressDefaults(user);

  user.unlockedRegions = buildUnlockedRegions(user);

  if (!user.currentRegion) {
    user.currentRegion = 'Academy';
  }

  return user;
};

const isNpcCleared = (user, npcId) => (
  user.bossesDefeated.includes(npcId) ||
  user.completedNpcInteractions.includes(npcId)
);

const getRequirementFailures = (user, npc) => {
  const questFlags = toPlainObject(user.questFlags);

  return (npc.requires || []).flatMap((requirement) => {
    switch (requirement.type) {
      case 'interaction':
        return isNpcCleared(user, requirement.npcId) ? [] : [requirement.description];
      case 'boss':
        return user.bossesDefeated.includes(requirement.npcId) ? [] : [requirement.description];
      case 'flag':
        return questFlags[requirement.key] ? [] : [requirement.description];
      case 'medalCount':
        return (user.medalsCount.length >= requirement.count) ? [] : [requirement.description];
      default:
        return [];
    }
  });
};

const buildNpcStatus = (user, npc) => {
  const missingRequirements = getRequirementFailures(user, npc);
  const lessonBlock = LessonService.getLessonBlockForNpc(user, npc.id);
  const defeated = user.bossesDefeated.includes(npc.id);
  const completed = user.completedNpcInteractions.includes(npc.id) || defeated;

  return {
    id: npc.id,
    name: npc.name,
    kind: npc.kind,
    region: npc.region,
    topic: npc.topic,
    medalReward: npc.medal || null,
    reward: npc.reward || null,
    unlocked: missingRequirements.length === 0 && !lessonBlock,
    missingRequirements: lessonBlock
      ? [...missingRequirements, lessonBlock.blockMessage]
      : missingRequirements,
    lessonBlocked: Boolean(lessonBlock),
    lessonBlock,
    defeated,
    completed
  };
};

const buildNpcStatuses = (user) => (
  Object.values(SYNTAX_PROVINCE_NPCS).map((npc) => buildNpcStatus(user, npc))
);

const buildProgressSnapshot = (user) => {
  ensureProgressionDefaults(user);

  return {
    currentRegion: user.currentRegion,
    medalsCount: user.medalsCount,
    medalCount: user.medalsCount.length,
    unlockedRegions: user.unlockedRegions,
    bossesDefeated: user.bossesDefeated,
    completedNpcInteractions: user.completedNpcInteractions,
    questFlags: user.questFlags,
    lessonState: LessonService.buildLessonState(user),
    skillDex: user.skillDex,
    npcFailureCounts: user.npcFailureCounts,
    collegeID: user.collegeID || null,
    stats: {
      level: user.level,
      xp: user.xp,
      focusEnergy: user.focusEnergy,
      speed: user.playerSpeed,
      streak: user.currentStreak
    }
  };
};

const getAdaptiveDifficulty = (user, npc) => {
  const baseDifficulty = npc?.baseDifficulty || 1;
  const streak = user.currentStreak || user.streak || 0;

  if (streak <= 0) {
    return baseDifficulty;
  }

  const recentResults = Array.from({ length: Math.min(streak, 5) }, () => ({
    isCorrect: true,
    timeTaken: 12000,
    hintsUsed: 0
  }));

  return AdaptiveEngine.getNextDifficulty(baseDifficulty, recentResults);
};

const normalizeDifficultyValue = (difficulty, fallback = 1) => {
  if (typeof difficulty === 'number') {
    return Math.max(1, Math.min(4, Math.round(difficulty)));
  }

  if (typeof difficulty === 'string') {
    const normalized = difficulty.trim().toLowerCase();
    const mapped = {
      easy: 1,
      medium: 2,
      hard: 3,
      boss: 4
    };

    if (mapped[normalized]) {
      return mapped[normalized];
    }
  }

  return fallback;
};

const applyLevelUps = (user) => {
  const previousLevel = user.level;
  const leveledUp = MechanicsService.handleLevelUp(user);
  const levelsGained = user.level - previousLevel;

  if (levelsGained > 0) {
    const currentSpeed = Number(user.playerSpeed || 1.0);
    user.playerSpeed = Math.min(3.0, Number((currentSpeed + (levelsGained * 0.2)).toFixed(1)));
  }

  return {
    leveledUp,
    levelsGained
  };
};

const updateCurrentRegion = (user, npcId) => {
  const regionByNpc = {
    Queen: 'The Outlaw Trail',
    Thief: 'The Crossroads',
    Mountainking: 'The Ridge',
    Archer: 'The Cathedral',
    Bishop: 'The Royal Gate',
    King: 'The Final Arena',
    Mage: 'Map 2 Gateway'
  };

  if (regionByNpc[npcId]) {
    user.currentRegion = regionByNpc[npcId];
  }
};

const buildMentorPrompt = (user, failCount) => {
  if (failCount < 3) {
    return null;
  }

  const collegeLabel = user.collegeID || 'your college';

  return {
    shouldPrompt: true,
    failCount,
    collegeID: user.collegeID || null,
    message: `You seem stuck. A top-ranked senior from ${collegeLabel} is available for a mentor session. Book now?`
  };
};

const loadUser = async (req, res) => {
  const clerkId = getRequestUserId(req);

  if (!clerkId) {
    res.status(401);
    throw new Error('Authenticated hero required');
  }

  const user = await User.findOne({ clerkId });

  if (!user) {
    res.status(404);
    throw new Error('Hero not found');
  }

  return ensureProgressionDefaults(user);
};

const getNpcFromRequest = (req, res) => {
  const npcId = normalizeNpcId(req.params.npcId || req.body?.npcId || req.query?.npcId);

  if (!npcId) {
    res.status(400);
    throw new Error('Unknown Syntax Province NPC');
  }

  return SYNTAX_PROVINCE_NPCS[npcId];
};

const getChallenge = asyncHandler(async (req, res) => {
  const requestedTopic = req.params.topic;
  const user = await loadUser(req, res);
  const requestedNpcId = normalizeNpcId(req.query?.npcId);
  const npc = requestedNpcId ? SYNTAX_PROVINCE_NPCS[requestedNpcId] : null;

  if (npc) {
    const npcStatus = buildNpcStatus(user, npc);
    if (!npcStatus.unlocked) {
      return res.status(403).json({
        message: `${npc.name} is still locked.`,
        npc: npcStatus,
        progression: buildProgressSnapshot(user)
      });
    }

    const lessonBlock = LessonService.getLessonBlockForNpc(user, npc.id);
    if (lessonBlock) {
      return res.status(403).json({
        message: lessonBlock.blockMessage,
        lessonRequired: lessonBlock,
        npc: npcStatus,
        progression: buildProgressSnapshot(user)
      });
    }
  }

  const topic = npc?.topic || requestedTopic;
  const currentDifficulty = npc
    ? getAdaptiveDifficulty(user, npc)
    : Math.min(4, Math.max(1, Math.ceil((user.level + (user.currentStreak || 0)) / 5)));

  // Build player context for AI-adaptive question generation
  const playerContext = {
    level: user.level || 1,
    streak: user.currentStreak || 0,
    mastery: user.mastery?.get?.(topic) || user.mastery?.[topic] || 0,
    questionsAttempted: user.questionsAttempted || 0,
    questionsSolved: user.questionsSolved || 0,
  };

  const question = await AIService.generateQuestion(
    topic,
    currentDifficulty,
    npc?.region || 'Syntax Province',
    playerContext
  );

  return res.json({
    question,
    encounter: npc ? {
      npcId: npc.id,
      topic,
      difficulty: currentDifficulty,
      medalReward: npc.medal || null
    } : null,
    stats: {
      focusEnergy: user.focusEnergy,
      streak: user.currentStreak,
      speed: user.playerSpeed
    }
  });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { isCorrect, topic, difficulty } = req.body;
  const user = await loadUser(req, res);

  let xpGained = 0;
  let focusChange = 0;
  let failureLesson = null;

  const difficultyValue = normalizeDifficultyValue(difficulty, 1);

  // Track total questions attempted
  user.questionsAttempted = (user.questionsAttempted || 0) + 1;

  let droppedItem = null;

  if (isCorrect) {
    // Track questions solved
    user.questionsSolved = (user.questionsSolved || 0) + 1;

    user.streak += 1;
    user.currentStreak = user.streak;
    xpGained = MechanicsService.calculateXPGain(difficultyValue, user.currentStreak);
    focusChange = 20;
    MechanicsService.updateFocusEnergy(user, focusChange);
    user.xp += xpGained;

    // Random item drop chance (30%)
    if (Math.random() < 0.3) {
      const possibleItems = ['Hint Potion', 'Health Potion', 'Focus Refill', 'Speed Token'];
      droppedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

      const existingItem = user.inventory.find(i => i.itemType === droppedItem);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.inventory.push({ itemType: droppedItem, quantity: 1 });
      }
    }

    const currentMastery = user.mastery.get(topic) || 0;
    user.mastery.set(topic, Math.min(100, currentMastery + 5));

    let caughtSkillmon = false;
    if (!user.skillDex.includes(topic)) {
      user.skillDex.push(topic);
      caughtSkillmon = true;
    }

    const { leveledUp, levelsGained } = applyLevelUps(user);
    await user.save();

    return res.json({
      isCorrect,
      xpGained,
      focusChange,
      failureLesson,
      droppedItem,
      caughtSkillmon: caughtSkillmon ? topic : null,
      newStreak: user.currentStreak,
      levelUp: leveledUp,
      levelsGained,
      stats: {
        level: user.level,
        xp: user.xp,
        focusEnergy: user.focusEnergy,
        speed: user.playerSpeed
      }
    });
  }

  user.streak = 0;
  user.currentStreak = 0;
  focusChange = -15;
  MechanicsService.updateFocusEnergy(user, focusChange);
  failureLesson = await AIService.generateLesson(topic);

  await user.save();

  return res.json({
    isCorrect,
    xpGained,
    focusChange,
    failureLesson,
    newStreak: user.currentStreak,
    levelUp: false,
    levelsGained: 0,
    stats: {
      level: user.level,
      xp: user.xp,
      focusEnergy: user.focusEnergy,
      speed: user.playerSpeed
    }
  });
});

const getBossChallenge = asyncHandler(async (req, res) => {
  const user = await loadUser(req, res);
  const requestedNpcId = normalizeNpcId(req.query?.npcId);
  const npc = requestedNpcId ? SYNTAX_PROVINCE_NPCS[requestedNpcId] : null;

  if (npc) {
    const npcStatus = buildNpcStatus(user, npc);
    if (!npcStatus.unlocked) {
      return res.status(403).json({
        message: `${npc.name} is still locked.`,
        npc: npcStatus,
        progression: buildProgressSnapshot(user)
      });
    }

    const lessonBlock = LessonService.getLessonBlockForNpc(user, npc.id);
    if (lessonBlock) {
      return res.status(403).json({
        message: lessonBlock.blockMessage,
        lessonRequired: lessonBlock,
        npc: npcStatus,
        progression: buildProgressSnapshot(user)
      });
    }
  }

  const topic = npc?.topic || req.params.topic;
  const baseDifficulty = npc ? Math.max(2, getAdaptiveDifficulty(user, npc)) : 2;
  const bossQuestions = [];

  // Build player context for AI
  const playerContext = {
    level: user.level || 1,
    streak: user.currentStreak || 0,
    mastery: user.mastery?.get?.(topic) || user.mastery?.[topic] || 0,
  };

  for (let i = 0; i < 3; i += 1) {
    const difficulty = Math.min(4, baseDifficulty + i);
    bossQuestions.push(await AIService.generateQuestion(
      topic,
      difficulty,
      npc?.name || `The ${topic} Overlord`,
      playerContext
    ));
  }

  return res.json({
    bossName: npc?.name || `The ${topic} Overlord`,
    npcId: npc?.id || null,
    phases: bossQuestions,
    rewardPreview: npc?.reward || 'Legendary Loot & +50 Focus Energy'
  });
});

const getLesson = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const user = await loadUser(req, res);
  const lesson = await AIService.generateLesson(topic);

  let xpGained = 0;
  if (!user.learnedTopics.includes(topic)) {
    xpGained = lesson.xpReward || 15;
    user.xp += xpGained;
    user.learnedTopics.push(topic);

    applyLevelUps(user);
    await user.save();
  }

  return res.json({
    lesson,
    reward: xpGained > 0 ? { xp: xpGained, message: 'Intelligence Increased!' } : null,
    stats: {
      level: user.level,
      xp: user.xp,
      learnedCount: user.learnedTopics.length
    }
  });
});

const resolveLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const { action = 'complete' } = req.body || {};
  const user = await loadUser(req, res);

  if (!['complete', 'skip'].includes(action)) {
    return res.status(400).json({ error: 'Lesson action must be complete or skip' });
  }

  const resolution = LessonService.resolveLesson(user, lessonId, action);
  const levelSummary = action === 'complete'
    ? applyLevelUps(user)
    : { leveledUp: false, levelsGained: 0 };

  user.unlockedRegions = buildUnlockedRegions(user);
  await user.save();

  return res.json({
    success: true,
    action,
    lesson: resolution.lesson,
    reward: resolution.reward,
    levelUp: levelSummary.leveledUp,
    levelsGained: levelSummary.levelsGained,
    progression: buildProgressSnapshot(user)
  });
});

const getSyntaxProvinceProgress = asyncHandler(async (req, res) => {
  const user = await loadUser(req, res);

  return res.json({
    progression: buildProgressSnapshot(user),
    npcs: buildNpcStatuses(user)
  });
});

const getNpcInteractionStatus = asyncHandler(async (req, res) => {
  const user = await loadUser(req, res);
  const npc = getNpcFromRequest(req, res);

  return res.json({
    npc: buildNpcStatus(user, npc),
    progression: buildProgressSnapshot(user)
  });
});

const interactWithNpc = asyncHandler(async (req, res) => {
  const user = await loadUser(req, res);
  const npc = getNpcFromRequest(req, res);
  const npcStatus = buildNpcStatus(user, npc);
  const lessonOffer = LessonService.getLessonOfferForNpc(user, npc.id);

  if (!npcStatus.unlocked) {
    return res.status(403).json({
      message: `${npc.name} is blocked by quest progression.`,
      npc: npcStatus,
      progression: buildProgressSnapshot(user)
    });
  }

  if (lessonOffer) {
    return res.json({
      action: 'lesson',
      lesson: lessonOffer,
      npc: npcStatus,
      progression: buildProgressSnapshot(user)
    });
  }

  if (BATTLE_NPC_KINDS.has(npc.kind)) {
    return res.json({
      action: 'battle',
      npc: npcStatus,
      challenge: {
        topic: npc.topic,
        difficulty: getAdaptiveDifficulty(user, npc)
      },
      progression: buildProgressSnapshot(user)
    });
  }

  let reward = null;

  switch (npc.id) {
    case 'pappa_heroka':
      user.questFlags.movementUnlocked = true;
      addUnique(user.completedNpcInteractions, npc.id);
      reward = npc.reward;
      break;
    case 'Queen':
      user.questFlags.codeDexUnlocked = true;
      addUnique(user.completedNpcInteractions, npc.id);
      addUnique(user.skillDex, 'Code-Dex');
      reward = npc.reward;
      break;
    case 'Normalnun':
      user.focusEnergy = 1000;
      reward = npc.reward;
      break;
    case 'Alchemist':
    case 'Butcher':
      addUnique(user.completedNpcInteractions, npc.id);
      addUnique(user.learnedTopics, npc.topic);
      reward = npc.reward;
      break;
    case 'King':
      user.questFlags.kingGateCleared = true;
      addUnique(user.completedNpcInteractions, npc.id);
      reward = npc.reward;
      break;
    case 'Princess':
      user.questFlags.princessAudienceGranted = true;
      addUnique(user.completedNpcInteractions, npc.id);
      reward = npc.reward;
      break;
    default:
      addUnique(user.completedNpcInteractions, npc.id);
      reward = npc.reward;
      break;
  }

  updateCurrentRegion(user, npc.id);
  user.unlockedRegions = buildUnlockedRegions(user);
  await user.save();

  return res.json({
    action: npc.kind,
    reward,
    npc: buildNpcStatus(user, npc),
    progression: buildProgressSnapshot(user)
  });
});

const resolveNpcBattle = asyncHandler(async (req, res) => {
  const { outcome, difficulty, caughtConcept } = req.body;
  const user = await loadUser(req, res);
  const npc = getNpcFromRequest(req, res);
  const npcStatus = buildNpcStatus(user, npc);

  if (!BATTLE_NPC_KINDS.has(npc.kind)) {
    return res.status(400).json({
      message: `${npc.name} does not use battle resolution.`,
      npc: npcStatus
    });
  }

  if (!npcStatus.unlocked) {
    return res.status(403).json({
      message: `${npc.name} is blocked by quest progression.`,
      npc: npcStatus,
      progression: buildProgressSnapshot(user)
    });
  }

  const difficultyValue = normalizeDifficultyValue(difficulty, npc.baseDifficulty || 1);
  let xpGained = 0;
  let focusChange = 0;
  let failureLesson = null;
  let mentorPrompt = null;
  let droppedItem = null;
  let levelSummary = { leveledUp: false, levelsGained: 0 };

  if (outcome === 'win') {
    user.streak += 1;
    user.currentStreak = user.streak;
    xpGained = MechanicsService.calculateXPGain(difficultyValue, user.currentStreak, npc.kind === 'boss');
    focusChange = npc.kind === 'boss' ? 50 : 30;
    MechanicsService.updateFocusEnergy(user, focusChange);
    user.xp += xpGained;

    addUnique(user.bossesDefeated, npc.id);
    addUnique(user.completedNpcInteractions, npc.id);

    if (npc.medal) {
      addUnique(user.medalsCount, npc.medal);
    }

    // Random item drop logic on Boss/Mini-Boss defeat
    const possibleItems = ['XP Multiplier Crystal', 'Hint Revealer', 'Topic Revealer', 'Luck Charm'];
    droppedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    const existingItem = user.inventory.find(i => i.itemType === droppedItem);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.inventory.push({ itemType: droppedItem, quantity: 1 });
    }

    addUnique(user.skillDex, caughtConcept || npc.topic);
    user.npcFailureCounts[npc.id] = 0;

    if (npc.id === 'Mage') {
      user.questFlags.syntaxProvinceCompleted = true;
      addUnique(user.titles, npc.reward);
    }

    updateCurrentRegion(user, npc.id);
    user.unlockedRegions = buildUnlockedRegions(user);
    levelSummary = applyLevelUps(user);
  } else {
    user.streak = 0;
    user.currentStreak = 0;
    focusChange = difficultyValue >= 3 ? -25 : -15;
    MechanicsService.updateFocusEnergy(user, focusChange);

    const currentFailCount = Number(user.npcFailureCounts[npc.id] || 0) + 1;
    user.npcFailureCounts[npc.id] = currentFailCount;

    failureLesson = await AIService.generateLesson(npc.topic, difficultyValue);
    mentorPrompt = buildMentorPrompt(user, currentFailCount);
  }

  await user.save();

  return res.json({
    npc: buildNpcStatus(user, npc),
    outcome,
    xpGained,
    focusChange,
    failureLesson,
    mentorPrompt,
    droppedItem,
    medalAwarded: outcome === 'win' ? (npc.medal || null) : null,
    reward: outcome === 'win' ? (npc.reward || null) : null,
    levelUp: levelSummary.leveledUp,
    levelsGained: levelSummary.levelsGained,
    progression: buildProgressSnapshot(user)
  });
});

const consumeItem = asyncHandler(async (req, res) => {
  const { itemType } = req.body;
  const user = await loadUser(req, res);

  if (!user.inventory || user.inventory.length === 0) {
    return res.status(400).json({ message: "Inventory is empty." });
  }

  const itemIndex = user.inventory.findIndex(i => i.itemType === itemType);
  if (itemIndex === -1 || user.inventory[itemIndex].quantity <= 0) {
    return res.status(400).json({ message: `You do not have any ${itemType} left.` });
  }

  // Effect Application
  let effectMessage = "";
  switch (itemType) {
    case 'Focus Refill':
    case 'Health Potion':
      MechanicsService.updateFocusEnergy(user, 100);
      effectMessage = "Energy fully restored!";
      break;
    case 'Speed Token':
      user.playerSpeed = Math.min(3.0, (user.playerSpeed || 1.0) + 0.2);
      effectMessage = "Player speed permanently increased!";
      break;
    case 'Hint Potion':
    case 'Hint Revealer':
    case 'Topic Revealer':
      effectMessage = "You feel more enlightened! Next battle will be slightly easier.";
      break;
    case 'XP Multiplier Crystal':
      user.xp += 100;
      effectMessage = "Earned 100 bonus XP!";
      break;
    case 'Luck Charm':
      effectMessage = "Item drop chances temporarily increased! (Coming Soon)";
      break;
    default:
      effectMessage = `${itemType} consumed!`;
      break;
  }

  user.inventory[itemIndex].quantity -= 1;
  if (user.inventory[itemIndex].quantity === 0) {
    user.inventory.splice(itemIndex, 1);
  }

  MechanicsService.handleLevelUp(user);
  await user.save();

  return res.json({
    success: true,
    message: effectMessage,
    inventory: user.inventory,
    stats: {
      level: user.level,
      xp: user.xp,
      focusEnergy: user.focusEnergy,
      speed: user.playerSpeed
    }
  });
});

const chatWithSupport = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const user = await loadUser(req, res);

  const response = AIService.getSupportResponse
    ? await AIService.getSupportResponse(message, user)
    : `Bit is recalibrating. Current region: ${user.currentRegion}. Keep pushing through Syntax Province.`;

  return res.json({
    sprite: 'Bit',
    response,
    timestamp: new Date()
  });
});

const getHint = asyncHandler(async (req, res) => {
  const { questionText, topic, difficulty, hintLevel } = req.body;
  const user = await loadUser(req, res);

  const hint = await AIService.generateHintForQuestion(
    questionText || 'General question',
    topic || 'syntax',
    difficulty || 1,
    hintLevel || 1
  );

  return res.json({ hint });
});

module.exports = {
  getChallenge,
  submitAnswer,
  getBossChallenge,
  getLesson,
  resolveLesson,
  getSyntaxProvinceProgress,
  getNpcInteractionStatus,
  interactWithNpc,
  resolveNpcBattle,
  consumeItem,
  chatWithSupport,
  getHint
};
