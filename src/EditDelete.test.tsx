import { render, screen, waitFor, within } from '@testing-library/react'
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
      completions: { h1: ['2026-11-18', '2026-11-19'], h2: ['2026-11-20'] },
    }),
  )
}

function saved() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
}

async function openDetail(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
}

describe('Edit a habit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
    seed()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Edit opens a form filled with the current name and color', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const form = screen.getByRole('form', { name: 'Edit habit' })
    expect(within(form).getByLabelText('Name')).toHaveValue('Read')
    expect(within(form).getByLabelText('Name')).toHaveFocus()
    expect(within(form).getByRole('radio', { name: 'Green' })).toBeChecked()
  })

  it('renames a habit and keeps its history', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const name = screen.getByLabelText('Name')
    await user.clear(name)
    await user.type(name, '  Read 20 pages ')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Read 20 pages' })).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus()
    expect(saved().habits[0]).toMatchObject({ id: 'h1', name: 'Read 20 pages', color: 'green' })
    expect(saved().completions.h1).toEqual(['2026-11-18', '2026-11-19'])

    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByRole('checkbox', { name: 'Read 20 pages done today' })).toBeInTheDocument()
    expect(screen.getByText('2-day streak')).toBeInTheDocument()
  })

  it('changes the color', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('radio', { name: 'Purple' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(saved().habits[0].color).toBe('purple')
  })

  it('rejects a blank name and saves nothing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByLabelText('Name'))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a name.')
    expect(saved().habits[0].name).toBe('Read')
  })

  it('limits the name to 40 characters', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('Name'), 'x'.repeat(50))
    expect(screen.getByLabelText('Name')).toHaveValue(`Read${'x'.repeat(36)}`)
  })

  it('Cancel keeps the old name and color, and returns focus to Edit', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.type(screen.getByLabelText('Name'), ' more')
    await user.click(screen.getByRole('radio', { name: 'Pink' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Read' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus()
    expect(saved().habits[0]).toMatchObject({ name: 'Read', color: 'green' })
  })

  it('Escape cancels editing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })
})

describe('Delete a habit', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 9, 0, 0))
    seed()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('asks to confirm first, with focus on Cancel', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Delete “Read”?' })
    expect(dialog).toHaveAccessibleDescription(
      'This removes the habit and all of its history. This can’t be undone.',
    )
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus()
    // Nothing deleted yet.
    expect(saved().habits).toHaveLength(2)
  })

  it('Cancel keeps the habit and returns focus to Delete habit', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete habit' })).toHaveFocus()
    expect(saved().habits).toHaveLength(2)
  })

  it('Escape cancels the delete', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(saved().habits).toHaveLength(2)
  })

  it('confirming deletes the habit and its history, and returns to Today', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const heading = screen.getByRole('heading', { level: 1, name: 'Today' })
    expect(heading).toHaveFocus()
    expect(screen.queryByRole('checkbox', { name: 'Read done today' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Walk done today' })).toBeChecked()
    expect(screen.getByText('1 of 1 done')).toBeInTheDocument()
    expect(saved().habits.map((h: { id: string }) => h.id)).toEqual(['h2'])
    expect(saved().completions).toEqual({ h2: ['2026-11-20'] })
    await waitFor(() => expect(window.location.hash).toBe(''))
  })

  it('deleting the last habit shows the empty state', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const name of ['Read', 'Walk']) {
      await openDetail(user, name)
      await user.click(screen.getByRole('button', { name: 'Delete habit' }))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      await waitFor(() => expect(window.location.hash).toBe(''))
    }
    expect(screen.getByText('No habits yet')).toBeInTheDocument()
    expect(saved()).toEqual({ version: 1, habits: [], completions: {} })
  })

  it('deleting from a habit link (not a card) still focuses the Today heading', async () => {
    window.history.replaceState(null, '', '/#/habit/h1')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toHaveFocus()
  })

  it('going back from a habit link focuses that card', async () => {
    window.history.replaceState(null, '', '/#/habit/h1')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByRole('button', { name: /^Read/ })).toHaveFocus()
  })

  it('a deleted habit stays deleted after a refresh', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await openDetail(user, 'Read')
    await user.click(screen.getByRole('button', { name: 'Delete habit' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    unmount()
    render(<App />)
    expect(screen.queryByText('Read')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Walk done today' })).toBeInTheDocument()
  })
})
