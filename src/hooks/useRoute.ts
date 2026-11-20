import { useCallback, useEffect, useState } from 'react'

const HABIT_HASH = /^#\/habit\/([^/]+)$/

/** The habit id in "#/habit/<id>", or null for the Today view. */
export function habitIdFromHash(hash: string): string | null {
  const match = HABIT_HASH.exec(hash)
  return match ? decodeURIComponent(match[1]!) : null
}

type HistoryState = { habitDetail: true } | null

/**
 * Which screen is showing: Today, or one habit's detail. Kept in the URL hash
 * so the browser or phone back button returns to Today.
 */
export function useRoute() {
  const [habitId, setHabitId] = useState(() => habitIdFromHash(window.location.hash))

  useEffect(() => {
    const sync = () => setHabitId(habitIdFromHash(window.location.hash))
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const openHabit = useCallback((id: string) => {
    const state: HistoryState = { habitDetail: true }
    window.history.pushState(state, '', `#/habit/${encodeURIComponent(id)}`)
    setHabitId(id)
  }, [])

  const goToday = useCallback(() => {
    const state = window.history.state as HistoryState
    if (state?.habitDetail) {
      // We pushed the detail entry, so step back to Today (popstate updates state).
      window.history.back()
    } else {
      // Opened directly from a link: replace instead, so Back doesn't leave the app.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setHabitId(null)
    }
  }, [])

  return { habitId, openHabit, goToday }
}
