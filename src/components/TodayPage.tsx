import { useEffect, useRef, useState } from 'react'
import type { StorageNotice as Notice } from '../hooks/useAppData.ts'
import { nextUnusedColor } from '../lib/colors.ts'
import { formatLongDate, type DateKey } from '../lib/dates.ts'
import { isDoneOn, progressOn } from '../lib/habits.ts'
import { currentStreak } from '../lib/streaks.ts'
import type { AppData } from '../lib/types.ts'
import EmptyState from './EmptyState.tsx'
import HabitCard from './HabitCard.tsx'
import HabitForm from './HabitForm.tsx'
import ProgressBar from './ProgressBar.tsx'
import StorageNotice from './StorageNotice.tsx'

type Props = {
  data: AppData
  today: DateKey
  notice: Notice | null
  /**
   * A habit card to focus on arrival (when coming back from its detail screen).
   * If that habit was just deleted, the page heading gets focus instead.
   */
  focusHabitId: string | null
  onDismissNotice: () => void
  onAddHabit: (input: { name: string; color: string }) => void
  onToggle: (habitId: string) => void
  onOpen: (habitId: string) => void
}

export default function TodayPage({
  data,
  today,
  notice,
  focusHabitId,
  onDismissNotice,
  onAddHabit,
  onToggle,
  onOpen,
}: Props) {
  const [adding, setAdding] = useState(false)
  const { done, total } = progressOn(data, today)
  const hasHabits = data.habits.length > 0
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusHabitId === null) return
    const card = document.querySelector<HTMLElement>(
      `[data-habit-id="${CSS.escape(focusHabitId)}"]`,
    )
    ;(card ?? headingRef.current)?.focus()
  }, [focusHabitId])

  return (
    <main className="page">
      <header className="today-header">
        <h1 ref={headingRef} tabIndex={-1}>
          Today
        </h1>
        <p className="today-date">{formatLongDate(today)}</p>
        {hasHabits && <ProgressBar done={done} total={total} />}
      </header>

      {notice !== null && <StorageNotice notice={notice} onDismiss={onDismissNotice} />}

      {hasHabits && (
        <ul className="habit-list">
          {data.habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard
                habit={habit}
                done={isDoneOn(data, habit.id, today)}
                streak={currentStreak(data.completions[habit.id] ?? [], habit.createdAt, today)}
                onToggle={() => onToggle(habit.id)}
                onOpen={() => onOpen(habit.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <HabitForm
          title="New habit"
          submitLabel="Add"
          initialColor={nextUnusedColor(data.habits.map((h) => h.color)).id}
          onSubmit={(input) => {
            onAddHabit(input)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : hasHabits ? (
        <button type="button" className="button button-primary" onClick={() => setAdding(true)}>
          Add habit
        </button>
      ) : (
        <EmptyState onAddFirst={() => setAdding(true)} />
      )}
    </main>
  )
}
