import { describe, expect, it } from 'vitest'
import { hashFor, routeFromHash, type Route } from './useRoute.ts'

describe('routeFromHash', () => {
  it('reads a habit id', () => {
    expect(routeFromHash('#/habit/abc-123')).toEqual({ name: 'habit', habitId: 'abc-123' })
  })

  it('decodes the habit id', () => {
    expect(routeFromHash('#/habit/a%20b')).toEqual({ name: 'habit', habitId: 'a b' })
  })

  it('reads settings', () => {
    expect(routeFromHash('#/settings')).toEqual({ name: 'settings' })
  })

  it.each(['', '#', '#/', '#/habit/', '#/habit/a/b', '#/settings/x', 'habit/abc'])(
    '"%s" is the Today screen',
    (hash) => {
      expect(routeFromHash(hash)).toEqual({ name: 'today' })
    },
  )
})

describe('hashFor', () => {
  it.each<Route>([
    { name: 'today' },
    { name: 'settings' },
    { name: 'habit', habitId: 'h1' },
    { name: 'habit', habitId: 'a b/c' },
  ])('round-trips %j', (route) => {
    expect(routeFromHash(hashFor(route))).toEqual(route)
  })
})
