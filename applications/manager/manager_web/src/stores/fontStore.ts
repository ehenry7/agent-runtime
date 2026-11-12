import { create } from 'zustand';

/* ------------------------------------------------------------------ *
 * Font preference types
 * ------------------------------------------------------------------ */

export type FontSizeKey = 'compact' | 'default' | 'comfortable' | 'large';

export type FontFamilyKey =
  | 'harmony'
  | 'system'
  | 'inter'
  | 'noto'
  | 'mono';

export interface FontSizeOption {
  key: FontSizeKey;
  /** Multiplier applied to all --font-size-* CSS variables. */
  scale: number;
}

export interface FontFamilyOption {
  key: FontFamilyKey;
  /** CSS font-family stack for --font-body / --font-display. */
  stack: string;
  /** Label i18n key suffix. */
  labelKey: string;
  /** Optional <link> href to load a web font (only for non-system fonts). */
  href?: string;
}

/* ------------------------------------------------------------------ *
 * Option catalogs
 * ------------------------------------------------------------------ */

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { key: 'compact', scale: 0.875 },
  { key: 'default', scale: 1 },
  { key: 'comfortable', scale: 1.125 },
  { key: 'large', scale: 1.25 },
];

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    key: 'harmony',
    stack:
      '"HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    labelKey: 'harmony',
  },
  {
    key: 'system',
    stack:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    labelKey: 'system',
  },
  {
    key: 'inter',
    stack:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    labelKey: 'inter',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    key: 'noto',
    stack:
      '"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    labelKey: 'noto',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap',
  },
  {
    key: 'mono',
    stack:
      '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
    labelKey: 'mono',
    href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
  },
];

/* ------------------------------------------------------------------ *
 * Defaults
 * ------------------------------------------------------------------ */

const DEFAULT_SIZE_KEY: FontSizeKey = 'default';
const DEFAULT_FAMILY_KEY: FontFamilyKey = 'harmony';
const STORAGE_KEY = 'font-preferences';

interface StoredPrefs {
  sizeKey: FontSizeKey;
  familyKey: FontFamilyKey;
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sizeKey: DEFAULT_SIZE_KEY, familyKey: DEFAULT_FAMILY_KEY };
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    const sizeKey = FONT_SIZE_OPTIONS.some((o) => o.key === parsed.sizeKey)
      ? (parsed.sizeKey as FontSizeKey)
      : DEFAULT_SIZE_KEY;
    const familyKey = FONT_FAMILY_OPTIONS.some((o) => o.key === parsed.familyKey)
      ? (parsed.familyKey as FontFamilyKey)
      : DEFAULT_FAMILY_KEY;
    return { sizeKey, familyKey };
  } catch {
    return { sizeKey: DEFAULT_SIZE_KEY, familyKey: DEFAULT_FAMILY_KEY };
  }
}

/* ------------------------------------------------------------------ *
 * DOM application
 * ------------------------------------------------------------------ */

/** Ensure a web-font <link> is present in <head> when the option requires it. */
function ensureFontLink(option: FontFamilyOption): void {
  if (!option.href) return;
  const id = `font-link-${option.key}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = option.href;
  document.head.appendChild(link);
}

/**
 * Apply font preferences to the document root element.
 * Sets:
 *   --font-scale  – multiplies all --font-size-* values
 *   --font-body   – primary body font-family stack
 *   --font-display – heading / display font-family stack
 */
export function applyFontPrefs(sizeKey: FontSizeKey, familyKey: FontFamilyKey): void {
  const sizeOption = FONT_SIZE_OPTIONS.find((o) => o.key === sizeKey) ?? FONT_SIZE_OPTIONS[1];
  const familyOption = FONT_FAMILY_OPTIONS.find((o) => o.key === familyKey) ?? FONT_FAMILY_OPTIONS[0];

  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(sizeOption.scale));
  root.style.setProperty('--font-body', familyOption.stack);
  root.style.setProperty('--font-display', familyOption.stack);

  ensureFontLink(familyOption);
}

/* ------------------------------------------------------------------ *
 * Zustand store
 * ------------------------------------------------------------------ */

interface FontState {
  sizeKey: FontSizeKey;
  familyKey: FontFamilyKey;
  setSize: (key: FontSizeKey) => void;
  setFamily: (key: FontFamilyKey) => void;
}

const initial = loadPrefs();

// Apply once at module load so the very first paint uses the saved prefs.
applyFontPrefs(initial.sizeKey, initial.familyKey);

export const useFontStore = create<FontState>((set, get) => ({
  sizeKey: initial.sizeKey,
  familyKey: initial.familyKey,
  setSize: (key) => {
    const familyKey = get().familyKey;
    set({ sizeKey: key });
    applyFontPrefs(key, familyKey);
    persist({ sizeKey: key, familyKey });
  },
  setFamily: (key) => {
    const sizeKey = get().sizeKey;
    set({ familyKey: key });
    applyFontPrefs(sizeKey, key);
    persist({ sizeKey, familyKey: key });
  },
}));

function persist(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* localStorage may be unavailable (private mode); silently ignore. */
  }
}
