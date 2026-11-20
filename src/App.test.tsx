import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { BACKUP_KEY, STORAGE_KEY } from './lib/storage.ts'

function setup() {
  const user = userEvent.setup()
  const view = render(<App />)
  return { user, ...view }
}

async function addHabit(user: ReturnType<typeof userEvent.setup>, name: string) {
  const start =
    screen.queryByRole('button', { name: 'Add habit' }) ??
    screen.getByRole('button', { name: 'Add your first habit' })
  await user.click(start)
  await user.type(screen.getByLabelText('Name'), name)
  await user.click(screen.getByRole('button', { name: 'Add' }))
}

function progress() {
  return screen.getByRole('progressbar', { name: "Today's progress" })
}

describe('Today page', () => {
  beforeEach(() => {
    localStorage.clear()
    // Fake only Date, so user-event's timers still run normally.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows today's date", () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByText('Friday, November 20')).toBeInTheDocument()
  })

  it('shows the empty state on a first visit, with no notice', () => {
    setup()
    expect(screen.getByText('No habits yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add your first habit' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('adds a first habit from the empty state', async () => {
    const { user } = setup()
    await addHabit(user, 'Read 10 pages')
    expect(screen.getByRole('checkbox', { name: 'Read 10 pages done today' })).not.toBeChecked()
    expect(screen.queryByText('No habits yet')).not.toBeInTheDocument()
    expect(progress()).toHaveAttribute('aria-valuetext', '0 of 1 done')
  })

  it('focuses the name field when the form opens', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first habit' }))
    expect(screen.getByLabelText('Name')).toHaveFocus()
  })

  it('trims the name', async () => {
    const { user } = setup()
    await addHabit(user, '   Walk   ')
    expect(screen.getByRole('checkbox', { name: 'Walk done today' })).toBeInTheDocument()
  })

  it('shows an error for a blank name and adds nothing', async () => {
    const { user } = setup()
    await addHabit(user, '   ')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a name.')
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('limits the name to 40 characters', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first habit' }))
    await user.type(screen.getByLabelText('Name'), 'x'.repeat(45))
    expect(screen.getByLabelText('Name')).toHaveValue('x'.repeat(40))
  })

  it('cancel closes the form without adding', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first habit' }))
    await user.type(screen.getByLabelText('Name'), 'Read')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    expect(screen.getByText('No habits yet')).toBeInTheDocument()
  })

  it('Escape closes the form', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Add your first habit' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
  })

  it('picks an unused color by default, and lets you choose another', async () => {
    const { user } = setup()
    await addHabit(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Add habit' }))
    const colors = screen.getByRole('group', { name: 'Color' })
    expect(within(colors).getAllByRole('radio')).toHaveLength(8)
    // Red is taken by "Read", so orange is picked for the next one.
    expect(within(colors).getByRole('radio', { name: 'Orange' })).toBeChecked()
    await user.click(within(colors).getByRole('radio', { name: 'Teal' }))
    await user.type(screen.getByLabelText('Name'), 'Walk')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.habits.map((h: { color: string }) => h.color)).toEqual(['red', 'teal'])
  })

  it('checks a habit off with one click, and undoes with another', async () => {
    const { user } = setup()
    await addHabit(user, 'Read')
    await addHabit(user, 'Walk')
    const read = screen.getByRole('checkbox', { name: 'Read done today' })

    await user.click(read)
    expect(read).toBeChecked()
    expect(progress()).toHaveAttribute('aria-valuetext', '1 of 2 done')
    expect(screen.getByText('1 of 2 done')).toBeInTheDocument()

    await user.click(read)
    expect(read).not.toBeChecked()
    expect(progress()).toHaveAttribute('aria-valuetext', '0 of 2 done')
  })

  it('clicking the habit name also toggles it', async () => {
    const { user } = setup()
    await addHabit(user, 'Read')
    await user.click(screen.getByText('Read'))
    expect(screen.getByRole('checkbox', { name: 'Read done today' })).toBeChecked()
  })

  it('keeps habits and check-offs after a refresh', async () => {
    const { user, unmount } = setup()
    await addHabit(user, 'Read')
    await addHabit(user, 'Walk')
    await user.click(screen.getByRole('checkbox', { name: 'Walk done today' }))
    unmount()

    render(<App />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Read done today',
      'Walk done today',
    ])
    expect(screen.getByRole('checkbox', { name: 'Walk done today' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Read done today' })).not.toBeChecked()
  })

  it('saves dates as local YYYY-MM-DD, even late at night', async () => {
    vi.setSystemTime(new Date(2026, 10, 20, 23, 59, 0))
    const { user } = setup()
    await addHabit(user, 'Read')
    await user.click(screen.getByRole('checkbox', { name: 'Read done today' }))
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const id = saved.habits[0].id
    expect(saved.habits[0].createdAt).toBe('2026-11-20')
    expect(saved.completions[id]).toEqual(['2026-11-20'])
  })

  it('does not write to storage just by opening the app', () => {
    setup()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('shows a notice for broken saved data, keeps a backup, and can dismiss it', async () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    const { user } = setup()
    expect(screen.getByRole('status')).toHaveTextContent("Your saved data couldn't be read")
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{oops')
    expect(screen.getByText('No habits yet')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows a notice when a save fails', async () => {
    const { user } = setup()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    try {
      await addHabit(user, 'Read')
      expect(screen.getByRole('status')).toHaveTextContent("Your last change couldn't be saved")
    } finally {
      setItem.mockRestore()
    }
  })
})
