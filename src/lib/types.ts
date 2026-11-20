import type { DateKey } from './dates.ts'

export type Habit = {
  id: string // crypto.randomUUID()
  name: string // 1–40 characters, trimmed
  color: string // one of 8 preset colors
  createdAt: DateKey
}

/** habitId -> list of "YYYY-MM-DD" */
export type Completions = Record<string, DateKey[]>

export type AppData = {
  version: 1
  habits: Habit[]
  completions: Completions
}
