// Progress tracking utilities for Piano Triads app

import { writable } from 'svelte/store';

export interface SessionStats {
  totalRounds: number;
  successfulRounds: number;
  failedRounds: number;
  currentStreak: number;
  bestStreak: number;
  averageTime?: number; // For timed activities
  lastPlayed: string; // ISO date string
}

export interface ModuleProgress {
  chordPractice: SessionStats;
  chordQuiz: SessionStats;
  pitchTraining: {
    notes: SessionStats;
    chords: SessionStats;
    lastMode: 'note' | 'chord';
    lastPlayed: string;
  };
  musicReading: {
    trebleClef: SessionStats;
    bassClef: SessionStats;
    bothClef: SessionStats;
    lastMode: 'treble' | 'bass' | 'both';
    lastPlayed: string;
  };
}

// One entry per calendar day the user practised, keyed 'YYYY-MM-DD' in local time.
// Lifetime counters alone can't show a trend, so this is what the progress chart and the
// daily streak are built from.
export interface DailyStat {
  rounds: number;
  successes: number;
  seconds: number;
}

// Per-item accuracy, keyed '<practiceKey>:<itemId>' (e.g. 'chordPractice:CM').
// Practice modes previously drew items with a uniform Math.random(), so a chord you always
// miss came up exactly as often as one you always get. This is what lets selection lean
// toward weak items.
export interface ItemStat {
  seen: number;
  correct: number;
}

export type PracticeKey = 'chordPractice' | 'pitchNote' | 'pitchChord' | 'scoreNote' | 'chordQuiz';

export type Difficulty = 'relaxed' | 'standard' | 'challenge';

export interface Preferences {
  difficulty: Difficulty;
}

// Per-mode round timer and mistake cap for each difficulty. 'standard' matches the values
// that were previously hard-coded in each practice page, so existing users notice no change.
// Pitch training's note mode always fails on the first wrong guess (it's identification, not
// construction), so only its timer varies; the mistake cap applies to chord mode.
export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  Record<
    'chordPractice' | 'pitchTraining' | 'musicReading' | 'chordQuiz',
    { seconds: number; mistakes: number }
  >
> = {
  relaxed: {
    chordPractice: { seconds: 60, mistakes: 5 },
    pitchTraining: { seconds: 30, mistakes: 5 },
    musicReading: { seconds: 40, mistakes: 5 },
    chordQuiz: { seconds: 30, mistakes: 5 }
  },
  standard: {
    chordPractice: { seconds: 30, mistakes: 3 },
    pitchTraining: { seconds: 15, mistakes: 3 },
    musicReading: { seconds: 20, mistakes: 3 },
    chordQuiz: { seconds: 15, mistakes: 3 }
  },
  challenge: {
    chordPractice: { seconds: 15, mistakes: 2 },
    pitchTraining: { seconds: 8, mistakes: 2 },
    musicReading: { seconds: 10, mistakes: 2 },
    chordQuiz: { seconds: 8, mistakes: 2 }
  }
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  relaxed: 'Relaxed',
  standard: 'Standard',
  challenge: 'Challenge'
};

export interface UserProgress {
  modules: ModuleProgress;
  achievements: Achievement[];
  totalPlayTime: number; // in minutes
  lastActive: string; // ISO date string
  dailyStats: Record<string, DailyStat>;
  itemStats: Record<string, ItemStat>;
  preferences: Preferences;
  // Best score per survival-capable mode, keyed by module name (e.g. 'chordPractice').
  bestSurvival: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string; // ISO date string
  category: 'practice' | 'learning' | 'streak' | 'mastery';
}

// Default progress structure
export function getDefaultProgress(): UserProgress {
  const now = new Date().toISOString();
  return {
    modules: {
      chordPractice: {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageTime: 0,
        lastPlayed: now
      },
      chordQuiz: {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageTime: 0,
        lastPlayed: now
      },
      pitchTraining: {
        notes: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: now
        },
        chords: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: now
        },
        lastMode: 'note',
        lastPlayed: now
      },
      musicReading: {
        trebleClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: now
        },
        bassClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: now
        },
        bothClef: {
          totalRounds: 0,
          successfulRounds: 0,
          failedRounds: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          lastPlayed: now
        },
        lastMode: 'both',
        lastPlayed: now
      }
    },
    achievements: [],
    totalPlayTime: 0,
    lastActive: now,
    dailyStats: {},
    itemStats: {},
    preferences: { difficulty: 'standard' },
    bestSurvival: {}
  };
}

