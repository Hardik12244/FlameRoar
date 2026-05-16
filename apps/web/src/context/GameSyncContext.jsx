import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  fetchProfile,
  fetchProgression,
  fetchLeaderboard,
  syncAfterMajorEvent,
  buildPhaserProgress,
  queueExploreChunk,
  flushPendingExploration,
} from '../services/gameSyncService';

const GameSyncContext = createContext(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function GameSyncProvider({ children }) {
  const { user, setUser } = useAuth();

  // Sync status flags
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Progression snapshot (from /game/progression/syntax-province)
  const [progression, setProgression] = useState(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);

  // Mounted guard to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      flushPendingExploration();
    };
  }, []);

  // ── Core refresh: pulls profile from backend → updates user state ──

  const refreshProfile = useCallback(async () => {
    const result = await fetchProfile();
    if (!mountedRef.current) return result;

    if (result.success && result.data) {
      setUser(result.data);
      setSyncError(null);
    } else {
      setSyncError(result.error);
    }

    return result;
  }, [setUser]);

  // ── Refresh progression snapshot ──

  const refreshProgression = useCallback(async () => {
    const result = await fetchProgression();
    if (!mountedRef.current) return result;

    if (result.success && result.data) {
      setProgression(result.data);
      setSyncError(null);
    } else {
      setSyncError(result.error);
    }

    return result;
  }, []);

  // ── Refresh leaderboard ──

  const refreshLeaderboard = useCallback(async () => {
    const result = await fetchLeaderboard();
    if (!mountedRef.current) return result;

    if (result.success && result.data) {
      setLeaderboard(result.data);
    }
    return result;
  }, []);

  // ── Full sync: profile + progression ──

  const fullSync = useCallback(async () => {
    if (!mountedRef.current) return;

    setSyncing(true);
    setSyncError(null);

    try {
      const { profile, progression: prog } = await syncAfterMajorEvent();
      const lead = await fetchLeaderboard();

      if (!mountedRef.current) return;

      if (profile.success && profile.data) {
        setUser(profile.data);
      }

      if (prog.success && prog.data) {
        setProgression(prog.data);
      }

      if (lead.success && lead.data) {
        setLeaderboard(lead.data);
      }

      if (!profile.success || !prog.success) {
        setSyncError(profile.error || prog.error);
      }

      setLastSyncTime(Date.now());
    } catch (err) {
      if (mountedRef.current) {
        setSyncError(err);
      }
    } finally {
      if (mountedRef.current) {
        setSyncing(false);
      }
    }
  }, [setUser]);

  // ── Shared helper to refresh all game state ──

  const refreshAllGameState = useCallback(async () => {
    if (!mountedRef.current) return;
    setSyncing(true);
    try {
      const [profileResult, progResult, leadResult] = await Promise.all([
        fetchProfile(),
        fetchProgression(),
        fetchLeaderboard()
      ]);

      if (!mountedRef.current) return;

      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data);
        window.dispatchEvent(
          new CustomEvent('phaser:initProgression', {
            detail: buildPhaserProgress(profileResult.data),
          })
        );
      }
      if (progResult.success && progResult.data) {
        setProgression(progResult.data);
      }
      if (leadResult.success && leadResult.data) {
        setLeaderboard(leadResult.data);
      }
      setLastSyncTime(Date.now());
      setSyncError(null);
    } catch (err) {
      if (mountedRef.current) setSyncError(err);
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [setUser]);

  // ── Event-specific syncs ──

  /**
   * Call after a battle win.
   * Refreshes profile (which contains inventory, skillDex, stats, medals, etc.)
   * and pushes updated progress to Phaser.
   */
  const syncAfterBattle = useCallback(async (outcome) => {
    setSyncing(true);

    try {
      const result = await fetchProfile();
      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setUser(result.data);

        // Push updated progress to Phaser game
        window.dispatchEvent(
          new CustomEvent('phaser:initProgression', {
            detail: buildPhaserProgress(result.data),
          })
        );
      }

      // For wins, also refresh progression for NPC unlock states
      if (outcome === 'win') {
        const progResult = await fetchProgression();
        if (mountedRef.current && progResult.success) {
          setProgression(progResult.data);
        }
      }

      setLastSyncTime(Date.now());
      setSyncError(null);
    } catch (err) {
      if (mountedRef.current) setSyncError(err);
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [setUser]);

  /**
   * Call after an NPC interaction (dialogue, quest flag, gate pass).
   * Refreshes the full profile to get updated questFlags, completedNpcInteractions, etc.
   */
  const syncAfterNpc = useCallback(async () => {
    try {
      const result = await fetchProfile();
      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setUser(result.data);

        // Push updated progress to Phaser so NPC unlock states refresh
        window.dispatchEvent(
          new CustomEvent('phaser:initProgression', {
            detail: buildPhaserProgress(result.data),
          })
        );
      }

      setLastSyncTime(Date.now());
    } catch (err) {
      if (mountedRef.current) setSyncError(err);
    }
  }, [setUser]);

  /**
   * Call after consuming an inventory item.
   * The backend returns partial data, but we fetch the full profile for safety.
   */
  const syncAfterItemUse = useCallback(async () => {
    try {
      const result = await fetchProfile();
      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setUser(result.data);
      }

      setLastSyncTime(Date.now());
    } catch (err) {
      if (mountedRef.current) setSyncError(err);
    }
  }, [setUser]);

  /**
   * Call after a question answer (wild encounter) succeeds or fails.
   * Refreshes the full profile to capture XP, streak, skillDex, mastery, item drops.
   */
  const syncAfterQuestion = useCallback(async () => {
    try {
      const result = await fetchProfile();
      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setUser(result.data);

        window.dispatchEvent(
          new CustomEvent('phaser:initProgression', {
            detail: buildPhaserProgress(result.data),
          })
        );
      }

      setLastSyncTime(Date.now());
    } catch (err) {
      if (mountedRef.current) setSyncError(err);
    }
  }, [setUser]);

  /**
   * Queue a map exploration chunk for batched backend sync.
   */
  const syncExploreChunk = useCallback((chunkKey) => {
    queueExploreChunk(chunkKey);

    // Optimistic local update (fast feedback, backend catches up)
    setUser((prev) => {
      if (!prev) return prev;
      const explored = prev.exploredTiles || [];
      if (explored.includes(chunkKey)) return prev;

      return {
        ...prev,
        exploredTiles: [...explored, chunkKey],
        xp: (prev.xp || 0) + 5,
        focusEnergy: Math.min(1000, (prev.focusEnergy || 100) + 1),
      };
    });
  }, [setUser]);

  /**
   * Push current user progress into Phaser game engine.
   * Should be called once Phaser is ready and whenever progress changes.
   */
  const pushProgressToPhaser = useCallback(() => {
    if (!user) return;

    window.dispatchEvent(
      new CustomEvent('phaser:initProgression', {
        detail: buildPhaserProgress(user),
      })
    );
  }, [user]);

  // ── Initial load: full sync on mount ──

  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (user && !initialSyncDone.current) {
      initialSyncDone.current = true;
      refreshProgression();
      refreshLeaderboard();
    }
  }, [user, refreshProgression, refreshLeaderboard]);

  // ── Context value ──

  const value = useMemo(
    () => ({
      // State
      syncing,
      lastSyncTime,
      syncError,
      progression,
      leaderboard,

      // Sync functions
      refreshProfile,
      refreshProgression,
      refreshLeaderboard,
      refreshAllGameState,
      fullSync,
      syncAfterBattle,
      syncAfterNpc,
      syncAfterItemUse,
      syncAfterQuestion,
      syncExploreChunk,
      pushProgressToPhaser,
    }),
    [
      syncing,
      lastSyncTime,
      syncError,
      progression,
      leaderboard,
      refreshProfile,
      refreshProgression,
      refreshLeaderboard,
      refreshAllGameState,
      fullSync,
      syncAfterBattle,
      syncAfterNpc,
      syncAfterItemUse,
      syncAfterQuestion,
      syncExploreChunk,
      pushProgressToPhaser,
    ]
  );

  return (
    <GameSyncContext.Provider value={value}>
      {children}
    </GameSyncContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useGameSync() {
  const ctx = useContext(GameSyncContext);
  if (!ctx) {
    throw new Error('useGameSync must be used within a GameSyncProvider');
  }
  return ctx;
}
