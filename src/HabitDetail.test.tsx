import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { STORAGE_KEY } from './lib/storage.ts'

// Today is Friday, November 20, 2026.
function seed(createdAt = '2026-11-10', completions = ['2026-11-12', '2026-11-13', '2026-11-14', '2026-11-18', '2026-11-19']) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      habits: [
        { id: 'h1', name: 'Read', color: 'green', createdAt },
        { id: 'h2', name: 'Walk', color: 'blue', createdAt: '2026-11-01' },
      ],
      completions: { h1: completions },
    }),
  )
}

function stat(label: string) {
  const term = screen.getByText(label, { selector: 'dt' })
  return term.nextElementSibling?.textContent
}

function dayButtons() {
  const table = screen.getByRole('table')
  return within(table).queryAllByRole('button')
}

async function openRead(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /^Read/ }))
}

describe('Habit detail', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens from a card, with focus on the habit name', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    const heading = screen.getByRole('heading', { level: 1, name: 'Read' })
    expect(heading).toHaveFocus()
    expect(window.location.hash).toBe('#/habit/h1')
  })

  it('shows current streak, best streak and total', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    expect(stat('Current streak')).toBe('2 days')
    expect(stat('Best streak')).toBe('3 days')
    expect(stat('Total')).toBe('5 days')
  })

  it('uses "1 day" for one', async () => {
    seed('2026-11-10', ['2026-11-20'])
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    expect(stat('Current streak')).toBe('1 day')
  })

  it('heatmap has 7 weekday rows and 12 weeks, ending today', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    // 1 month-label row (hidden from screen readers) + 7 weekday rows
    expect(screen.getAllByRole('rowheader').map((h) => h.textContent)).toEqual([
      'SSunday',
      'MMonday',
      'TTuesday',
      'WWednesday',
      'TThursday',
      'FFriday',
      'SSaturday',
    ])
    expect(rows.length).toBeGreaterThanOrEqual(7)
    expect(screen.getByRole('button', { name: 'Today, Friday, November 20' })).toBeInTheDocument()
    // Saturday, November 21 is in the future and shows nothing.
    expect(screen.queryByText(/November 21/)).not.toBeInTheDocument()
    // The oldest day shown is Sunday, August 30.
    expect(screen.getByText('Sunday, August 30: before this habit started')).toBeInTheDocument()
  })

  it('only the last 7 days are buttons, showing whether each is done', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    // Table order is row by row (Sunday row first), so Saturday Nov 14 comes last.
    const buttons = dayButtons()
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Sunday, November 15',
      'Monday, November 16',
      'Tuesday, November 17',
      'Wednesday, November 18',
      'Thursday, November 19',
      'Today, Friday, November 20',
      'Saturday, November 14',
    ])
    const pressed = buttons.filter((b) => b.getAttribute('aria-pressed') === 'true')
    expect(pressed.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Wednesday, November 18',
      'Thursday, November 19',
      'Saturday, November 14',
    ])
  })

  it('older days are read-only but still described', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    expect(screen.queryByRole('button', { name: 'Friday, November 13' })).not.toBeInTheDocument()
    expect(screen.getByText('Friday, November 13: done')).toBeInTheDocument()
    expect(screen.getByText('Wednesday, November 11: not done')).toBeInTheDocument()
  })

  it('days before the habit was created cannot be toggled', async () => {
    seed('2026-11-18', [])
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    expect(dayButtons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Wednesday, November 18',
      'Thursday, November 19',
      'Today, Friday, November 20',
    ])
    expect(screen.getByText('Monday, November 16: before this habit started')).toBeInTheDocument()
  })

  it('tapping today checks it off, updates the stats, and shows on Today', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    const today = screen.getByRole('button', { name: 'Today, Friday, November 20' })
    await user.click(today)
    expect(today).toHaveAttribute('aria-pressed', 'true')
    expect(stat('Current streak')).toBe('3 days')
    expect(stat('Total')).toBe('6 days')

    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByRole('checkbox', { name: 'Read done today' })).toBeChecked()
  })

  it('unchecking yesterday breaks the current streak', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    await user.click(screen.getByRole('button', { name: 'Thursday, November 19' }))
    expect(screen.getByRole('button', { name: 'Thursday, November 19' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(stat('Current streak')).toBe('0 days')
    expect(stat('Best streak')).toBe('3 days')
  })

  it('checking a past day fills a gap and is saved', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    // Nov 14 done, Nov 15–17 missing, Nov 18–19 done.
    for (const name of ['Sunday, November 15', 'Monday, November 16', 'Tuesday, November 17']) {
      await user.click(screen.getByRole('button', { name }))
    }
    // Now Nov 12 through Nov 19 is one run of 8.
    expect(stat('Current streak')).toBe('8 days')
    expect(stat('Best streak')).toBe('8 days')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.completions.h1).toContain('2026-11-16')
  })

  it('the Today button goes back and focuses the card that was opened', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    await user.click(screen.getByRole('button', { name: 'Today' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^Read/ })).toHaveFocus()
    expect(window.location.hash).toBe('')
  })

  it('the browser back button returns to Today', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await openRead(user)
    act(() => {
      window.history.back()
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    })
  })

  it('opening a habit link directly shows its detail; Today goes home', async () => {
    seed()
    window.history.replaceState(null, '', '/#/habit/h1')
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Read' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })

  it('a link to a habit that does not exist shows Today', () => {
    seed()
    window.history.replaceState(null, '', '/#/habit/nope')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('the card checkbox still checks off without opening the detail', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('checkbox', { name: 'Walk done today' }))
    expect(screen.getByRole('checkbox', { name: 'Walk done today' })).toBeChecked()
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })
})
