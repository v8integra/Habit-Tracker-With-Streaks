import { useState } from 'react'
import HabitDetail from './components/HabitDetail.tsx'
import TodayPage from './components/TodayPage.tsx'
import { useAppData } from './hooks/useAppData.ts'
import { useRoute } from './hooks/useRoute.ts'
import { useToday } from './hooks/useToday.ts'
import type { DateKey } from './lib/dates.ts'
import { canToggleDay } from './lib/heatmap.ts'

export default function App() {
  const today = useToday()
  const { data, notice, add, toggle, dismissNotice } = useAppData()
  const { habitId, openHabit, goToday } = useRoute()
  // The card to focus when coming back from a habit's detail screen.
  const [lastOpened, setLastOpened] = useState<string | null>(null)

  const habit = habitId === null ? undefined : data.habits.find((h) => h.id === habitId)

  if (habit !== undefined) {
    return (
      <HabitDetail
        habit={habit}
        data={data}
        today={today}
        onBack={goToday}
        onToggleDay={(date: DateKey) => {
          if (canToggleDay(date, today, habit.createdAt)) toggle(habit.id, date)
        }}
      />
    )
  }

  // No habit id, or one that doesn't exist (e.g. an old link): show Today.
  return (
    <TodayPage
      data={data}
      today={today}
      notice={notice}
      focusHabitId={lastOpened}
      onDismissNotice={dismissNotice}
      onAddHabit={(input) => add(input, today)}
      onToggle={(id) => toggle(id, today)}
      onOpen={(id) => {
        setLastOpened(id)
        openHabit(id)
      }}
    />
  )
}
