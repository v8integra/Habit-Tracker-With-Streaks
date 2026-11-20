import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { STORAGE_KEY } from './lib/storage.ts'

// Today is Friday, November 20, 2026.
function seed() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      habits: [
        { id: 'h1', name: 'Read', color: 'green', createdAt: '2026-11-01' },
        { id: 'h2', name: 'Walk', color: 'blue', createdAt: '2026-11-01' },
      ],
      completions: { h1: ['2026-11-18', '2026-11-19'] },
    }),
  )
}

/**
 * The checks every screen must pass:
 * - every button, checkbox, radio and text field has an accessible name;
 * - exactly one h1;
 * - no duplicate ids (they'd break label and aria links).
 */
function expectAccessible(screenName: string) {
  const controls = [
    ...screen.queryAllByRole('button'),
    ...screen.queryAllByRole('checkbox'),
    ...screen.queryAllByRole('radio'),
    ...screen.queryAllByRole('textbox'),
  ]
  expect(controls.length, screenName).toBeGreaterThan(0)
  for (const control of controls) {
    expect(control, `${screenName}: ${control.outerHTML.slice(0, 80)}`).toHaveAccessibleName()
  }

  expect(screen.getAllByRole('heading', { level: 1 }), screenName).toHaveLength(1)

  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id)
  expect(ids.length - new Set(ids).size, `${screenName}: duplicate ids`).toBe(0)
}

describe('Accessibility on every screen', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    document.title = ''
  })

  it('Today, empty', () => {
    render(<App />)
    expectAccessible('Today (empty)')
  })

  it('Today, with habits, and the add form', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    expectAccessible('Today')
    await user.click(screen.getByRole('button', { name: 'Add habit' }))
    expectAccessible('Add form')
    // The color choices are a labelled group.
    expect(screen.getByRole('group', { name: 'Color' })).toBeInTheDocument()
  })

  it('Habit detail, edit form and delete confirm', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Read/ }))
    expectAccessible('Detail')
    // Each of the last 7 days says whether it's done.
    for (const day of screen.getAllByRole('button', { pressed: true })) {
      expect(day).toHaveAccessibleName()
    }
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expectAccessible('Edit form')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    expectAccessible('Delete confirm')
  })

  it('Settings and its confirm step', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expectAccessible('Settings')
    await user.click(screen.getByRole('button', { name: 'Clear all data' }))
    expectAccessible('Clear confirm')
  })

  it('every screen sets the page title', async () => {
    seed()
    const user = userEvent.setup()
    render(<App />)
    expect(document.title).toBe('Habit Tracker')
    await user.click(screen.getByRole('button', { name: /^Read/ }))
    expect(document.title).toBe('Read · Habit Tracker')
    await user.click(screen.getByRole('button', { name: 'Today' }))
    await waitFor(() => expect(document.title).toBe('Habit Tracker'))
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(document.title).toBe('Settings · Habit Tracker')
  })

  it('the whole Today flow works with the keyboard alone', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Tab to "Add your first habit" and press Enter.
    await user.tab() // Settings
    await user.tab() // Add your first habit
    expect(screen.getByRole('button', { name: 'Add your first habit' })).toHaveFocus()
    await user.keyboard('{Enter}')

    // Type a name and press Enter to add it.
    expect(screen.getByLabelText('Name')).toHaveFocus()
    await user.keyboard('Read{Enter}')

    // Tab to the checkbox and press Space to check it off.
    const box = screen.getByRole('checkbox', { name: 'Read done today' })
    while (document.activeElement !== box) await user.tab()
    await user.keyboard(' ')
    expect(box).toBeChecked()

    // Shift+Tab to the habit name and press Enter to open its details.
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: /^Read/ })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Read' })).toHaveFocus()
  })

  it('the check-off animation plays only when checking, not on load', async () => {
    seed()
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, completions: { h1: ['2026-11-20'] } }))
    const user = userEvent.setup()
    render(<App />)
    const card = (name: string) =>
      screen.getByRole('checkbox', { name: `${name} done today` }).closest('.habit-card')!

    // Already done on load: no animation.
    expect(card('Read')).not.toHaveClass('just-done')

    await user.click(screen.getByRole('checkbox', { name: 'Walk done today' }))
    expect(card('Walk')).toHaveClass('just-done')

    // It clears when the animation ends.
    // jsdom only knows the old WebKit name for this event, so React listens
    // for that one there. Real browsers use "animationend".
    fireEvent(card('Walk'), new Event('webkitAnimationEnd', { bubbles: true }))
    expect(card('Walk')).not.toHaveClass('just-done')

    // Unchecking doesn't animate.
    await user.click(screen.getByRole('checkbox', { name: 'Walk done today' }))
    expect(card('Walk')).not.toHaveClass('just-done')
  })
})
