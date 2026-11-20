import { describe, expect, it } from 'vitest'
import { addDaysToKey } from './dates.ts'
import { bestStreak, countableDates, currentStreak } from './streaks.ts'

const TODAY = '2026-11-20'
const CREATED = '2026-01-01'

/** `length` consecutive date keys ending on `last`. */
function run(last: string, length: number): string[] {
  return Array.from({ length }, (_, i) => addDaysToKey(last, i - length + 1))
}

function streaks(completions: string[], today = TODAY, createdAt = CREATED) {
  return {
    current: currentStreak(completions, createdAt, today),
    best: bestStreak(completions, createdAt, today),
  }
}

describe('streaks', () => {
  it('no completions', () => {
    expect(streaks([])).toEqual({ current: 0, best: 0 })
  })

  it('only today', () => {
    expect(streaks([TODAY])).toEqual({ current: 1, best: 1 })
  })

  it('only yesterday: today is still open, so the streak stays alive', () => {
    expect(streaks(['2026-11-19'])).toEqual({ current: 1, best: 1 })
  })

  it('a 5-day run ending today', () => {
    expect(streaks(run(TODAY, 5))).toEqual({ current: 5, best: 5 })
  })

  it('a 5-day run ending yesterday', () => {
    expect(streaks(run('2026-11-19', 5))).toEqual({ current: 5, best: 5 })
  })

  it('a run broken two days ago: neither today nor yesterday done', () => {
    expect(streaks(run('2026-11-18', 5))).toEqual({ current: 0, best: 5 })
  })

  it('a gap two days ago restarts the current streak', () => {
    // Nov 10–17 done, Nov 18 missed, Nov 19–20 done.
    const completions = [...run('2026-11-17', 8), ...run(TODAY, 2)]
    expect(streaks(completions)).toEqual({ current: 2, best: 8 })
  })

  it('best streak in the past is longer than the current one', () => {
    const completions = [...run('2026-10-15', 12), ...run(TODAY, 3)]
    expect(streaks(completions)).toEqual({ current: 3, best: 12 })
  })

  it('a month boundary (Jan 31 → Feb 1)', () => {
    const completions = ['2026-01-30', '2026-01-31', '2026-02-01']
    expect(streaks(completions, '2026-02-01')).toEqual({ current: 3, best: 3 })
  })

  it('a year boundary (Dec 31 → Jan 1)', () => {
    const completions = ['2026-12-30', '2026-12-31', '2027-01-01']
    expect(streaks(completions, '2027-01-01')).toEqual({ current: 3, best: 3 })
  })

  it('a leap day (Feb 28 → Feb 29 → Mar 1)', () => {
    const completions = ['2028-02-28', '2028-02-29', '2028-03-01']
    expect(streaks(completions, '2028-03-01')).toEqual({ current: 3, best: 3 })
  })

  it('a daylight saving change (Nov 1, 2026 in the US)', () => {
    expect(streaks(run('2026-11-03', 5), '2026-11-03')).toEqual({ current: 5, best: 5 })
  })

  it('duplicate dates are ignored', () => {
    const completions = [TODAY, TODAY, '2026-11-19', '2026-11-19', '2026-11-19']
    expect(streaks(completions)).toEqual({ current: 2, best: 2 })
  })

  it('completions in any order', () => {
    expect(streaks(['2026-11-19', TODAY, '2026-11-18'])).toEqual({ current: 3, best: 3 })
  })

  it('a completion before createdAt is ignored', () => {
    // Habit created Nov 18. Nov 15–17 are before it and don't count.
    const completions = run(TODAY, 6)
    expect(streaks(completions, TODAY, '2026-11-18')).toEqual({ current: 3, best: 3 })
  })

  it('days before createdAt never count against the habit', () => {
    // Created yesterday and done both days: a perfect record.
    expect(streaks(['2026-11-19', TODAY], TODAY, '2026-11-19')).toEqual({
      current: 2,
      best: 2,
    })
  })

  it('completions after today are ignored', () => {
    expect(streaks([TODAY, '2026-11-21', '2026-11-22'])).toEqual({ current: 1, best: 1 })
  })

  it('invalid date strings are ignored', () => {
    expect(streaks([TODAY, '2026-11-19', 'garbage', '2026-02-30'])).toEqual({
      current: 2,
      best: 2,
    })
  })
})

describe('countableDates', () => {
  it('returns valid, unique dates in range, oldest first', () => {
    const completions = [TODAY, '2025-12-31', '2026-11-21', '2026-03-04', TODAY, 'nope']
    expect(countableDates(completions, CREATED, TODAY)).toEqual(['2026-03-04', TODAY])
  })
})