/** Local-time day key. Deliberately not UTC — a practice session belongs to the user's day. */
export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Roughly a year of history is plenty for the chart and keeps localStorage small.
const MAX_DAILY_ENTRIES = 365;

/** Fold one finished round into today's bucket, pruning anything beyond the retention window. */
export function recordDailyActivity(
  progress: UserProgress,
  wasSuccessful: boolean,
  timeSpentSeconds: number
): UserProgress {
  const key = toDayKey(new Date());
  const dailyStats = { ...(progress.dailyStats ?? {}) };
  const today = dailyStats[key] ?? { rounds: 0, successes: 0, seconds: 0 };

  dailyStats[key] = {
    rounds: today.rounds + 1,
    successes: today.successes + (wasSuccessful ? 1 : 0),
    seconds: today.seconds + timeSpentSeconds
  };

  const keys = Object.keys(dailyStats).sort();
  if (keys.length > MAX_DAILY_ENTRIES) {
    for (const stale of keys.slice(0, keys.length - MAX_DAILY_ENTRIES)) {
      delete dailyStats[stale];
    }
  }

  return { ...progress, dailyStats };
}

/**
 * Consecutive days practised, counting back from today. A day that is still in progress does
 * not break the streak, so we start from yesterday when there is nothing recorded today yet.
 */
export function getDailyStreak(progress: UserProgress): number {
  const dailyStats = progress.dailyStats ?? {};
  const cursor = new Date();

  if (!dailyStats[toDayKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dailyStats[toDayKey(cursor)]) return 0;
  }

  let streak = 0;
  while (dailyStats[toDayKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The last `days` days, oldest first, with zero-filled gaps so charts stay evenly spaced. */
export function getRecentDays(
  progress: UserProgress,
  days: number
): Array<{ key: string; date: Date } & DailyStat> {
  const dailyStats = progress.dailyStats ?? {};
  const out: Array<{ key: string; date: Date } & DailyStat> = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = toDayKey(date);
    const stat = dailyStats[key] ?? { rounds: 0, successes: 0, seconds: 0 };
    out.push({ key, date, ...stat });
  }

  return out;
}

// Local storage key
const PROGRESS_KEY = 'piano-triads-progress';

// Mirrors the last loaded/saved progress so components outside the practice pages (navbar
// streak, home page) can react to progress changes without re-reading localStorage.
export const progressStore = writable<UserProgress | null>(null);

/** Fill in any fields a stored (possibly older) progress object is missing. */
function normalizeProgress(parsed: Partial<UserProgress>): UserProgress {
  const defaults = getDefaultProgress();
  return {
    ...defaults,
    ...parsed,
    // One-level merge so a newly added module (e.g. chordQuiz) gets its default for
    // existing users instead of coming back undefined.
    modules: { ...defaults.modules, ...(parsed.modules ?? {}) },
    dailyStats: parsed.dailyStats ?? {},
    itemStats: parsed.itemStats ?? {},
    // Key-by-key so preferences added later still get their defaults.
    preferences: { ...defaults.preferences, ...(parsed.preferences ?? {}) },
    bestSurvival: parsed.bestSurvival ?? {}
  };
}

// Load progress from localStorage
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();

  let progress = getDefaultProgress();
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      progress = normalizeProgress(JSON.parse(stored));
    }
  } catch (error) {
    console.warn('Failed to load progress from localStorage:', error);
  }

  progressStore.set(progress);
  return progress;
}

// Save progress to localStorage
export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;

  try {
    progress.lastActive = new Date().toISOString();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }

  progressStore.set(progress);
}

