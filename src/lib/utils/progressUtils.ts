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
  learnScales: {
    scalesLearned: string[]; // Array of scale names learned
    lastScale: string;
    totalScalesPlayed: number;
    lastPlayed: string;
  };
  chordDictionary: {
    chordsViewed: string[]; // Array of chord names viewed
    lastChord: string;
    totalChordsViewed: number;
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
      learnScales: {
        scalesLearned: [],
        lastScale: '',
        totalScalesPlayed: 0,
        lastPlayed: now
      },
      chordDictionary: {
        chordsViewed: [],
        lastChord: '',
        totalChordsViewed: 0,
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
export function updateTotalPlayTime(progress: UserProgress, timeSpentMinutes: number): UserProgress {
  const newProgress = { ...progress };
  newProgress.totalPlayTime += timeSpentMinutes;
  return newProgress;
}

// Complete practice session - updates both session stats and total play time
export function completePracticeSession(
  progress: UserProgress,
  module: 'chordPractice' | 'pitchTraining',
  subModule: 'notes' | 'chords' | null,
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
  }
  
  return newProgress;
}

// Track chord dictionary usage
export function trackChordViewed(progress: UserProgress, chordName: string): UserProgress {
  const newProgress = { ...progress };
  const chordDict = newProgress.modules.chordDictionary;
  
  if (!chordDict.chordsViewed.includes(chordName)) {
    chordDict.chordsViewed.push(chordName);
  }
  chordDict.lastChord = chordName;
  chordDict.totalChordsViewed++;
  chordDict.lastPlayed = new Date().toISOString();
  
  return newProgress;
}

// Track scale learning
export function trackScaleLearned(progress: UserProgress, scaleName: string): UserProgress {
  const newProgress = { ...progress };
  const scaleModule = newProgress.modules.learnScales;
  
  if (!scaleModule.scalesLearned.includes(scaleName)) {
    scaleModule.scalesLearned.push(scaleName);
  }
  scaleModule.lastScale = scaleName;
  scaleModule.totalScalesPlayed++;
  scaleModule.lastPlayed = new Date().toISOString();
  
  return newProgress;
}

// Calculate success rate
export function getSuccessRate(stats: SessionStats): number {
  if (stats.totalRounds === 0) return 0;
  return Math.round((stats.successfulRounds / stats.totalRounds) * 100);
}

// Calculate overall progress
export function getOverallStats(progress: UserProgress) {
  const { chordPractice, pitchTraining } = progress.modules;
  const { learnScales, chordDictionary } = progress.modules;
  
  const pitchTrainingTotalRounds = pitchTraining.notes.totalRounds + pitchTraining.chords.totalRounds;
  const pitchTrainingSuccessful = pitchTraining.notes.successfulRounds + pitchTraining.chords.successfulRounds;
  const pitchTrainingBestStreak = Math.max(pitchTraining.notes.bestStreak, pitchTraining.chords.bestStreak);
  
  const totalRounds = chordPractice.totalRounds + pitchTrainingTotalRounds;
  const totalSuccessful = chordPractice.successfulRounds + pitchTrainingSuccessful;
  const bestStreak = Math.max(chordPractice.bestStreak, pitchTrainingBestStreak);
  
  return {
    totalRounds,
    totalSuccessful,
    overallSuccessRate: totalRounds > 0 ? Math.round((totalSuccessful / totalRounds) * 100) : 0,
    bestStreak,
    scalesLearned: learnScales.scalesLearned.length,
    chordsViewed: chordDictionary.chordsViewed.length,
    totalPlayTime: progress.totalPlayTime,

    pitchTraining: {
      notes: pitchTraining.notes,
      chords: pitchTraining.chords,
      combined: {
        totalRounds: pitchTrainingTotalRounds,
        successfulRounds: pitchTrainingSuccessful,
        successRate: pitchTrainingTotalRounds > 0 ? Math.round((pitchTrainingSuccessful / pitchTrainingTotalRounds) * 100) : 0,
        bestStreak: pitchTrainingBestStreak
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
    id: 'scale-explorer',
    name: 'Scale Explorer',
    description: 'Learn 10 different scales',
    icon: '🎼',
    category: 'learning'
  },

  {
    id: 'chord-encyclopedia',
    name: 'Chord Encyclopedia',
    description: 'View 25 different chords',
    icon: '📚',
    category: 'learning'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a chord practice round in under 10 seconds',
    icon: '⚡',
    category: 'practice'
  },

];

// Check and unlock achievements
export function checkAchievements(progress: UserProgress): UserProgress {
  const newProgress = { ...progress };
  const unlockedIds = new Set(progress.achievements.map(a => a.id));
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
        shouldUnlock = Math.max(
          progress.modules.pitchTraining.notes.bestStreak, 
          progress.modules.pitchTraining.chords.bestStreak,
          progress.modules.chordPractice.bestStreak
        ) >= 10;
        break;
      case 'scale-explorer':
        shouldUnlock = progress.modules.learnScales.scalesLearned.length >= 10;
        break;

      case 'chord-encyclopedia':
        shouldUnlock = progress.modules.chordDictionary.chordsViewed.length >= 25;
        break;
      case 'speed-demon':
        shouldUnlock = (progress.modules.chordPractice.averageTime || Infinity) < 10;
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
