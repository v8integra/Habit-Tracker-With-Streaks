import { useState } from 'react'
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
  // True for a moment after checking off, to play the pop animation once.
  // Not set on page load, so already-done habits don't all pop at once.
  const [justDone, setJustDone] = useState(false)

  const classes = ['habit-card', done && 'is-done', justDone && 'just-done']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} onAnimationEnd={() => setJustDone(false)}>
      <button
        type="button"
        className="habit-open"
        data-focus-key={`habit:${habit.id}`}
        onClick={onOpen}
      >
        <span className="color-dot" style={{ backgroundColor: color.value }} aria-hidden="true" />
        <span className="habit-name">{habit.name}</span>
        <StreakBadge days={streak} />
      </button>
      <label className="habit-check-area">
        <input
          type="checkbox"
          className="habit-check"
          checked={done}
          onChange={() => {
            setJustDone(!done)
            onToggle()
          }}
          aria-label={`${habit.name} done today`}
        />
      </label>
    </div>
  )
}
