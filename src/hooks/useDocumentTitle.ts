import { useEffect } from 'react'

export const APP_NAME = 'Habit Tracker'

/** Sets the browser tab title, e.g. "Read · Habit Tracker". Screen readers announce it on screen changes. */
export function useDocumentTitle(page: string | null) {
  useEffect(() => {
    document.title = page === null ? APP_NAME : `${page} · ${APP_NAME}`
  }, [page])
}
