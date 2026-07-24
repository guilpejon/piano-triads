// Theme preference handling.
//
// Three states, not two: 'light' and 'dark' are explicit user choices, and 'system' means
// follow the OS. Only an explicit choice is written to localStorage and reflected as a
// data-theme attribute on <html> — with no attribute, the prefers-color-scheme block in
// app.css takes over on its own.
//
// The initial attribute is applied by an inline script in app.html so the page never paints
// in the wrong theme. Keep the storage key below in sync with that script.

import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

export const THEME_KEY = 'piano-triads-theme';

function readStored(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Safari private mode can throw on localStorage access.
    return 'system';
  }
}

/** True when the OS is currently asking for a dark UI. */
export function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** The theme actually being rendered, resolving 'system' against the OS setting. */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme;
}

function applyToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export const theme = writable<Theme>('system');

/** Call once on mount to sync the store with what the inline script already applied. */
export function initTheme(): void {
  theme.set(readStored());
}

export function setTheme(next: Theme): void {
  theme.set(next);
  applyToDocument(next);

  if (typeof localStorage === 'undefined') return;
  try {
    if (next === 'system') {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, next);
    }
  } catch {
    // Preference simply won't persist; the page still renders correctly.
  }
}

/** Cycle light → dark → system, so the OS-following option stays reachable. */
export function cycleTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
}
