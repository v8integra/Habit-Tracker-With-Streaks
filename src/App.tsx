import { useState } from 'react'
import HabitDetail from './components/HabitDetail.tsx'
import SettingsPage from './components/SettingsPage.tsx'
import TodayPage from './components/TodayPage.tsx'
import { useAppData } from './hooks/useAppData.ts'
import { useRoute } from './hooks/useRoute.ts'
import { useToday } from './hooks/useToday.ts'
import type { DateKey } from './lib/dates.ts'
import { canToggleDay } from './lib/heatmap.ts'

export default function App() {
  const today = useToday()
  const { data, notice, add, toggle, edit, remove, replaceAll, dismissNotice } = useAppData()
  const { route, navigate, goToday } = useRoute()
  // What to focus when coming back to Today: "habit:<id>" or "settings".
  const [focusKey, setFocusKey] = useState<string | null>(null)

  function backToToday(key: string) {
    setFocusKey(key)
    goToday()
  }

  if (route.name === 'settings') {
    return (
      <SettingsPage
        data={data}
        today={today}
        onBack={() => backToToday('settings')}
        onReplaceAll={replaceAll}
      />
    )
  }

  const habit =
    route.name === 'habit' ? data.habits.find((h) => h.id === route.habitId) : undefined

  if (habit !== undefined) {
    return (
      <HabitDetail
        habit={habit}
        data={data}
        today={today}
        // Also covers a detail screen opened from a link, not from a card.
        onBack={() => backToToday(`habit:${habit.id}`)}
        onToggleDay={(date: DateKey) => {
          if (canToggleDay(date, today, habit.createdAt)) toggle(habit.id, date)
        }}
        onSave={(changes) => edit(habit.id, changes)}
        onDelete={() => {
          // Its card is gone, so Today focuses its heading instead.
          remove(habit.id)
          backToToday(`habit:${habit.id}`)
        }}
      />
    )
  }

  // Today, or a link to a habit that doesn't exist (e.g. an old link).
  return (
    <TodayPage
      data={data}
      today={today}
      notice={notice}
      focusKey={focusKey}
      onDismissNotice={dismissNotice}
      onAddHabit={(input) => add(input, today)}
      onToggle={(id) => toggle(id, today)}
      onOpen={(id) => {
        setFocusKey(`habit:${id}`)
        navigate({ name: 'habit', habitId: id })
      }}
      onOpenSettings={() => {
        setFocusKey('settings')
        navigate({ name: 'settings' })
      }}
    />
  )
}
