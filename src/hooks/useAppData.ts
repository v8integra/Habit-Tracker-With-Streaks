import { useCallback, useRef, useState } from 'react'
import type { DateKey } from '../lib/dates.ts'
import { addHabit, createHabit, toggleCompletion } from '../lib/habits.ts'
import { newId } from '../lib/ids.ts'
import { loadData, saveData } from '../lib/storage.ts'
import type { AppData } from '../lib/types.ts'

/** Problems with saved data worth telling the user about. */
export type StorageNotice = 'corrupt' | 'unavailable' | 'save-failed'

type Initial = { data: AppData; notice: StorageNotice | null }

function loadInitial(): Initial {
  const { data, status } = loadData()
  // A first visit ("empty") is normal and needs no notice.
  const notice = status === 'corrupt' || status === 'unavailable' ? status : null
  return { data, notice }
}

/**
 * The app's data, loaded from localStorage once and saved on every change.
 * Opening the app never writes; only a real change does.
 */
export function useAppData() {
  const [initial] = useState(loadInitial)
  const [data, setData] = useState(initial.data)
  const [notice, setNotice] = useState(initial.notice)
  // The latest data, updated right away so quick clicks build on each other.
  const latest = useRef(initial.data)

  const update = useCallback((change: (data: AppData) => AppData) => {
    const next = change(latest.current)
    latest.current = next
    setData(next)
    if (!saveData(next)) {
      // Keep a more specific notice (e.g. "unavailable") if one is showing.
      setNotice((current) => current ?? 'save-failed')
    }
  }, [])

  const add = useCallback(
    (input: { name: string; color: string }, today: DateKey) => {
      update((d) => addHabit(d, createHabit(input, today, newId())))
    },
    [update],
  )

  const toggle = useCallback(
    (habitId: string, date: DateKey) => {
      update((d) => toggleCompletion(d, habitId, date))
    },
    [update],
  )

  const dismissNotice = useCallback(() => setNotice(null), [])

  return { data, notice, add, toggle, dismissNotice }
}
