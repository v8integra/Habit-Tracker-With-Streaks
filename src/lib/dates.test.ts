import { describe, expect, it } from 'vitest'
import { addDaysToKey, isDateKey, parseDateKey, toDateKey, todayKey } from './dates.ts'

describe('toDateKey', () => {
  it('uses the local calendar date, not UTC', () => {
    // 11:59 pm local time. toISOString() would roll this to the next day
    // anywhere west of UTC.
    expect(toDateKey(new Date(2026, 10, 20, 23, 59))).toBe('2026-11-20')
  })

  it('handles just after midnight', () => {
    expect(toDateKey(new Date(2026, 10, 20, 0, 1))).toBe('2026-11-20')
  })

  it('pads month and day', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('todayKey', () => {
  it('uses the given time', () => {
    expect(todayKey(new Date(2026, 10, 20, 8, 0))).toBe('2026-11-20')
  })
})

describe('parseDateKey', () => {
  it('returns local midnight of that day', () => {
    const date = parseDateKey('2026-11-20')
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 10, 20, 0,
    ])
  })
})

describe('isDateKey', () => {
  it.each(['2026-11-20', '2028-02-29', '2026-12-31'])('accepts %s', (value) => {
    expect(isDateKey(value)).toBe(true)
  })

  it.each([
    '2026-02-30',
    '2027-02-29',
    '2026-13-01',
    '2026-11-5',
    '2026/11/20',
    '2026-11-20T00:00:00Z',
    '',
    'today',
  ])('rejects %s', (value) => {
    expect(isDateKey(value)).toBe(false)
  })

  it('rejects non-strings', () => {
    expect(isDateKey(20261120)).toBe(false)
    expect(isDateKey(null)).toBe(false)
  })
})

describe('addDaysToKey', () => {
  it('crosses a month boundary', () => {
    expect(addDaysToKey('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('crosses a year boundary', () => {
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDaysToKey('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('handles leap days', () => {
    expect(addDaysToKey('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDaysToKey('2028-02-29', 1)).toBe('2028-03-01')
  })

  it('crosses US daylight saving changes', () => {
    expect(addDaysToKey('2026-03-08', 1)).toBe('2026-03-09')
    expect(addDaysToKey('2026-11-01', 1)).toBe('2026-11-02')
    expect(addDaysToKey('2026-11-02', -1)).toBe('2026-11-01')
  })
})
