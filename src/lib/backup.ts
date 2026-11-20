import type { DateKey } from './dates.ts'
import { parseAppData } from './storage.ts'
import type { AppData } from './types.ts'

/** Larger files are refused before reading. Years of daily data is well under 1 MB. */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export function backupFileName(today: DateKey): string {
  return `habit-tracker-backup-${today}.json`
}

/** The backup file's contents: the same AppData that's saved in the browser, indented. */
export function serializeBackup(data: AppData): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

export type BackupResult = { ok: true; data: AppData } | { ok: false; error: string }

/** Reads a backup file's text. Never throws. */
export function parseBackup(text: string): BackupResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: "This file isn't valid JSON, so nothing was imported." }
  }

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    !Array.isArray(parsed) &&
    'version' in parsed &&
    parsed.version !== 1
  ) {
    return {
      ok: false,
      error: "This backup is from a different version of the app, so nothing was imported.",
    }
  }

  const data = parseAppData(parsed)
  if (data === null) {
    return {
      ok: false,
      error: "This file doesn't look like a Habit Tracker backup, so nothing was imported.",
    }
  }
  return { ok: true, data }
}
