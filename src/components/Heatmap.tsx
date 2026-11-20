import type { CSSProperties } from 'react'
import type { DateKey } from '../lib/dates.ts'
import { buildHeatmap, canToggleDay } from '../lib/heatmap.ts'
import HeatmapCell from './HeatmapCell.tsx'

const WEEKDAYS = [
  ['S', 'Sunday'],
  ['M', 'Monday'],
  ['T', 'Tuesday'],
  ['W', 'Wednesday'],
  ['T', 'Thursday'],
  ['F', 'Friday'],
  ['S', 'Saturday'],
] as const

type Props = {
  completions: readonly string[]
  createdAt: DateKey
  today: DateKey
  color: string
  onToggleDay: (date: DateKey) => void
}

/** 7 rows (Sunday on top) × 12 weeks (oldest on the left). */
export default function Heatmap({ completions, createdAt, today, color, onToggleDay }: Props) {
  const weeks = buildHeatmap(today)
  const done = new Set(completions)

  return (
    <table className="heatmap" style={{ '--habit-color': color } as CSSProperties}>
      <thead aria-hidden="true">
        <tr>
          <td />
          {weeks.map((week) => (
            <td key={week.cells[0]!.date} className="heatmap-month">
              {week.monthLabel}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {WEEKDAYS.map(([short, long], row) => (
          <tr key={long}>
            <th scope="row" className="heatmap-weekday">
              <span aria-hidden="true">{short}</span>
              <span className="sr-only">{long}</span>
            </th>
            {weeks.map((week) => {
              const cell = week.cells[row]!
              return (
                <HeatmapCell
                  key={cell.date}
                  date={cell.date}
                  future={cell.future}
                  done={done.has(cell.date)}
                  beforeStart={cell.date < createdAt}
                  isToday={cell.date === today}
                  editable={canToggleDay(cell.date, today, createdAt)}
                  onToggle={() => onToggleDay(cell.date)}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
