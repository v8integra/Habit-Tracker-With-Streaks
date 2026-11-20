import { addDays, format, isValid, parse, startOfDay } from 'date-fns'

/** A local calendar date as "YYYY-MM-DD". Never a timestamp. */
export type DateKey = string

const DATE_KEY_FORMAT = 'yyyy-MM-dd'
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Formats a Date as its local calendar date (not UTC). */
export function toDateKey(date: Date): DateKey {
  return format(date, DATE_KEY_FORMAT)
}

/** Today's local calendar date. Pass `now` in tests. */
export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now)
}

/** Parses a date key to local midnight of that day. */
export function parseDateKey(key: DateKey): Date {
  return parse(key, DATE_KEY_FORMAT, new Date())
}

/** True for a real calendar date in "YYYY-MM-DD" form (rejects "2026-02-30"). */
export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false
  const date = parseDateKey(value)
  return isValid(date) && toDateKey(date) === value
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilNextMidnight(now: Date): number {
  return addDays(startOfDay(now), 1).getTime() - now.getTime()
}

/** A date key as a heading, e.g. "Friday, November 20". */
export function formatLongDate(key: DateKey): string {
  return format(parseDateKey(key), 'EEEE, MMMM d')
}

/** Moves a date key by whole calendar days (negative goes back). */
export function addDaysToKey(key: DateKey, days: number): DateKey {
  return toDateKey(addDays(parseDateKey(key), days))
}