// Update session stats for practice modules
export function updateSessionStats(
  currentStats: SessionStats,
  wasSuccessful: boolean,
  timeSpent?: number
): SessionStats {
  const newStats = { ...currentStats };

  newStats.totalRounds++;
  newStats.lastPlayed = new Date().toISOString();

  if (wasSuccessful) {
    newStats.successfulRounds++;
    newStats.currentStreak++;
    newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
  } else {
    newStats.failedRounds++;
    newStats.currentStreak = 0;
  }

  // Update average time if provided
  if (timeSpent !== undefined) {
    const totalTime = (newStats.averageTime || 0) * (newStats.totalRounds - 1) + timeSpent;
    newStats.averageTime = totalTime / newStats.totalRounds;
  }

  return newStats;
}

// Update total play time for a user
export function updateTotalPlayTime(
  progress: UserProgress,
  timeSpentMinutes: number
): UserProgress {
  const newProgress = { ...progress };
  newProgress.totalPlayTime += timeSpentMinutes;
  return newProgress;
}

// Complete practice session - updates both session stats and total play time
export function completePracticeSession(
  progress: UserProgress,
  module: 'chordPractice' | 'chordQuiz' | 'pitchTraining' | 'musicReading',
  subModule: 'notes' | 'chords' | 'trebleClef' | 'bassClef' | 'bothClef' | null,
  wasSuccessful: boolean,
  timeSpentSeconds: number
): UserProgress {
  const newProgress = recordDailyActivity(progress, wasSuccessful, timeSpentSeconds);
  const timeSpentMinutes = timeSpentSeconds / 60;

  // Update total play time
  newProgress.totalPlayTime += timeSpentMinutes;

  // Update specific module stats
  if (module === 'chordPractice') {
    newProgress.modules.chordPractice = updateSessionStats(
      newProgress.modules.chordPractice,
      wasSuccessful,
      timeSpentSeconds
    );
  } else if (module === 'chordQuiz') {
    newProgress.modules.chordQuiz = updateSessionStats(
      newProgress.modules.chordQuiz ?? getDefaultProgress().modules.chordQuiz,
      wasSuccessful,
      timeSpentSeconds
    );
  } else if (module === 'pitchTraining' && subModule) {
    if (subModule === 'notes') {
      newProgress.modules.pitchTraining.notes = updateSessionStats(
        newProgress.modules.pitchTraining.notes,
        wasSuccessful,
        timeSpentSeconds
      );
    } else if (subModule === 'chords') {
      newProgress.modules.pitchTraining.chords = updateSessionStats(
        newProgress.modules.pitchTraining.chords,
        wasSuccessful,
        timeSpentSeconds
      );
    }
    newProgress.modules.pitchTraining.lastMode = subModule === 'notes' ? 'note' : 'chord';
    newProgress.modules.pitchTraining.lastPlayed = new Date().toISOString();
  } else if (module === 'musicReading' && subModule) {
    if (subModule === 'trebleClef') {
      newProgress.modules.musicReading.trebleClef = updateSessionStats(
        newProgress.modules.musicReading.trebleClef,
        wasSuccessful,
        timeSpentSeconds
      );
      newProgress.modules.musicReading.lastMode = 'treble';
    } else if (subModule === 'bassClef') {
      newProgress.modules.musicReading.bassClef = updateSessionStats(
        newProgress.modules.musicReading.bassClef,
        wasSuccessful,
        timeSpentSeconds
      );
      newProgress.modules.musicReading.lastMode = 'bass';
    } else if (subModule === 'bothClef') {
      newProgress.modules.musicReading.bothClef = updateSessionStats(
        newProgress.modules.musicReading.bothClef,
        wasSuccessful,
        timeSpentSeconds
      );
      newProgress.modules.musicReading.lastMode = 'both';
    }
    newProgress.modules.musicReading.lastPlayed = new Date().toISOString();
  }

  return newProgress;
}



// Calculate success rate
export function getSuccessRate(stats: SessionStats): number {
  if (stats.totalRounds === 0) return 0;
  return Math.round((stats.successfulRounds / stats.totalRounds) * 100);
}

