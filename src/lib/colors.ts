/**
 * The 8 preset habit colors. Habits store the `id`; the hex value is only used
 * for display, so it can be tuned later without touching saved data.
 * Mid-tone values chosen to read on both light and dark backgrounds.
 */
export const HABIT_COLORS = [
  { id: 'red', name: 'Red', hex: '#e5484d' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'purple', name: 'Purple', hex: '#8b5cf6' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
] as const

export type HabitColor = (typeof HABIT_COLORS)[number]

const FALLBACK = HABIT_COLORS[5] // blue

/** The preset for a stored color id. Unknown ids (e.g. from an old import) fall back to blue. */
export function getHabitColor(id: string): HabitColor {
  return HABIT_COLORS.find((color) => color.id === id) ?? FALLBACK
}

/** The first preset no habit uses yet, so new habits look different by default. */
export function nextUnusedColor(usedIds: readonly string[]): HabitColor {
  const used = new Set(usedIds)
  return HABIT_COLORS.find((color) => !used.has(color.id)) ?? HABIT_COLORS[0]
}
