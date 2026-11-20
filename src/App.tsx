import TodayPage from './components/TodayPage.tsx'
import { useAppData } from './hooks/useAppData.ts'
import { useToday } from './hooks/useToday.ts'

export default function App() {
  const today = useToday()
  const { data, notice, add, toggle, dismissNotice } = useAppData()

  return (
    <TodayPage
      data={data}
      today={today}
      notice={notice}
      onDismissNotice={dismissNotice}
      onAddHabit={(input) => add(input, today)}
      onToggle={(habitId) => toggle(habitId, today)}
    />
  )
}
