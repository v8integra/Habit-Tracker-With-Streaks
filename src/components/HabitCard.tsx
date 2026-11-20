import { getHabitColor } from '../lib/colors.ts'
import type { Habit } from '../lib/types.ts'
import StreakBadge from './StreakBadge.tsx'

type Props = {
  habit: Habit
  done: boolean
  streak: number
  onToggle: () => void
  onOpen: () => void
}

/** The name opens the habit's detail screen; the checkbox checks it off for today. */
export default function HabitCard({ habit, done, streak, onToggle, onOpen }: Props) {
  const color = getHabitColor(habit.color)

  return (
    <div className={done ? 'habit-card is-done' : 'habit-card'}>
      <button type="button" className="habit-open" data-focus-key={`habit:${habit.id}`} onClick={onOpen}>
        <span className="color-dot" style={{ backgroundColor: color.hex }} aria-hidden="true" />
        <span className="habit-name">{habit.name}</span>
        <StreakBadge days={streak} />
      </button>
      <label className="habit-check-area">
        <input
          type="checkbox"
          className="habit-check"
          checked={done}
          onChange={onToggle}
          aria-label={`${habit.name} done today`}
        />
      </label>
    </div>
  )
}
