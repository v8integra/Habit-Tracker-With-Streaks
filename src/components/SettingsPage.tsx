import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { MAX_BACKUP_BYTES, backupFileName, parseBackup, serializeBackup } from '../lib/backup.ts'
import type { DateKey } from '../lib/dates.ts'
import { downloadTextFile } from '../lib/download.ts'
import { emptyData } from '../lib/storage.ts'
import type { AppData } from '../lib/types.ts'
import ConfirmPanel from './ConfirmPanel.tsx'

type Props = {
  data: AppData
  today: DateKey
  onBack: () => void
  onReplaceAll: (data: AppData) => void
}

type Pending = { kind: 'import'; data: AppData } | { kind: 'clear' } | null
type Message = { text: string; error: boolean } | null

function habits(n: number): string {
  return n === 1 ? '1 habit' : `${n} habits`
}

function importMessage(current: number, incoming: number): string {
  const replaced = current === 0 ? 'your current data' : `your ${habits(current)} and their history`
  return `This replaces ${replaced} with the ${habits(incoming)} in this backup. This can’t be undone.`
}

function clearMessage(current: number): string {
  const what =
    current === 0
      ? 'all data'
      : current === 1
        ? 'your habit and its history'
        : `all ${current} habits and their history`
  return `This deletes ${what} from this browser. This can’t be undone.`
}

export default function SettingsPage({ data, today, onBack, onReplaceAll }: Props) {
  const [pending, setPending] = useState<Pending>(null)
  useDocumentTitle('Settings')
  const [message, setMessage] = useState<Message>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLButtonElement>(null)
  const clearRef = useRef<HTMLButtonElement>(null)
  // Which button gets focus back when a confirm step closes.
  const returnFocusTo = useRef<'import' | 'clear' | null>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    if (pending !== null || returnFocusTo.current === null) return
    const target = returnFocusTo.current === 'import' ? importRef.current : clearRef.current
    target?.focus()
    returnFocusTo.current = null
  }, [pending])

  function closeTo(button: 'import' | 'clear') {
    returnFocusTo.current = button
    setPending(null)
  }

  function handleExport() {
    downloadTextFile(backupFileName(today), serializeBackup(data))
    setMessage({ text: `Exported ${habits(data.habits.length)}.`, error: false })
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    // Clear the input so choosing the same file again still triggers a change.
    input.value = ''
    if (file === undefined) return

    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({
        text: 'This file is too large to be a backup, so nothing was imported.',
        error: true,
      })
      return
    }

    const result = parseBackup(await file.text())
    if (!result.ok) {
      setMessage({ text: result.error, error: true })
      return
    }
    setMessage(null)
    setPending({ kind: 'import', data: result.data })
  }

  return (
    <main className="page">
      <button type="button" className="button back-button" onClick={onBack}>
        <span aria-hidden="true">← </span>Today
      </button>

      <h1 ref={headingRef} tabIndex={-1} className="settings-title">
        Settings
      </h1>

      {message !== null && (
        <p
          className={message.error ? 'settings-message is-error' : 'settings-message'}
          role={message.error ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}

      {pending?.kind === 'import' ? (
        <ConfirmPanel
          title="Replace all your data?"
          message={importMessage(data.habits.length, pending.data.habits.length)}
          confirmLabel="Replace data"
          onConfirm={() => {
            onReplaceAll(pending.data)
            setMessage({ text: `Imported ${habits(pending.data.habits.length)}.`, error: false })
            closeTo('import')
          }}
          onCancel={() => closeTo('import')}
        />
      ) : pending?.kind === 'clear' ? (
        <ConfirmPanel
          title="Clear all data?"
          message={clearMessage(data.habits.length)}
          confirmLabel="Clear all data"
          onConfirm={() => {
            onReplaceAll(emptyData())
            setMessage({ text: 'All data cleared.', error: false })
            closeTo('clear')
          }}
          onCancel={() => closeTo('clear')}
        />
      ) : (
        <>
          <section className="settings-section" aria-labelledby="backup-title">
            <h2 id="backup-title">Backup</h2>
            <p>Save your habits and history as a JSON file, or restore them from one.</p>
            <div className="settings-actions">
              <button type="button" className="button" onClick={handleExport}>
                Export JSON
              </button>
              <button
                ref={importRef}
                type="button"
                className="button"
                onClick={() => fileRef.current?.click()}
              >
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => void handleFile(event)}
              />
            </div>
          </section>

          <section className="settings-section" aria-labelledby="clear-title">
            <h2 id="clear-title">Clear data</h2>
            <p>Delete every habit and all history from this browser.</p>
            <div className="settings-actions">
              <button
                ref={clearRef}
                type="button"
                className="button button-danger-outline"
                onClick={() => {
                  setMessage(null)
                  setPending({ kind: 'clear' })
                }}
              >
                Clear all data
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
