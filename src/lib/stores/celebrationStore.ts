// Queue of celebration events (achievement unlocks, streak milestones, new records).
// Practice pages push events; CelebrationToast.svelte, mounted once in the layout, renders
// and dismisses them. Kept separate from progressUtils so celebrations stay presentational.

import { writable } from 'svelte/store';
import type { Achievement } from '$lib/utils/progressUtils';

type CelebrationData =
  | { type: 'achievement'; achievement: Achievement }
  | { type: 'streak'; count: number }
  | { type: 'record'; label: string };

export type CelebrationEvent = CelebrationData & { id: number };

let nextId = 0;

export const celebrations = writable<CelebrationEvent[]>([]);

function push(event: CelebrationData) {
  const entry: CelebrationEvent = { ...event, id: nextId++ };
  celebrations.update((queue) => [...queue, entry]);
}

export function celebrateAchievement(achievement: Achievement): void {
  push({ type: 'achievement', achievement });
}

export function celebrateStreak(count: number): void {
  push({ type: 'streak', count });
}

export function celebrateRecord(label: string): void {
  push({ type: 'record', label });
}

export function dismissCelebration(id: number): void {
  celebrations.update((queue) => queue.filter((event) => event.id !== id));
}

// In-session streaks worth a fanfare. Exact matches only, so a run of 12 doesn't
// celebrate on every round past 10.
const STREAK_MILESTONES = [5, 10, 25, 50];

export function isStreakMilestone(count: number): boolean {
  return STREAK_MILESTONES.includes(count);
}
