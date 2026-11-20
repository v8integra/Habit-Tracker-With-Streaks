import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { STORAGE_KEY } from './lib/storage.ts'

// Today is Friday, November 20, 2026.
const CURRENT = {
  version: 1,
  habits: [
    { id: 'h1', name: 'Read', color: 'green', createdAt: '2026-11-01' },
    { id: 'h2', name: 'Walk', color: 'blue', createdAt: '2026-11-01' },
  ],
  completions: { h1: ['2026-11-19', '2026-11-20'], h2: ['2026-11-20'] },
}

const BACKUP = {
  version: 1,
  habits: [
    { id: 'b1', name: 'Stretch', color: 'pink', createdAt: '2026-10-01' },
    { id: 'b2', name: 'Journal', color: 'teal', createdAt: '2026-10-01' },
    { id: 'b3', name: 'Water', color: 'blue', createdAt: '2026-10-01' },
  ],
  completions: { b1: ['2026-11-18', '2026-11-19'] },
}

function saved() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
}

function fileInput() {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')
  if (input === null) throw new Error('No file input')
  return input
}

function jsonFile(contents: string, name = 'backup.json') {
  return new File([contents], name, { type: 'application/json' })
}

async function openSettings(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Settings' }))
}

describe('Settings', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CURRENT))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('opens from Today and goes back, with focus on the Settings button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openSettings(user)
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toHaveFocus()
    expect(window.location.hash).toBe('#/settings')

    await user.click(screen.getByRole('button', { name: 'Today' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus()
  })

  it('Settings is there on an empty app too, so a backup can be restored', () => {
    localStorage.clear()
    render(<App />)
    expect(screen.getByText('No habits yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  describe('Export', () => {
    it('downloads all data as a dated JSON file', async () => {
      const blobs: Blob[] = []
      URL.createObjectURL = vi.fn((blob: Blob) => {
        blobs.push(blob)
        return 'blob:test'
      })
      URL.revokeObjectURL = vi.fn()
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.click(screen.getByRole('button', { name: 'Export JSON' }))

      expect(click).toHaveBeenCalledOnce()
      const link = click.mock.contexts[0] as HTMLAnchorElement
      expect(link.download).toBe('habit-tracker-backup-2026-11-20.json')
      expect(link.href).toBe('blob:test')
      expect(blobs[0]!.type).toBe('application/json')
      expect(JSON.parse(await blobs[0]!.text())).toEqual(CURRENT)
      expect(screen.getByRole('status')).toHaveTextContent('Exported 2 habits.')
      // The temporary link is removed again.
      expect(document.querySelector('a[download]')).toBeNull()
    })
  })

  describe('Import', () => {
    it('asks before replacing, with both counts, then replaces everything', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.upload(fileInput(), jsonFile(JSON.stringify(BACKUP)))

      const dialog = await screen.findByRole('alertdialog', { name: 'Replace all your data?' })
      expect(dialog).toHaveAccessibleDescription(
        'This replaces your 2 habits and their history with the 3 habits in this backup. This can’t be undone.',
      )
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus()
      // Nothing replaced yet.
      expect(saved()).toEqual(CURRENT)

      await user.click(within(dialog).getByRole('button', { name: 'Replace data' }))
      expect(screen.getByRole('status')).toHaveTextContent('Imported 3 habits.')
      expect(screen.getByRole('button', { name: 'Import JSON' })).toHaveFocus()
      expect(saved()).toEqual(BACKUP)

      await user.click(screen.getByRole('button', { name: 'Today' }))
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
      })
      expect(
        screen.getAllByRole('checkbox').map((box) => box.getAttribute('aria-label')),
      ).toEqual(['Stretch done today', 'Journal done today', 'Water done today'])
      expect(screen.getByText('2-day streak')).toBeInTheDocument()
    })

    it('Cancel keeps the current data', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.upload(fileInput(), jsonFile(JSON.stringify(BACKUP)))
      await user.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Import JSON' })).toHaveFocus()
      expect(saved()).toEqual(CURRENT)
    })

    it('the Import button opens the file picker', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      const click = vi.spyOn(fileInput(), 'click')
      await user.click(screen.getByRole('button', { name: 'Import JSON' }))
      expect(click).toHaveBeenCalledOnce()
    })

    it.each([
      ['not JSON', 'oops', "This file isn't valid JSON, so nothing was imported."],
      [
        'another version',
        JSON.stringify({ ...BACKUP, version: 2 }),
        'This backup is from a different version of the app, so nothing was imported.',
      ],
      [
        'the wrong shape',
        JSON.stringify({ habits: 'nope' }),
        "This file doesn't look like a Habit Tracker backup, so nothing was imported.",
      ],
    ])('a file that is %s shows an error and changes nothing', async (_label, text, error) => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.upload(fileInput(), jsonFile(text))
      expect(await screen.findByRole('alert')).toHaveTextContent(error)
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(saved()).toEqual(CURRENT)
    })

    it('a file over 5 MB is refused without reading it', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      const big = jsonFile('x')
      Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
      const text = vi.spyOn(big, 'text')
      await user.upload(fileInput(), big)
      expect(await screen.findByRole('alert')).toHaveTextContent('This file is too large')
      expect(text).not.toHaveBeenCalled()
      expect(saved()).toEqual(CURRENT)
    })

    it('the same file can be chosen twice in a row', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.upload(fileInput(), jsonFile('oops'))
      expect(fileInput().value).toBe('')
    })
  })

  describe('Clear all data', () => {
    it('asks first, then deletes everything', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.click(screen.getByRole('button', { name: 'Clear all data' }))

      const dialog = screen.getByRole('alertdialog', { name: 'Clear all data?' })
      expect(dialog).toHaveAccessibleDescription(
        'This deletes all 2 habits and their history from this browser. This can’t be undone.',
      )
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus()
      expect(saved()).toEqual(CURRENT)

      await user.click(within(dialog).getByRole('button', { name: 'Clear all data' }))
      expect(screen.getByRole('status')).toHaveTextContent('All data cleared.')
      expect(screen.getByRole('button', { name: 'Clear all data' })).toHaveFocus()
      expect(saved()).toEqual({ version: 1, habits: [], completions: {} })

      await user.click(screen.getByRole('button', { name: 'Today' }))
      await waitFor(() => expect(screen.getByText('No habits yet')).toBeInTheDocument())
    })

    it('reads naturally with one habit or none', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...CURRENT, habits: [CURRENT.habits[0]], completions: {} }),
      )
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await openSettings(user)
      await user.click(screen.getByRole('button', { name: 'Clear all data' }))
      expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(
        'This deletes your habit and its history from this browser. This can’t be undone.',
      )
      unmount()

      localStorage.clear()
      window.history.replaceState(null, '', '/')
      render(<App />)
      await openSettings(user)
      await user.upload(fileInput(), jsonFile(JSON.stringify(BACKUP)))
      expect(await screen.findByRole('alertdialog')).toHaveAccessibleDescription(
        'This replaces your current data with the 3 habits in this backup. This can’t be undone.',
      )
    })

    it('Cancel keeps everything', async () => {
      const user = userEvent.setup()
      render(<App />)
      await openSettings(user)
      await user.click(screen.getByRole('button', { name: 'Clear all data' }))
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear all data' })).toHaveFocus()
      expect(saved()).toEqual(CURRENT)
    })
  })
})
