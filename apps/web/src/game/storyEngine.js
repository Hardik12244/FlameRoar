/**
 * storyEngine.js — Central story progression state machine.
 *
 * Defines the full chapter chain for Syntax Province and provides
 * helpers to determine current chapter, objectives, and progression.
 *
 * The chapter chain:
 *   1. The Tutorial        — Pappa teaches movement
 *   2. The Queen's Quest   — Queen gives Code-Dex, sets mission
 *   3. The Thief's Trial   — Wild encounters begin, defeat Thief
 *   4. Operators Mastery   — Defeat Mountain King
 *   5. Conditional Trials  — Defeat Archer
 *   6. The Loop Cathedral  — Defeat Bishop
 *   7. The Royal Gate      — King grants access
 *   8. The Final Trial     — Princess gate → Mage boss battle
 */

// ─── Chapter Definitions ────────────────────────────────────────

export const CHAPTERS = [
  {
    id: 'ch1_tutorial',
    number: 1,
    title: 'The Tutorial',
    subtitle: 'Learn the basics',
    objective: 'Talk to Pappa Heroka to learn how to move.',
    completedText: 'Movement unlocked! Head to the Queen.',
    requiredFlags: [],
    requiredMedals: [],
    completionFlag: 'tutorial_completed',
    npcsInvolved: ['pappa_heroka'],
    region: 'The Academy',
    icon: '📜',
  },
  {
    id: 'ch2_queens_quest',
    number: 2,
    title: "The Queen's Quest",
    subtitle: 'Receive the Code-Dex',
    objective: 'Speak with the Queen to receive the Code-Dex and your mission.',
    completedText: 'Code-Dex received! The Thief awaits in the North-East.',
    requiredFlags: ['tutorial_completed'],
    requiredMedals: [],
    completionFlag: 'codedex_unlocked',
    npcsInvolved: ['Queen'],
    region: 'The Academy',
    icon: '👑',
  },
  {
    id: 'ch3_thief_trial',
    number: 3,
    title: "The Thief's Trial",
    subtitle: 'Variables & Data Types',
    objective: 'Explore the wild, solve encounters, and defeat the Thief to earn the Identity Medal.',
    completedText: 'Identity Medal earned! The Mountain King is next.',
    requiredFlags: ['codedex_unlocked'],
    requiredMedals: [],
    completionFlag: 'medal_identity',
    completionIsMedal: true,
    npcsInvolved: ['Thief'],
    region: 'The Outlaw Trail',
    icon: '🗡️',
  },
  {
    id: 'ch4_operators',
    number: 4,
    title: 'Operators Mastery',
    subtitle: 'Operators & Expressions',
    objective: 'Challenge the Mountain King and prove your logic to earn the Logic Medal.',
    completedText: 'Logic Medal earned! The Archer awaits at the ridge.',
    requiredFlags: [],
    requiredMedals: ['medal_identity'],
    completionFlag: 'medal_logic',
    completionIsMedal: true,
    npcsInvolved: ['Mountainking'],
    region: 'The Crossroads',
    icon: '⚔️',
  },
  {
    id: 'ch5_conditionals',
    number: 5,
    title: 'Conditional Trials',
    subtitle: 'If/Else Mastery',
    objective: 'Defeat the Archer and earn the Decision Medal.',
    completedText: 'Decision Medal earned! The Cathedral awaits.',
    requiredFlags: [],
    requiredMedals: ['medal_logic'],
    completionFlag: 'medal_decision',
    completionIsMedal: true,
    npcsInvolved: ['Archer'],
    region: 'The Ridge',
    icon: '🏹',
  },
  {
    id: 'ch6_loops',
    number: 6,
    title: 'The Loop Cathedral',
    subtitle: 'For/While Loops',
    objective: 'Break free from the Bishop\'s loops and earn the Cycle Medal.',
    completedText: 'Cycle Medal earned! The King waits at the Royal Gate.',
    requiredFlags: [],
    requiredMedals: ['medal_decision'],
    completionFlag: 'medal_cycle',
    completionIsMedal: true,
    npcsInvolved: ['Bishop'],
    region: 'The Cathedral',
    icon: '🔄',
  },
  {
    id: 'ch7_royal_gate',
    number: 7,
    title: 'The Royal Gate',
    subtitle: 'Prove your worth',
    objective: 'Present all 4 medals to the King and gain access to the Final Arena.',
    completedText: 'The Castle Key is yours! Enter the Final Arena.',
    requiredFlags: [],
    requiredMedals: ['medal_cycle'],
    completionFlag: 'castle_key',
    npcsInvolved: ['King'],
    region: 'The Royal Gate',
    icon: '🏰',
  },
  {
    id: 'ch8_final_trial',
    number: 8,
    title: 'The Final Trial',
    subtitle: 'Master of Syntax',
    objective: 'Pass through the Princess gate and defeat the Mage to complete the Province of Syntax.',
    completedText: 'You have mastered the Province of Syntax! Map 2 awaits!',
    requiredFlags: ['castle_key'],
    requiredMedals: [],
    completionFlag: 'map_1_complete',
    npcsInvolved: ['Princess', 'Mage'],
    region: 'The Final Arena',
    icon: '🧙',
  },
];

