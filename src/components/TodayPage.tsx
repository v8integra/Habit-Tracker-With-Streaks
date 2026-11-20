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
   * What to focus on arrival, when coming back from another screen: a
   * `data-focus-key` like "habit:<id>" or "settings". If it's gone (a deleted
   * habit), the page heading gets focus instead.
   */
  focusKey: string | null
  onDismissNotice: () => void
  onAddHabit: (input: { name: string; color: string }) => void
  onToggle: (habitId: string) => void
  onOpen: (habitId: string) => void
  onOpenSettings: () => void
}

export default function TodayPage({
  data,
  today,
  notice,
  focusKey,
  onDismissNotice,
  onAddHabit,
  onToggle,
  onOpen,
  onOpenSettings,
}: Props) {
  const [adding, setAdding] = useState(false)
  const { done, total } = progressOn(data, today)
  const hasHabits = data.habits.length > 0
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusKey === null) return
    const target = document.querySelector<HTMLElement>(
      `[data-focus-key="${CSS.escape(focusKey)}"]`,
    )
    ;(target ?? headingRef.current)?.focus()
  }, [focusKey])

  return (
    <main className="page">
      <header className="today-header">
        <div className="today-header-top">
          <h1 ref={headingRef} tabIndex={-1}>
            Today
          </h1>
          <button
            type="button"
            className="button button-small"
            data-focus-key="settings"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
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
