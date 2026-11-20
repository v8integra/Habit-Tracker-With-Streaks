import { describe, expect, it } from 'vitest'
import { HEATMAP_WEEKS, buildHeatmap, canToggleDay } from './heatmap.ts'

// Friday, November 20, 2026.
const TODAY = '2026-11-20'

describe('buildHeatmap', () => {
  const grid = buildHeatmap(TODAY)
  const allDates = grid.flatMap((w) => w.cells.map((c) => c.date))

  it('has 12 week columns of 7 days', () => {
    expect(HEATMAP_WEEKS).toBe(12)
    expect(grid).toHaveLength(12)
    for (const week of grid) expect(week.cells).toHaveLength(7)
  })

  it('each column runs Sunday to Saturday, oldest on the left', () => {
    expect(grid[0]!.cells[0]!.date).toBe('2026-08-30') // a Sunday
    expect(grid[11]!.cells[0]!.date).toBe('2026-11-15') // this week's Sunday
    expect(grid[11]!.cells[6]!.date).toBe('2026-11-21') // this week's Saturday
  })

  it('days are consecutive with no gaps or repeats', () => {
    expect(new Set(allDates).size).toBe(84)
    expect([...allDates].sort()).toEqual(allDates)
  })

  it('today is in the rightmost column, and only later days are future', () => {
    const last = grid[11]!.cells
    expect(last[5]).toEqual({ date: TODAY, future: false }) // Friday row
    expect(last[6]).toEqual({ date: '2026-11-21', future: true })
    expect(grid.flatMap((w) => w.cells).filter((c) => c.future)).toHaveLength(1)
  })

  it('on a Saturday the last column is full', () => {
    const saturday = buildHeatmap('2026-11-21')
    expect(saturday[11]!.cells.every((c) => !c.future)).toBe(true)
    expect(saturday[11]!.cells[6]!.date).toBe('2026-11-21')
  })

  it('on a Sunday the last column has only today', () => {
    const sunday = buildHeatmap('2026-11-22')
    expect(sunday[11]!.cells.filter((c) => !c.future).map((c) => c.date)).toEqual(['2026-11-22'])
  })

  it('labels the first week and each new month', () => {
    expect(grid.map((w) => w.monthLabel)).toEqual([
      'Aug', // Aug 30
      'Sep', // Sep 6
      null,
      null,
      null,
      'Oct', // Oct 4
      null,
      null,
      null,
      'Nov', // Nov 1
      null,
      null,
    ])
  })

  it('crosses a year boundary', () => {
    const grid2027 = buildHeatmap('2027-01-06')
    expect(grid2027[11]!.cells[0]!.date).toBe('2027-01-03')
    expect(grid2027.map((w) => w.monthLabel).filter(Boolean)).toEqual(['Oct', 'Nov', 'Dec', 'Jan'])
  })
})

describe('canToggleDay', () => {
  const CREATED = '2026-10-01'

  it('allows today and the 6 days before it', () => {
    for (const date of ['2026-11-20', '2026-11-17', '2026-11-14']) {
      expect(canToggleDay(date, TODAY, CREATED)).toBe(true)
    }
  })

  it('does not allow 7 or more days ago', () => {
    expect(canToggleDay('2026-11-13', TODAY, CREATED)).toBe(false)
    expect(canToggleDay('2026-10-01', TODAY, CREATED)).toBe(false)
  })

  it('does not allow future days', () => {
    expect(canToggleDay('2026-11-21', TODAY, CREATED)).toBe(false)
  })

  it('does not allow days before the habit was created', () => {
    expect(canToggleDay('2026-11-18', TODAY, '2026-11-19')).toBe(false)
    expect(canToggleDay('2026-11-19', TODAY, '2026-11-19')).toBe(true)
  })

  it('works across a month boundary', () => {
    expect(canToggleDay('2026-11-26', '2026-12-02', CREATED)).toBe(true)
    expect(canToggleDay('2026-11-25', '2026-12-02', CREATED)).toBe(false)
  })
})