// Calculate overall progress
export function getOverallStats(progress: UserProgress) {
  const { chordPractice, chordQuiz, pitchTraining, musicReading } = progress.modules;

  const chordQuizTotalRounds = chordQuiz?.totalRounds || 0;
  const chordQuizSuccessful = chordQuiz?.successfulRounds || 0;
  const chordQuizBestStreak = chordQuiz?.bestStreak || 0;

  const pitchTrainingTotalRounds =
    pitchTraining.notes.totalRounds + pitchTraining.chords.totalRounds;
  const pitchTrainingSuccessful =
    pitchTraining.notes.successfulRounds + pitchTraining.chords.successfulRounds;
  const pitchTrainingBestStreak = Math.max(
    pitchTraining.notes.bestStreak,
    pitchTraining.chords.bestStreak
  );

  const musicReadingTotalRounds =
    (musicReading?.trebleClef?.totalRounds || 0) + 
    (musicReading?.bassClef?.totalRounds || 0) + 
    (musicReading?.bothClef?.totalRounds || 0);
  const musicReadingSuccessful =
    (musicReading?.trebleClef?.successfulRounds || 0) + 
    (musicReading?.bassClef?.successfulRounds || 0) + 
    (musicReading?.bothClef?.successfulRounds || 0);
  const musicReadingBestStreak = Math.max(
    musicReading?.trebleClef?.bestStreak || 0,
    musicReading?.bassClef?.bestStreak || 0,
    musicReading?.bothClef?.bestStreak || 0
  );

  const totalRounds =
    chordPractice.totalRounds +
    chordQuizTotalRounds +
    pitchTrainingTotalRounds +
    musicReadingTotalRounds;
  const totalSuccessful =
    chordPractice.successfulRounds +
    chordQuizSuccessful +
    pitchTrainingSuccessful +
    musicReadingSuccessful;
  const bestStreak = Math.max(
    chordPractice.bestStreak,
    chordQuizBestStreak,
    pitchTrainingBestStreak,
    musicReadingBestStreak
  );

  return {
    totalRounds,
    totalSuccessful,
    overallSuccessRate: totalRounds > 0 ? Math.round((totalSuccessful / totalRounds) * 100) : 0,
    bestStreak,
    totalPlayTime: progress.totalPlayTime,

    chordQuiz: {
      totalRounds: chordQuizTotalRounds,
      successfulRounds: chordQuizSuccessful,
      successRate:
        chordQuizTotalRounds > 0 ? Math.round((chordQuizSuccessful / chordQuizTotalRounds) * 100) : 0,
      bestStreak: chordQuizBestStreak
    },

    pitchTraining: {
      notes: pitchTraining.notes,
      chords: pitchTraining.chords,
      combined: {
        totalRounds: pitchTrainingTotalRounds,
        successfulRounds: pitchTrainingSuccessful,
        successRate:
          pitchTrainingTotalRounds > 0
            ? Math.round((pitchTrainingSuccessful / pitchTrainingTotalRounds) * 100)
            : 0,
        bestStreak: pitchTrainingBestStreak
      }
    },

    musicReading: {
      trebleClef: musicReading?.trebleClef || {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageTime: 0,
        lastPlayed: new Date().toISOString()
      },
      bassClef: musicReading?.bassClef || {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageTime: 0,
        lastPlayed: new Date().toISOString()
      },
      bothClef: musicReading?.bothClef || {
        totalRounds: 0,
        successfulRounds: 0,
        failedRounds: 0,
        currentStreak: 0,
        bestStreak: 0,
        averageTime: 0,
        lastPlayed: new Date().toISOString()
      },
      combined: {
        totalRounds: musicReadingTotalRounds,
        successfulRounds: musicReadingSuccessful,
        successRate:
          musicReadingTotalRounds > 0
            ? Math.round((musicReadingSuccessful / musicReadingTotalRounds) * 100)
            : 0,
        bestStreak: musicReadingBestStreak
      }
    }
  };
}

