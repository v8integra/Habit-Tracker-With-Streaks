import { describe, expect, it } from 'vitest'
import { HABIT_COLORS, getHabitColor, nextUnusedColor } from './colors.ts'

describe('HABIT_COLORS', () => {
  it('has 8 presets with unique ids', () => {
    expect(HABIT_COLORS).toHaveLength(8)
    expect(new Set(HABIT_COLORS.map((c) => c.id)).size).toBe(8)
  })
})

describe('getHabitColor', () => {
  it('finds a preset by id', () => {
    expect(getHabitColor('green').name).toBe('Green')
  })

  it('falls back to blue for an unknown id', () => {
    expect(getHabitColor('#123456').id).toBe('blue')
  })
})

describe('nextUnusedColor', () => {
  it('starts with the first preset', () => {
    expect(nextUnusedColor([]).id).toBe('red')
  })

  it('skips colors already in use', () => {
    expect(nextUnusedColor(['red', 'orange']).id).toBe('yellow')
  })

  it('wraps to the first preset when all are used', () => {
    expect(nextUnusedColor(HABIT_COLORS.map((c) => c.id)).id).toBe('red')
  })
})
