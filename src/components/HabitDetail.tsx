import { useEffect, useRef } from 'react'
import { getHabitColor } from '../lib/colors.ts'
import type { DateKey } from '../lib/dates.ts'
import { habitStats } from '../lib/habits.ts'
import type { AppData, Habit } from '../lib/types.ts'
import Heatmap from './Heatmap.tsx'
import StatTile from './StatTile.tsx'

type Props = {
  habit: Habit
  data: AppData
  today: DateKey
  onBack: () => void
  onToggleDay: (date: DateKey) => void
}

function days(n: number): string {
  return n === 1 ? '1 day' : `${n} days`
}

export default function HabitDetail({ habit, data, today, onBack, onToggleDay }: Props) {
  const color = getHabitColor(habit.color)
  const stats = habitStats(data, habit, today)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the heading so keyboard and screen reader users start here.
  useEffect(() => {
    headingRef.current?.focus()
  }, [habit.id])

  return (
    <main className="page">
      <button type="button" className="button back-button" onClick={onBack}>
        <span aria-hidden="true">← </span>Today
      </button>

      <header className="detail-header">
        <span className="color-dot color-dot-large" style={{ backgroundColor: color.hex }} aria-hidden="true" />
        <h1 ref={headingRef} tabIndex={-1}>
          {habit.name}
        </h1>
      </header>

      <dl className="stats">
        <StatTile label="Current streak" value={days(stats.current)} />
        <StatTile label="Best streak" value={days(stats.best)} />
        <StatTile label="Total" value={days(stats.total)} />
      </dl>

      <section className="history" aria-labelledby="history-title">
        <h2 id="history-title">Last 12 weeks</h2>
        <p className="history-hint">Tap a day in the last week to change it.</p>
        <Heatmap
          completions={data.completions[habit.id] ?? []}
          createdAt={habit.createdAt}
          today={today}
          color={color.hex}
          onToggleDay={onToggleDay}
        />
      </section>
    </main>
  )
}
