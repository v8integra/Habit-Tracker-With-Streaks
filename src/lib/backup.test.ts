import { describe, expect, it } from 'vitest'
import { backupFileName, parseBackup, serializeBackup } from './backup.ts'
import { emptyData } from './storage.ts'
import type { AppData } from './types.ts'

const data: AppData = {
  version: 1,
  habits: [{ id: 'h1', name: 'Read', color: 'green', createdAt: '2026-11-01' }],
  completions: { h1: ['2026-11-19', '2026-11-20'] },
}

describe('backupFileName', () => {
  it('includes the date', () => {
    expect(backupFileName('2026-11-20')).toBe('habit-tracker-backup-2026-11-20.json')
  })
})

describe('serializeBackup', () => {
  it('is readable, indented JSON that round-trips', () => {
    const text = serializeBackup(data)
    expect(text).toContain('\n  "version": 1')
    expect(parseBackup(text)).toEqual({ ok: true, data })
  })

  it('round-trips empty data', () => {
    expect(parseBackup(serializeBackup(emptyData()))).toEqual({ ok: true, data: emptyData() })
  })
})

describe('parseBackup', () => {
  it.each(['', '{oops', 'not json at all', '{"version":1,'])('rejects invalid JSON: %j', (text) => {
    expect(parseBackup(text)).toEqual({
      ok: false,
      error: "This file isn't valid JSON, so nothing was imported.",
    })
  })

  it.each([2, 0, '1', null])('rejects version %j', (version) => {
    const result = parseBackup(JSON.stringify({ ...data, version }))
    expect(result).toEqual({
      ok: false,
      error: 'This backup is from a different version of the app, so nothing was imported.',
    })
  })

  it.each([
    ['an array', '[]'],
    ['a number', '42'],
    ['JSON null', 'null'],
    ['no version', JSON.stringify({ habits: [], completions: {} })],
    ['a broken habit', JSON.stringify({ ...data, habits: [{ id: 'h1' }] })],
    ['a different app’s JSON', JSON.stringify({ name: 'my-package', dependencies: {} })],
  ])('rejects %s', (_label, text) => {
    expect(parseBackup(text)).toEqual({
      ok: false,
      error: "This file doesn't look like a Habit Tracker backup, so nothing was imported.",
    })
  })

  it('cleans up small problems the same way loading does', () => {
    const messy = {
      ...data,
      habits: [{ ...data.habits[0], name: '  Read  ' }],
      completions: { h1: ['2026-11-20', '2026-11-19', '2026-11-20', 'nope'], gone: ['2026-11-20'] },
    }
    expect(parseBackup(JSON.stringify(messy))).toEqual({ ok: true, data })
  })
})
