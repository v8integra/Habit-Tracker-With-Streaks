import type { DateKey } from './dates.ts'
import { NAME_MAX_LENGTH } from './storage.ts'
import type { AppData, Habit } from './types.ts'

/** An error message for an invalid habit name, or null if it's fine. */
export function validateHabitName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Enter a name.'
  if (trimmed.length > NAME_MAX_LENGTH) return `Use ${NAME_MAX_LENGTH} characters or fewer.`
  return null
}

export function createHabit(
  input: { name: string; color: string },
  today: DateKey,
  id: string,
): Habit {
  return { id, name: input.name.trim(), color: input.color, createdAt: today }
}

/** Adds a habit to the end of the list (habits are shown in creation order). */
export function addHabit(data: AppData, habit: Habit): AppData {
  return { ...data, habits: [...data.habits, habit] }
}

export function isDoneOn(data: AppData, habitId: string, date: DateKey): boolean {
  return data.completions[habitId]?.includes(date) ?? false
}

/** Checks a habit off for `date`, or unchecks it if it was already done. */
export function toggleCompletion(data: AppData, habitId: string, date: DateKey): AppData {
  const dates = data.completions[habitId] ?? []
  const next = dates.includes(date)
    ? dates.filter((d) => d !== date)
    : [...dates, date].sort()
  return { ...data, completions: { ...data.completions, [habitId]: next } }
}

/** How many habits are done on `date`, out of all habits. */
export function progressOn(data: AppData, date: DateKey): { done: number; total: number } {
  const done = data.habits.filter((habit) => isDoneOn(data, habit.id, date)).length
  return { done, total: data.habits.length }
}