// Predefined achievements
export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first-chord',
    name: 'First Chord',
    description: 'Successfully build your first chord',
    icon: '🎹',
    category: 'practice'
  },
  {
    id: 'chord-master',
    name: 'Chord Master',
    description: 'Successfully build 50 chords',
    icon: '🎵',
    category: 'mastery'
  },
  {
    id: 'perfect-pitch',
    name: 'Perfect Pitch',
    description: 'Get 10 correct answers in a row in pitch training',
    icon: '🎧',
    category: 'mastery'
  },

  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a chord practice round in under 10 seconds',
    icon: '⚡',
    category: 'practice'
  },

  {
    id: 'score-master',
    name: 'Score Master',
    description: 'Get 10 correct answers in a row in music score reading',
    icon: '🏆',
    category: 'mastery'
  },
  {
    id: 'score-reader',
    name: 'Score Reader',
    description: 'Successfully read 50 notes from sheet music',
    icon: '📖',
    category: 'mastery'
  },
  {
    id: 'streak-3',
    name: 'Warming Up',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    category: 'streak'
  },
  {
    id: 'streak-7',
    name: 'On Fire',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    category: 'streak'
  },
  {
    id: 'streak-30',
    name: 'Unstoppable',
    description: 'Practice 30 days in a row',
    icon: '🏅',
    category: 'streak'
  },
  {
    id: 'well-rounded',
    name: 'Well-Rounded',
    description: 'Try chord practice, pitch training, and score reading',
    icon: '🎼',
    category: 'practice'
  },
  {
    id: 'century',
    name: 'Centurion',
    description: 'Complete 100 practice rounds',
    icon: '💯',
    category: 'mastery'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 500 practice rounds',
    icon: '🌟',
    category: 'mastery'
  },
  {
    id: 'survivor-10',
    name: 'Survivor',
    description: 'Build 10 chords in one survival run',
    icon: '🛡️',
    category: 'practice'
  },
  {
    id: 'survivor-25',
    name: 'Ironclad',
    description: 'Build 25 chords in one survival run',
    icon: '⚔️',
    category: 'mastery'
  },
  {
    id: 'quiz-whiz',
    name: 'Quiz Whiz',
    description: 'Name 25 chords correctly in the chord quiz',
    icon: '🧠',
    category: 'mastery'
  }
];

/** Achievements present in `after` but not `before` — for celebration toasts on unlock. */
export function getNewAchievements(before: UserProgress, after: UserProgress): Achievement[] {
  const knownIds = new Set(before.achievements.map((a) => a.id));
  return after.achievements.filter((a) => !knownIds.has(a.id));
}

// Check and unlock achievements
export function checkAchievements(progress: UserProgress): UserProgress {
  // Copy the array (not just the object) so the input's achievements stay untouched and
  // getNewAchievements can diff the before/after objects.
  const newProgress = { ...progress, achievements: [...progress.achievements] };
  const unlockedIds = new Set(progress.achievements.map((a) => a.id));
  const now = new Date().toISOString();
  const stats = getOverallStats(progress);

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first-chord':
        shouldUnlock = progress.modules.chordPractice.successfulRounds >= 1;
        break;
      case 'chord-master':
        shouldUnlock = progress.modules.chordPractice.successfulRounds >= 50;
        break;
      case 'perfect-pitch':
        shouldUnlock =
          Math.max(
            progress.modules.pitchTraining.notes.bestStreak,
            progress.modules.pitchTraining.chords.bestStreak,
            progress.modules.chordPractice.bestStreak
          ) >= 10;
        break;
      case 'speed-demon':
        shouldUnlock = (progress.modules.chordPractice.averageTime || Infinity) < 10;
        break;
      case 'score-master':
        shouldUnlock = (progress.modules.musicReading?.bothClef?.bestStreak || 0) >= 10;
        break;
      case 'score-reader':
        const allMusicReadingSuccessful =
          (progress.modules.musicReading?.trebleClef?.successfulRounds || 0) +
          (progress.modules.musicReading?.bassClef?.successfulRounds || 0) +
          (progress.modules.musicReading?.bothClef?.successfulRounds || 0);
        shouldUnlock = allMusicReadingSuccessful >= 50;
        break;
      case 'streak-3':
        shouldUnlock = getDailyStreak(progress) >= 3;
        break;
      case 'streak-7':
        shouldUnlock = getDailyStreak(progress) >= 7;
        break;
      case 'streak-30':
        shouldUnlock = getDailyStreak(progress) >= 30;
        break;
      case 'well-rounded':
        shouldUnlock =
          progress.modules.chordPractice.totalRounds > 0 &&
          stats.pitchTraining.combined.totalRounds > 0 &&
          stats.musicReading.combined.totalRounds > 0;
        break;
      case 'century':
        shouldUnlock = stats.totalRounds >= 100;
        break;
      case 'dedicated':
        shouldUnlock = stats.totalRounds >= 500;
        break;
      case 'survivor-10':
        shouldUnlock = (progress.bestSurvival?.chordPractice || 0) >= 10;
        break;
      case 'survivor-25':
        shouldUnlock = (progress.bestSurvival?.chordPractice || 0) >= 25;
        break;
      case 'quiz-whiz':
        shouldUnlock = (progress.modules.chordQuiz?.successfulRounds || 0) >= 25;
        break;
    }

    if (shouldUnlock) {
      newProgress.achievements.push({
        ...achievement,
        unlockedAt: now
      });
    }
  }

  return newProgress;
}

