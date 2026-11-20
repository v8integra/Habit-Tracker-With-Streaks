import { format } from 'date-fns'
import { parseDateKey, type DateKey } from '../lib/dates.ts'

type Props = {
  date: DateKey
  future: boolean
  done: boolean
  beforeStart: boolean
  isToday: boolean
  editable: boolean
  onToggle: () => void
}

/** One day square. Days in the last week are buttons; older days are read-only. */
export default function HeatmapCell({
  date,
  future,
  done,
  beforeStart,
  isToday,
  editable,
  onToggle,
}: Props) {
  if (future) return <td className="heatmap-cell-wrap" />

  const label = format(parseDateKey(date), 'EEEE, MMMM d')
  const classes = [
    'heatmap-cell',
    done && 'is-done',
    beforeStart && 'is-before-start',
    isToday && 'is-today',
    editable && 'is-editable',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <td className="heatmap-cell-wrap">
      {editable ? (
        <button
          type="button"
          className={classes}
          aria-pressed={done}
          aria-label={isToday ? `Today, ${label}` : label}
          onClick={onToggle}
        />
      ) : (
        <span className={classes}>
          <span className="sr-only">
            {label}: {beforeStart ? 'before this habit started' : done ? 'done' : 'not done'}
          </span>
        </span>
      )}
    </td>
  )
}
