/**
 * The 8 preset habit colors. Habits store the `id`. Each color is a CSS
 * variable (defined in styles.css) with a darker shade in light mode and a
 * lighter one in dark mode, so a done day in the heatmap stands out at least
 * 3:1 against both the page and an empty day.
 */
export const HABIT_COLORS = [
  { id: 'red', name: 'Red', value: 'var(--habit-red)' },
  { id: 'orange', name: 'Orange', value: 'var(--habit-orange)' },
  { id: 'yellow', name: 'Yellow', value: 'var(--habit-yellow)' },
  { id: 'green', name: 'Green', value: 'var(--habit-green)' },
  { id: 'teal', name: 'Teal', value: 'var(--habit-teal)' },
  { id: 'blue', name: 'Blue', value: 'var(--habit-blue)' },
  { id: 'purple', name: 'Purple', value: 'var(--habit-purple)' },
  { id: 'pink', name: 'Pink', value: 'var(--habit-pink)' },
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
