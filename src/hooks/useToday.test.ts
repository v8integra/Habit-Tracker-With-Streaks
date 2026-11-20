import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToday } from './useToday.ts'

describe('useToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 20, 23, 59, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns today's date", () => {
    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-11-20')
  })

  it('moves to the next day at midnight', () => {
    const { result } = renderHook(() => useToday())
    act(() => {
      vi.advanceTimersByTime(61_000)
    })
    expect(result.current).toBe('2026-11-21')
  })

  it('keeps going for a second midnight', () => {
    const { result } = renderHook(() => useToday())
    act(() => {
      vi.advanceTimersByTime(61_000)
    })
    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    })
    expect(result.current).toBe('2026-11-22')
  })

  it('catches up when the page becomes visible again (timers slept)', () => {
    const { result } = renderHook(() => useToday())
    // Jump the clock without running timers, as after a laptop sleeps.
    vi.setSystemTime(new Date(2026, 10, 23, 8, 0, 0))
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current).toBe('2026-11-23')
  })
})
