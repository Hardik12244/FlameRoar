/**
 * GameSyncService — Central frontend sync layer.
 *
 * The backend is the source of truth. This service provides clean
 * functions to fetch and refresh every slice of game state, so that
 * components never hold stale data after important actions.
 *
 * Usage pattern:
 *   1. Component performs an action (battle win, NPC interact, item use).
 *   2. Component calls the relevant sync function(s) here.
 *   3. Sync function fetches latest data from the backend.
 *   4. Returns the fresh data so the component / context can update state.
 */

import { api, UserService, GameService } from './api';

// ──────────────────────────────────────────────
// 1. Profile & Stats
// ──────────────────────────────────────────────

/**
 * Fetch the full user profile from the backend.
 * Returns the full user object (level, xp, focusEnergy, medals, inventory, etc.)
 */
export async function fetchProfile() {
  try {
    const { data } = await UserService.getProfile();
    return { success: true, data };
  } catch (err) {
    console.error('[Sync] fetchProfile failed:', err);
    return { success: false, data: null, error: err };
  }
}

// ──────────────────────────────────────────────
// 2. Story Progression
// ──────────────────────────────────────────────

/**
 * Fetch the full Syntax Province progression snapshot:
 * currentRegion, questFlags, medals, unlockedRegions, NPC statuses, etc.
 */
export async function fetchProgression() {
  try {
    const { data } = await GameService.getSyntaxProvinceProgress();
    return { success: true, data };
  } catch (err) {
    console.error('[Sync] fetchProgression failed:', err);
    return { success: false, data: null, error: err };
  }
}

/**
 * Fetch a single NPC's interaction/unlock status.
 */
export async function fetchNpcStatus(npcId) {
  try {
    const { data } = await GameService.getNpcInteractionStatus(npcId);
    return { success: true, data };
  } catch (err) {
    console.error(`[Sync] fetchNpcStatus(${npcId}) failed:`, err);
    return { success: false, data: null, error: err };
  }
}

// ──────────────────────────────────────────────
// 3. Leaderboard
// ──────────────────────────────────────────────

/**
 * Fetch leaderboard data.  Accepts optional track and collegeID filters.
 */
export async function fetchLeaderboard(params = {}) {
  try {
    const { data } = await UserService.getLeaderboard(params);
    return { success: true, data: data?.data || [], count: data?.count || 0 };
  } catch (err) {
    console.error('[Sync] fetchLeaderboard failed:', err);
    return { success: false, data: [], count: 0, error: err };
  }
}

// ──────────────────────────────────────────────
// 4. Composite Sync Helpers
//    One-call refreshes for common game events.
// ──────────────────────────────────────────────

/**
 * Refresh everything — profile + progression.
 * Called after major events like boss wins, medal gains, etc.
 * Returns { profile, progression }.
 */
export async function syncAfterMajorEvent() {
  const [profileResult, progressionResult] = await Promise.all([
    fetchProfile(),
    fetchProgression(),
  ]);

  return {
    profile: profileResult,
    progression: progressionResult,
  };
}

/**
 * Refresh after a battle win.
 * Fetches profile (stats, inventory, skillDex all come from profile).
 */
export async function syncAfterBattleWin() {
  return fetchProfile();
}

/**
 * Refresh after a battle loss.
 * Profile still changes (streak resets, focus drops).
 */
export async function syncAfterBattleLoss() {
  return fetchProfile();
}

/**
 * Refresh after an NPC interaction.
 * Profile changes (questFlags, completedNpcInteractions, etc.)
 */
export async function syncAfterNpcInteraction() {
  return fetchProfile();
}

/**
 * Refresh after consuming an inventory item.
 * The consume endpoint already returns updated inventory + stats,
 * but we also do a full profile refresh for safety.
 */
export async function syncAfterItemConsume() {
  return fetchProfile();
}

/**
 * Refresh after answering a question (wild encounter).
 * Profile changes (XP, streak, skillDex, mastery, possible item drop).
 */
export async function syncAfterQuestionAnswer() {
  return fetchProfile();
}

// ──────────────────────────────────────────────
// 5. Utility — Build Phaser Progress Object
//    Converts a backend user object into the format
//    Phaser's MainScene expects.
// ──────────────────────────────────────────────

const MEDAL_TOKEN_BY_LABEL = {
  'Identity Medal': 'medal_identity',
  'Logic Medal': 'medal_logic',
  'Decision Medal': 'medal_decision',
  'Cycle Medal': 'medal_cycle',
};

/**
 * Convert a backend user object into a Phaser-compatible progress payload.
 */
export function buildPhaserProgress(user) {
  if (!user) {
    return { exploredTiles: [], medals: [], flags: [] };
  }

  const questFlags = user.questFlags || {};
  const medals = (user.medalsCount || [])
    .map((medal) => MEDAL_TOKEN_BY_LABEL[medal])
    .filter(Boolean);

  const flags = [];
  if (questFlags.movementUnlocked) flags.push('tutorial_completed');
  if (questFlags.codeDexUnlocked) flags.push('codedex_unlocked');
  if (questFlags.kingGateCleared) flags.push('castle_key');
  if (questFlags.princessAudienceGranted) flags.push('princess_audience');
  if (questFlags.syntaxProvinceCompleted) flags.push('map_1_complete');

  return {
    exploredTiles: user.exploredTiles || [],
    medals,
    flags,
    questFlags: user.questFlags || {},
    lessonState: user.lessonState || null,
    completedInteractions: user.completedNpcInteractions || user.completedInteractions || [],
  };
}

// ──────────────────────────────────────────────
// 6. Debounced explore sync
// ──────────────────────────────────────────────

let pendingChunks = [];
let exploreTimerId = null;

/**
 * Queue a chunk for batched exploration sync.
 * Sends all pending chunks to the backend every 5 seconds.
 */
export function queueExploreChunk(chunkKey) {
  if (!chunkKey || pendingChunks.includes(chunkKey)) {
    return;
  }

  pendingChunks.push(chunkKey);

  if (!exploreTimerId) {
    exploreTimerId = setTimeout(flushExploreChunks, 5000);
  }
}

async function flushExploreChunks() {
  exploreTimerId = null;

  const chunksToSend = [...pendingChunks];
  pendingChunks = [];

  // Send each chunk. The backend handles deduplication.
  for (const chunkKey of chunksToSend) {
    try {
      await UserService.saveExploredChunk(chunkKey);
    } catch (err) {
      console.warn(`[Sync] Failed to save explored chunk ${chunkKey}:`, err);
    }
  }
}

/**
 * Force-flush any pending exploration chunks (e.g. on unmount).
 */
export function flushPendingExploration() {
  if (exploreTimerId) {
    clearTimeout(exploreTimerId);
    exploreTimerId = null;
  }

  if (pendingChunks.length > 0) {
    flushExploreChunks();
  }
}