// ─── Medal token map ────────────────────────────────────────────

const MEDAL_TOKEN_BY_LABEL = {
  'Identity Medal': 'medal_identity',
  'Logic Medal': 'medal_logic',
  'Decision Medal': 'medal_decision',
  'Cycle Medal': 'medal_cycle',
};

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Build a flat set of progress tokens from the user object.
 * Includes both quest flags and medal tokens.
 */
export function buildProgressTokens(user) {
  const tokens = new Set();

  if (!user) return tokens;

  // Quest flags → tokens
  const questFlags = user.questFlags || {};
  if (questFlags.movementUnlocked) tokens.add('tutorial_completed');
  if (questFlags.codeDexUnlocked) tokens.add('codedex_unlocked');
  if (questFlags.kingGateCleared) tokens.add('castle_key');
  if (questFlags.princessAudienceGranted) tokens.add('princess_audience');
  if (questFlags.syntaxProvinceCompleted) tokens.add('map_1_complete');

  // Medals → tokens (from raw user model or mapped object)
  const userMedals = user.medals || user.medalsCount || [];
  userMedals.forEach((tokenOrLabel) => {
    if (MEDAL_TOKEN_BY_LABEL[tokenOrLabel]) {
      tokens.add(MEDAL_TOKEN_BY_LABEL[tokenOrLabel]);
    } else {
      tokens.add(tokenOrLabel); // fallback if already mapped
    }
  });

  return tokens;
}

/**
 * Check if a chapter is complete given the user's progress tokens.
 */
export function isChapterComplete(chapter, progressTokens) {
  return progressTokens.has(chapter.completionFlag);
}

/**
 * Check if a chapter is unlocked (its prerequisites are met).
 */
export function isChapterUnlocked(chapter, progressTokens) {
  const flagsMet = chapter.requiredFlags.every((f) => progressTokens.has(f));
  const medalsMet = chapter.requiredMedals.every((m) => progressTokens.has(m));
  return flagsMet && medalsMet;
}

/**
 * Get the current active chapter for the user.
 * Returns the first chapter that is unlocked but not yet completed.
 * If all chapters are complete, returns the last chapter.
 */
export function getCurrentChapter(user) {
  const tokens = buildProgressTokens(user);

  for (const chapter of CHAPTERS) {
    if (!isChapterComplete(chapter, tokens)) {
      // This chapter is not done yet
      if (isChapterUnlocked(chapter, tokens)) {
        return { chapter, status: 'active', tokens };
      }
      // The chapter isn't unlocked yet — the player is between chapters
      return { chapter, status: 'locked', tokens };
    }
  }

  // All chapters complete
  return {
    chapter: CHAPTERS[CHAPTERS.length - 1],
    status: 'complete',
    tokens,
  };
}

/**
 * Get all chapters with their current status for the user.
 */
export function getAllChaptersStatus(user) {
  const tokens = buildProgressTokens(user);
  let foundActive = false;

  return CHAPTERS.map((chapter) => {
    const complete = isChapterComplete(chapter, tokens);
    const unlocked = isChapterUnlocked(chapter, tokens);

    let status = 'locked';
    if (complete) {
      status = 'complete';
    } else if (unlocked && !foundActive) {
      status = 'active';
      foundActive = true;
    }

    return { ...chapter, status };
  });
}

/**
 * Get a display-friendly objective string for the current state.
 */
export function getCurrentObjective(user, lessonState = null) {
  if (lessonState?.needsMentorVisit && lessonState.currentLesson) {
    return {
      chapterTitle: lessonState.currentLesson.chapterTitle || 'Mentor Lesson',
      chapterNumber: lessonState.currentLesson.chapterNumber || '?',
      objective: lessonState.currentLesson.objective,
      icon: '📘',
      isComplete: false,
    };
  }

  const { chapter, status } = getCurrentChapter(user);

  if (status === 'complete') {
    return {
      chapterTitle: chapter.title,
      chapterNumber: chapter.number,
      objective: chapter.completedText,
      icon: '✅',
      isComplete: true,
    };
  }

  return {
    chapterTitle: chapter.title,
    chapterNumber: chapter.number,
    objective: status === 'active' ? chapter.objective : `Complete previous chapters to unlock: ${chapter.title}`,
    icon: chapter.icon,
    isComplete: false,
  };
}
