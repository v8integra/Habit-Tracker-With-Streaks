import { useEffect, useState } from 'react'
import type { StorageNotice as Notice } from '../hooks/useAppData.ts'
import { formatLongDate, type DateKey } from '../lib/dates.ts'
import { isDoneOn, progressOn } from '../lib/habits.ts'
import { currentStreak } from '../lib/streaks.ts'
import type { AppData } from '../lib/types.ts'
import AddHabitForm from './AddHabitForm.tsx'
import EmptyState from './EmptyState.tsx'
import HabitCard from './HabitCard.tsx'
import ProgressBar from './ProgressBar.tsx'
import StorageNotice from './StorageNotice.tsx'

type Props = {
  data: AppData
  today: DateKey
  notice: Notice | null
  /** A habit card to focus on arrival (when coming back from its detail screen). */
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

  useEffect(() => {
    if (focusHabitId === null) return
    const card = document.querySelector<HTMLElement>(
      `[data-habit-id="${CSS.escape(focusHabitId)}"]`,
    )
    card?.focus()
  }, [focusHabitId])

  return (
    <main className="page">
      <header className="today-header">
        <h1>Today</h1>
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
        <AddHabitForm
          usedColors={data.habits.map((h) => h.color)}
          onAdd={(input) => {
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
