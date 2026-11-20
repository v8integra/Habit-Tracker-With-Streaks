import { useCallback, useEffect, useState } from 'react'

export type Route = { name: 'today' } | { name: 'habit'; habitId: string } | { name: 'settings' }

const TODAY: Route = { name: 'today' }
const HABIT_HASH = /^#\/habit\/([^/]+)$/

/** Reads the screen from the URL hash: "#/habit/<id>", "#/settings", or Today. */
export function routeFromHash(hash: string): Route {
  if (hash === '#/settings') return { name: 'settings' }
  const match = HABIT_HASH.exec(hash)
  if (match) return { name: 'habit', habitId: decodeURIComponent(match[1]!) }
  return TODAY
}

export function hashFor(route: Route): string {
  switch (route.name) {
    case 'habit':
      return `#/habit/${encodeURIComponent(route.habitId)}`
    case 'settings':
      return '#/settings'
    case 'today':
      return ''
  }
}

type HistoryState = { fromApp: true } | null

/**
 * Which screen is showing. Kept in the URL hash so the browser or phone back
 * button returns to Today.
 */
export function useRoute() {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash))

  useEffect(() => {
    const sync = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const navigate = useCallback((next: Route) => {
    const state: HistoryState = { fromApp: true }
    window.history.pushState(state, '', hashFor(next) || window.location.pathname)
    setRoute(next)
  }, [])

  const goToday = useCallback(() => {
    const state = window.history.state as HistoryState
    if (state?.fromApp) {
      // We pushed this entry, so step back to Today (popstate updates the route).
      window.history.back()
    } else {
      // Opened directly from a link: replace instead, so Back doesn't leave the app.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setRoute(TODAY)
    }
  }, [])

  return { route, navigate, goToday }
}
