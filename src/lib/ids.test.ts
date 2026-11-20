import { describe, expect, it } from 'vitest'
import { newId } from './ids.ts'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('newId', () => {
  it('returns a version 4 UUID', () => {
    expect(newId()).toMatch(UUID_V4)
  })

  it('falls back when crypto.randomUUID is missing (plain HTTP on a phone)', () => {
    // Hide randomUUID with an own property, then remove it to restore.
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true })
    try {
      expect(typeof crypto.randomUUID).toBe('undefined')
      const ids = new Set(Array.from({ length: 50 }, () => newId()))
      expect(ids.size).toBe(50)
      for (const id of ids) expect(id).toMatch(UUID_V4)
    } finally {
      Reflect.deleteProperty(crypto, 'randomUUID')
    }
    expect(typeof crypto.randomUUID).toBe('function')
  })
})
