import { useEffect, useState } from 'react'
import { msUntilNextMidnight, todayKey, type DateKey } from '../lib/dates.ts'

/**
 * Today's local date, kept current if the app stays open past midnight.
 * A timer fires at midnight; because timers can sleep with the computer or a
 * background tab, the date is also rechecked whenever the page becomes visible.
 */
export function useToday(): DateKey {
  const [today, setToday] = useState(() => todayKey())

  useEffect(() => {
    const refresh = () => setToday(todayKey())
    // +50 ms so the timer lands just after midnight, never just before.
    const timer = setTimeout(refresh, msUntilNextMidnight(new Date()) + 50)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
    }
  }, [today])

  return today
}