// Format time duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}m`;
}

// Format date for display
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** Fold one answered item into its per-item record. */
export function recordItemResult(
  progress: UserProgress,
  practiceKey: PracticeKey,
  itemId: string,
  wasSuccessful: boolean
): UserProgress {
  const key = `${practiceKey}:${itemId}`;
  const itemStats = { ...(progress.itemStats ?? {}) };
  const current = itemStats[key] ?? { seen: 0, correct: 0 };

  itemStats[key] = {
    seen: current.seen + 1,
    correct: current.correct + (wasSuccessful ? 1 : 0)
  };

  return { ...progress, itemStats };
}

/** Accuracy for one item, or null when it has never been shown. */
export function getItemAccuracy(
  progress: UserProgress,
  practiceKey: PracticeKey,
  itemId: string
): number | null {
  const stat = (progress.itemStats ?? {})[`${practiceKey}:${itemId}`];
  if (!stat || stat.seen === 0) return null;
  return stat.correct / stat.seen;
}

/**
 * Pick the next item, biased toward the ones being answered worst.
 *
 * Weight is 1 for an item answered perfectly, up to 4 for one always missed, and 3 for an
 * item never seen so the full set still gets covered early. Every item keeps a non-zero
 * weight, so this stays practice rather than drilling the same two chords forever.
 */
export function pickWeightedItem(
  progress: UserProgress,
  practiceKey: PracticeKey,
  items: string[],
  excludeId?: string
): string {
  if (items.length === 0) return '';

  // Avoid handing back the same item twice in a row when there is any alternative.
  const pool = items.length > 1 && excludeId ? items.filter((item) => item !== excludeId) : items;

  // Callers pick the first item from onMount, so progress may not be loaded yet.
  if (!progress) return pool[Math.floor(Math.random() * pool.length)];

  const weights = pool.map((item) => {
    const accuracy = getItemAccuracy(progress, practiceKey, item);
    if (accuracy === null) return 3;
    return 1 + 3 * (1 - accuracy);
  });

  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * total;

  for (let i = 0; i < pool.length; i++) {
    cursor -= weights[i];
    if (cursor <= 0) return pool[i];
  }

  return pool[pool.length - 1];
}

// Progress lives only in this browser's localStorage, so clearing site data or switching
// devices loses everything. Export/import is the only way to carry it across.

const EXPORT_VERSION = 1;

/** Download the current progress as a JSON file. */
export function exportProgress(progress: UserProgress): void {
  if (typeof document === 'undefined') return;

  const payload = JSON.stringify(
    { version: EXPORT_VERSION, exportedAt: new Date().toISOString(), progress },
    null,
    2
  );

  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `piano-triads-progress-${toDayKey(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse and persist a previously exported file. Returns the restored progress, or throws with
 * a message suitable for showing to the user — importing overwrites everything, so a
 * malformed file must fail loudly rather than silently reset someone's history.
 */
export function importProgress(fileContents: string): UserProgress {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContents);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const candidate = (parsed as { progress?: unknown })?.progress ?? parsed;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error("That doesn't look like a Piano Triads export.");
  }

  const source = candidate as Partial<UserProgress>;
  if (!source.modules || typeof source.modules !== 'object') {
    throw new Error("That doesn't look like a Piano Triads export.");
  }

  const restored: UserProgress = {
    ...normalizeProgress(source),
    achievements: Array.isArray(source.achievements) ? source.achievements : []
  };

  saveProgress(restored);
  return restored;
}

// Reset all progress data
export function resetAllProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();

  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (error) {
    console.warn('Failed to clear progress from localStorage:', error);
  }

  return getDefaultProgress();
}
