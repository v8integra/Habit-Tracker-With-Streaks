import { describe, expect, it } from 'vitest'
import {
  addHabit,
  createHabit,
  isDoneOn,
  progressOn,
  toggleCompletion,
  validateHabitName,
} from './habits.ts'
import { emptyData } from './storage.ts'
import type { AppData } from './types.ts'

const TODAY = '2026-11-20'

function withHabits(): AppData {
  let data = emptyData()
  data = addHabit(data, createHabit({ name: 'Read', color: 'blue' }, TODAY, 'h1'))
  data = addHabit(data, createHabit({ name: 'Walk', color: 'green' }, TODAY, 'h2'))
  return data
}

describe('validateHabitName', () => {
  it('accepts a normal name', () => {
    expect(validateHabitName('Read')).toBeNull()
  })

  it('rejects an empty or blank name', () => {
    expect(validateHabitName('')).toBe('Enter a name.')
    expect(validateHabitName('   ')).toBe('Enter a name.')
  })

  it('allows exactly 40 characters, after trimming', () => {
    expect(validateHabitName('x'.repeat(40))).toBeNull()
    expect(validateHabitName(`  ${'x'.repeat(40)}  `)).toBeNull()
  })

  it('rejects 41 characters', () => {
    expect(validateHabitName('x'.repeat(41))).toBe('Use 40 characters or fewer.')
  })
})

describe('createHabit', () => {
  it('trims the name and sets createdAt to today', () => {
    expect(createHabit({ name: '  Read  ', color: 'blue' }, TODAY, 'h1')).toEqual({
      id: 'h1',
      name: 'Read',
      color: 'blue',
      createdAt: TODAY,
    })
  })
})

describe('addHabit', () => {
  it('adds to the end, keeping creation order', () => {
    expect(withHabits().habits.map((h) => h.name)).toEqual(['Read', 'Walk'])
  })

  it('does not change the original data', () => {
    const data = emptyData()
    addHabit(data, createHabit({ name: 'Read', color: 'blue' }, TODAY, 'h1'))
    expect(data.habits).toEqual([])
  })
})

describe('toggleCompletion', () => {
  it('checks a habit off, then unchecks it', () => {
    const once = toggleCompletion(withHabits(), 'h1', TODAY)
    expect(isDoneOn(once, 'h1', TODAY)).toBe(true)
    const twice = toggleCompletion(once, 'h1', TODAY)
    expect(isDoneOn(twice, 'h1', TODAY)).toBe(false)
  })

  it('only affects the given habit', () => {
    const data = toggleCompletion(withHabits(), 'h1', TODAY)
    expect(isDoneOn(data, 'h2', TODAY)).toBe(false)
  })

  it('keeps dates sorted', () => {
    let data = withHabits()
    data = toggleCompletion(data, 'h1', TODAY)
    data = toggleCompletion(data, 'h1', '2026-11-18')
    expect(data.completions.h1).toEqual(['2026-11-18', TODAY])
  })

  it('does not change the original data', () => {
    const data = withHabits()
    toggleCompletion(data, 'h1', TODAY)
    expect(data.completions).toEqual({})
  })
})

describe('progressOn', () => {
  it('no habits', () => {
    expect(progressOn(emptyData(), TODAY)).toEqual({ done: 0, total: 0 })
  })

  it('counts habits done on that date only', () => {
    let data = withHabits()
    data = toggleCompletion(data, 'h1', TODAY)
    data = toggleCompletion(data, 'h2', '2026-11-19')
    expect(progressOn(data, TODAY)).toEqual({ done: 1, total: 2 })
  })
})
