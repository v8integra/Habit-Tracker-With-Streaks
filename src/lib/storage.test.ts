import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  emptyData,
  loadData,
  parseAppData,
  saveData,
  type KeyValueStore,
} from './storage.ts'
import type { AppData } from './types.ts'

const habit = { id: 'h1', name: 'Read', color: '#3b82f6', createdAt: '2026-11-01' }

function sample(): AppData {
  return {
    version: 1,
    habits: [habit, { id: 'h2', name: 'Walk', color: '#22c55e', createdAt: '2026-11-10' }],
    completions: { h1: ['2026-11-18', '2026-11-19'], h2: ['2026-11-19'] },
  }
}

/** An in-memory store, optionally failing on read or write. */
function memoryStore(options: { failGet?: boolean; failSet?: boolean } = {}) {
  const items = new Map<string, string>()
  const store: KeyValueStore = {
    getItem(key) {
      if (options.failGet) throw new Error('SecurityError')
      return items.get(key) ?? null
    },
    setItem(key, value) {
      if (options.failSet) throw new Error('QuotaExceededError')
      items.set(key, value)
    },
  }
  return { store, items }
}

describe('loadData', () => {
  it('nothing saved yet: empty data, status "empty"', () => {
    const { store } = memoryStore()
    expect(loadData(store)).toEqual({ data: emptyData(), status: 'empty' })
  })

  it('round-trips saved data', () => {
    const { store } = memoryStore()
    expect(saveData(sample(), store)).toBe(true)
    expect(loadData(store)).toEqual({ data: sample(), status: 'ok' })
  })

  it('stores under the habit-tracker:v1 key', () => {
    const { store, items } = memoryStore()
    saveData(sample(), store)
    expect([...items.keys()]).toEqual([STORAGE_KEY])
    expect(STORAGE_KEY).toBe('habit-tracker:v1')
  })

  it.each([
    ['not JSON', '{oops'],
    ['an empty string', ''],
    ['JSON null', 'null'],
    ['a number', '42'],
    ['an array', '[]'],
    ['the wrong version', JSON.stringify({ ...sample(), version: 2 })],
    ['habits that is not a list', JSON.stringify({ ...sample(), habits: {} })],
    ['missing completions', JSON.stringify({ version: 1, habits: [] })],
  ])('broken data (%s): starts fresh, status "corrupt"', (_label, raw) => {
    const { store, items } = memoryStore()
    items.set(STORAGE_KEY, raw)
    expect(loadData(store)).toEqual({ data: emptyData(), status: 'corrupt' })
  })

  it('does not overwrite broken data just by loading it', () => {
    const { store, items } = memoryStore()
    items.set(STORAGE_KEY, '{oops')
    loadData(store)
    expect(items.get(STORAGE_KEY)).toBe('{oops')
  })

  it('storage that throws on read: starts fresh, status "unavailable"', () => {
    const { store } = memoryStore({ failGet: true })
    expect(loadData(store)).toEqual({ data: emptyData(), status: 'unavailable' })
  })

  it('no storage at all: status "unavailable"', () => {
    expect(loadData(null)).toEqual({ data: emptyData(), status: 'unavailable' })
  })

  it('uses the browser localStorage by default', () => {
    localStorage.clear()
    expect(saveData(sample())).toBe(true)
    expect(loadData()).toEqual({ data: sample(), status: 'ok' })
    localStorage.clear()
  })
})

describe('saveData', () => {
  it('returns false instead of throwing when storage is full or blocked', () => {
    const { store } = memoryStore({ failSet: true })
    expect(saveData(sample(), store)).toBe(false)
  })

  it('returns false with no storage', () => {
    expect(saveData(sample(), null)).toBe(false)
  })
})

describe('parseAppData', () => {
  let data: AppData
  beforeEach(() => {
    data = sample()
  })

  it('accepts valid data', () => {
    expect(parseAppData(data)).toEqual(data)
  })

  it('accepts empty data', () => {
    expect(parseAppData(emptyData())).toEqual(emptyData())
  })

  it('returns a copy, not the same object', () => {
    expect(parseAppData(data)).not.toBe(data)
  })

  it.each([
    ['missing id', { ...habit, id: undefined }],
    ['empty id', { ...habit, id: '' }],
    ['blank name', { ...habit, name: '   ' }],
    ['name over 40 characters', { ...habit, name: 'x'.repeat(41) }],
    ['name not a string', { ...habit, name: 7 }],
    ['missing color', { ...habit, color: undefined }],
    ['bad createdAt', { ...habit, createdAt: '2026-02-30' }],
    ['createdAt as a timestamp', { ...habit, createdAt: 1763600000000 }],
    ['not an object', 'Read'],
  ])('rejects a habit with %s', (_label, badHabit) => {
    expect(parseAppData({ ...data, habits: [badHabit] })).toBeNull()
  })

  it('accepts a 40-character name', () => {
    const name = 'x'.repeat(40)
    expect(parseAppData({ ...data, habits: [{ ...habit, name }] })?.habits[0]?.name).toBe(name)
  })

  it('trims habit names', () => {
    const parsed = parseAppData({ ...data, habits: [{ ...habit, name: '  Read  ' }] })
    expect(parsed?.habits[0]?.name).toBe('Read')
  })

  it('drops extra fields', () => {
    const parsed = parseAppData({ ...data, habits: [{ ...habit, archived: true }] })
    expect(parsed?.habits[0]).toEqual(habit)
  })

  it('rejects duplicate habit ids', () => {
    expect(parseAppData({ ...data, habits: [habit, { ...habit, name: 'Again' }] })).toBeNull()
  })

  it('rejects completions that are not lists of strings', () => {
    expect(parseAppData({ ...data, completions: { h1: '2026-11-19' } })).toBeNull()
    expect(parseAppData({ ...data, completions: { h1: [20261119] } })).toBeNull()
    expect(parseAppData({ ...data, completions: [] })).toBeNull()
  })

  it('drops invalid and duplicate dates, and sorts the rest', () => {
    const completions = { h1: ['2026-11-19', 'garbage', '2026-11-18', '2026-11-19', '2026-02-30'] }
    expect(parseAppData({ ...data, completions })?.completions.h1).toEqual([
      '2026-11-18',
      '2026-11-19',
    ])
  })

  it('drops completions for habits that no longer exist', () => {
    const completions = { ...data.completions, gone: ['2026-11-19'] }
    expect(parseAppData({ ...data, completions })?.completions).toEqual(data.completions)
  })

  it('treats a "__proto__" habit id as a normal key', () => {
    const raw = `{"version":1,"habits":[{"id":"__proto__","name":"Odd","color":"#000","createdAt":"2026-11-01"}],"completions":{"__proto__":["2026-11-19"]}}`
    const parsed = parseAppData(JSON.parse(raw))
    expect(parsed).not.toBeNull()
    expect(Object.getPrototypeOf(parsed?.completions)).toBe(Object.prototype)
    expect(Object.hasOwn(parsed?.completions ?? {}, '__proto__')).toBe(true)
  })
})
