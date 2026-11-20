import { format, startOfWeek } from 'date-fns'
import { addDaysToKey, parseDateKey, toDateKey, type DateKey } from './dates.ts'

export const HEATMAP_WEEKS = 12
/** Today and the 6 days before it can be changed. */
export const EDITABLE_DAYS = 7

export type HeatmapCell = { date: DateKey; future: boolean }

export type HeatmapWeek = {
  /** 7 cells, Sunday first. */
  cells: HeatmapCell[]
  /** "Nov" on the first week and wherever a new month starts, otherwise null. */
  monthLabel: string | null
}

/**
 * The heatmap grid: `weeks` columns, oldest on the left, each a Sunday-to-
 * Saturday week. The last column is the current week, so days after today
 * are marked `future` (shown empty).
 */
export function buildHeatmap(today: DateKey, weeks: number = HEATMAP_WEEKS): HeatmapWeek[] {
  const thisSunday = toDateKey(startOfWeek(parseDateKey(today), { weekStartsOn: 0 }))
  const firstSunday = addDaysToKey(thisSunday, -7 * (weeks - 1))

  const grid: HeatmapWeek[] = []
  let previousMonth = ''
  for (let w = 0; w < weeks; w += 1) {
    const cells = Array.from({ length: 7 }, (_, d) => {
      const date = addDaysToKey(firstSunday, w * 7 + d)
      return { date, future: date > today }
    })
    // Label the week by the month of its first day.
    const month = cells[0]!.date.slice(0, 7)
    const monthLabel = month !== previousMonth ? format(parseDateKey(cells[0]!.date), 'MMM') : null
    previousMonth = month
    grid.push({ cells, monthLabel })
  }

  // If the second week already starts a new month, the first label would sit
  // right against it ("Aug Sep"), so leave the first one off.
  if (grid.length > 1 && grid[1]!.monthLabel !== null) grid[0]!.monthLabel = null

  return grid
}

/** Whether a day can be checked or unchecked: within the last 7 days, and not before the habit existed. */
export function canToggleDay(date: DateKey, today: DateKey, createdAt: DateKey): boolean {
  const oldestEditable = addDaysToKey(today, -(EDITABLE_DAYS - 1))
  return date <= today && date >= oldestEditable && date >= createdAt
}
