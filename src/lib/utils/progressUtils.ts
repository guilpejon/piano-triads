// Progress tracking utilities for Piano Triads app

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

export interface UserProgress {
  modules: ModuleProgress;
  achievements: Achievement[];
  totalPlayTime: number; // in minutes
  lastActive: string; // ISO date string
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
    lastActive: now
  };
}

// Local storage key
const PROGRESS_KEY = 'piano-triads-progress';

// Load progress from localStorage
export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();

  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to handle new fields
      return { ...getDefaultProgress(), ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load progress from localStorage:', error);
  }

  return getDefaultProgress();
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
  module: 'chordPractice' | 'pitchTraining' | 'musicReading',
  subModule: 'notes' | 'chords' | 'trebleClef' | 'bassClef' | 'bothClef' | null,
  wasSuccessful: boolean,
  timeSpentSeconds: number
): UserProgress {
  const newProgress = { ...progress };
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
  const { chordPractice, pitchTraining, musicReading } = progress.modules;

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

  const totalRounds = chordPractice.totalRounds + pitchTrainingTotalRounds + musicReadingTotalRounds;
  const totalSuccessful = chordPractice.successfulRounds + pitchTrainingSuccessful + musicReadingSuccessful;
  const bestStreak = Math.max(chordPractice.bestStreak, pitchTrainingBestStreak, musicReadingBestStreak);

  return {
    totalRounds,
    totalSuccessful,
    overallSuccessRate: totalRounds > 0 ? Math.round((totalSuccessful / totalRounds) * 100) : 0,
    bestStreak,
    totalPlayTime: progress.totalPlayTime,

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
  }
];

// Check and unlock achievements
export function checkAchievements(progress: UserProgress): UserProgress {
  const newProgress = { ...progress };
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
