import { getHabitColor } from '../lib/colors.ts'
import type { Habit } from '../lib/types.ts'
import StreakBadge from './StreakBadge.tsx'

type Props = { habit: Habit; done: boolean; streak: number; onToggle: () => void }

export default function HabitCard({ habit, done, streak, onToggle }: Props) {
  const color = getHabitColor(habit.color)

  return (
    <label className={done ? 'habit-card is-done' : 'habit-card'}>
      <span className="color-dot" style={{ backgroundColor: color.hex }} aria-hidden="true" />
      <span className="habit-name">{habit.name}</span>
      <StreakBadge days={streak} />
      <input
        type="checkbox"
        className="habit-check"
        checked={done}
        onChange={onToggle}
        aria-label={`${habit.name} done today`}
      />
    </label>
  )
}
