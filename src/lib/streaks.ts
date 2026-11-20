import { addDaysToKey, isDateKey, type DateKey } from './dates.ts'

/**
 * The completion dates that count: valid date keys from `createdAt` to `today`
 * (inclusive), without duplicates, oldest first.
 * "YYYY-MM-DD" keys sort correctly as plain strings.
 */
export function countableDates(
  completions: readonly string[],
  createdAt: DateKey,
  today: DateKey,
): DateKey[] {
  const inRange = completions.filter(
    (date) => isDateKey(date) && date >= createdAt && date <= today,
  )
  return [...new Set(inRange)].sort()
}

/**
 * Days in a row completed, counting back from today. If today isn't done yet
 * but yesterday is, the streak counts from yesterday. Otherwise it's 0.
 */
export function currentStreak(
  completions: readonly string[],
  createdAt: DateKey,
  today: DateKey,
): number {
  const done = new Set(countableDates(completions, createdAt, today))
  let day = done.has(today) ? today : addDaysToKey(today, -1)
  let streak = 0
  while (done.has(day)) {
    streak += 1
    day = addDaysToKey(day, -1)
  }
  return streak
}

/** The longest run of consecutive completed days ever. */
export function bestStreak(
  completions: readonly string[],
  createdAt: DateKey,
  today: DateKey,
): number {
  let best = 0
  let run = 0
  let previous: DateKey | null = null
  for (const date of countableDates(completions, createdAt, today)) {
    run = previous !== null && addDaysToKey(previous, 1) === date ? run + 1 : 1
    best = Math.max(best, run)
    previous = date
  }
  return best
}
