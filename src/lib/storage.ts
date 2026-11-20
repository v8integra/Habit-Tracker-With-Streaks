import { isDateKey } from './dates.ts'
import type { AppData, Completions, Habit } from './types.ts'

export const STORAGE_KEY = 'habit-tracker:v1'
/** Where broken saved data is copied before starting fresh. Latest copy only. */
export const BACKUP_KEY = 'habit-tracker:v1:backup'
export const NAME_MAX_LENGTH = 40

/** The parts of `localStorage` we use, so tests can pass a fake. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>

/**
 * - `ok`: saved data loaded.
 * - `empty`: nothing saved yet (first visit).
 * - `corrupt`: something was saved but couldn't be read; starting fresh.
 * - `unavailable`: the browser blocked storage; changes won't be kept.
 */
export type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'unavailable'

export type LoadResult = { data: AppData; status: LoadStatus }

export function emptyData(): AppData {
  return { version: 1, habits: [], completions: {} }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseHabit(value: unknown): Habit | null {
  if (!isRecord(value)) return null
  const { id, name, color, createdAt } = value
  if (typeof id !== 'string' || id === '') return null
  if (typeof name !== 'string') return null
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > NAME_MAX_LENGTH) return null
  if (typeof color !== 'string' || color === '') return null
  if (!isDateKey(createdAt)) return null
  return { id, name: trimmed, color, createdAt }
}

/**
 * Checks that `value` has the AppData shape and returns a clean copy, or
 * null if it doesn't. Used for both localStorage and imported files.
 *
 * Structural problems (wrong version, a bad habit, duplicate ids, completions
 * that aren't lists of strings) reject the whole thing. Small leftovers are
 * cleaned up instead: invalid or duplicate dates are dropped, and so are
 * completions for habits that no longer exist.
 */
export function parseAppData(value: unknown): AppData | null {
  if (!isRecord(value) || value.version !== 1) return null
  if (!Array.isArray(value.habits) || !isRecord(value.completions)) return null

  const habits: Habit[] = []
  const ids = new Set<string>()
  for (const raw of value.habits) {
    const habit = parseHabit(raw)
    if (habit === null || ids.has(habit.id)) return null
    ids.add(habit.id)
    habits.push(habit)
  }

  const entries: [string, string[]][] = []
  for (const [habitId, dates] of Object.entries(value.completions)) {
    if (!Array.isArray(dates) || !dates.every((d) => typeof d === 'string')) return null
    if (!ids.has(habitId)) continue
    entries.push([habitId, [...new Set(dates.filter(isDateKey))].sort()])
  }
  // fromEntries defines own properties, so an id like "__proto__" is just a key.
  const completions: Completions = Object.fromEntries(entries)

  return { version: 1, habits, completions }
}

function browserStorage(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/**
 * Copies broken saved data to BACKUP_KEY, so the next save can't destroy it,
 * then starts fresh. If the copy fails, it starts fresh anyway.
 */
function startFreshFromCorrupt(store: KeyValueStore, raw: string): LoadResult {
  try {
    store.setItem(BACKUP_KEY, raw)
  } catch {
    // Storage is full or blocked; there's nothing more we can do here.
  }
  return { data: emptyData(), status: 'corrupt' }
}

/** Loads saved data. Never throws: on any problem it starts fresh and says why. */
export function loadData(store: KeyValueStore | null = browserStorage()): LoadResult {
  if (store === null) return { data: emptyData(), status: 'unavailable' }

  let raw: string | null
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return { data: emptyData(), status: 'unavailable' }
  }
  if (raw === null) return { data: emptyData(), status: 'empty' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return startFreshFromCorrupt(store, raw)
  }

  const data = parseAppData(parsed)
  return data === null ? startFreshFromCorrupt(store, raw) : { data, status: 'ok' }
}

/** Saves data. Returns false if the browser refused (blocked or full). */
export function saveData(
  data: AppData,
  store: KeyValueStore | null = browserStorage(),
): boolean {
  if (store === null) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
