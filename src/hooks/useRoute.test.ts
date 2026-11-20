import { describe, expect, it } from 'vitest'
import { habitIdFromHash } from './useRoute.ts'

describe('habitIdFromHash', () => {
  it('reads a habit id', () => {
    expect(habitIdFromHash('#/habit/abc-123')).toBe('abc-123')
  })

  it('decodes the id', () => {
    expect(habitIdFromHash('#/habit/a%20b')).toBe('a b')
  })

  it.each(['', '#', '#/', '#/habit/', '#/habit/a/b', '#/settings', 'habit/abc'])(
    '"%s" is the Today screen',
    (hash) => {
      expect(habitIdFromHash(hash)).toBeNull()
    },
  )
})
