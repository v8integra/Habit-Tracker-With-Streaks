import { useEffect, useRef, useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { getHabitColor } from '../lib/colors.ts'
import type { DateKey } from '../lib/dates.ts'
import { habitStats } from '../lib/habits.ts'
import type { AppData, Habit } from '../lib/types.ts'
import ConfirmPanel from './ConfirmPanel.tsx'
import HabitForm from './HabitForm.tsx'
import Heatmap from './Heatmap.tsx'
import StatTile from './StatTile.tsx'

type Props = {
  habit: Habit
  data: AppData
  today: DateKey
  onBack: () => void
  onToggleDay: (date: DateKey) => void
  onSave: (changes: { name: string; color: string }) => void
  onDelete: () => void
}

type Mode = 'view' | 'editing' | 'confirming-delete'

function days(n: number): string {
  return n === 1 ? '1 day' : `${n} days`
}

export default function HabitDetail({
  habit,
  data,
  today,
  onBack,
  onToggleDay,
  onSave,
  onDelete,
}: Props) {
  const color = getHabitColor(habit.color)
  const stats = habitStats(data, habit, today)
  const [mode, setMode] = useState<Mode>('view')
  useDocumentTitle(habit.name)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const editRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)
  // Where focus goes when the form or confirm step closes.
  const returnFocusTo = useRef<'edit' | 'delete' | null>(null)

  // Start on the heading, so keyboard and screen reader users begin here.
  useEffect(() => {
    headingRef.current?.focus()
  }, [habit.id])

  useEffect(() => {
    if (mode !== 'view' || returnFocusTo.current === null) return
    const target = returnFocusTo.current === 'edit' ? editRef.current : deleteRef.current
    target?.focus()
    returnFocusTo.current = null
  }, [mode])

  function closeTo(button: 'edit' | 'delete') {
    returnFocusTo.current = button
    setMode('view')
  }

  return (
    <main className="page">
      <button type="button" className="button back-button" onClick={onBack}>
        <span aria-hidden="true">← </span>Today
      </button>

      <header className="detail-header">
        <span
          className="color-dot color-dot-large"
          style={{ backgroundColor: color.value }}
          aria-hidden="true"
        />
        <h1 ref={headingRef} tabIndex={-1}>
          {habit.name}
        </h1>
      </header>

      {mode === 'editing' ? (
        <HabitForm
          title="Edit habit"
          submitLabel="Save"
          initialName={habit.name}
          initialColor={color.id}
          onSubmit={(changes) => {
            onSave(changes)
            closeTo('edit')
          }}
          onCancel={() => closeTo('edit')}
        />
      ) : mode === 'confirming-delete' ? (
        <ConfirmPanel
          title={`Delete “${habit.name}”?`}
          message="This removes the habit and all of its history. This can’t be undone."
          confirmLabel="Delete"
          onConfirm={onDelete}
          onCancel={() => closeTo('delete')}
        />
      ) : (
        <div className="detail-actions">
          <button ref={editRef} type="button" className="button" onClick={() => setMode('editing')}>
            Edit
          </button>
          <button
            ref={deleteRef}
            type="button"
            className="button button-danger-outline"
            onClick={() => setMode('confirming-delete')}
          >
            Delete habit
          </button>
        </div>
      )}

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
          color={color.value}
          onToggleDay={onToggleDay}
        />
      </section>
    </main>
  )
}
