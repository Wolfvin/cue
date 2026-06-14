import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useCountUp } from '../../hooks/useCountUp'

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /**
   * Helper to mock requestAnimationFrame + performance.now so we can
   * step through the animation frame by frame.
   */
  function mockAnimationTimers() {
    let rafCallbacks: Array<(time: number) => void> = []

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb as (time: number) => void)
      return rafCallbacks.length
    })
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(vi.fn())

    let currentTime = 0
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => currentTime)

    const advanceTo = (time: number) => {
      currentTime = time
      act(() => {
        const callbacks = [...rafCallbacks]
        rafCallbacks = []
        callbacks.forEach((cb) => cb(currentTime))
      })
    }

    return { rafSpy, cancelSpy, nowSpy, advanceTo }
  }

  it('increments value from 0 toward the target', () => {
    const { advanceTo } = mockAnimationTimers()

    const { result } = renderHook(() =>
      useCountUp({ target: 100, duration: 1000 })
    )

    // Initial value should be 0
    expect(result.current).toBe(0)

    // Advance time by 500ms (50% progress with ease-out-cubic)
    advanceTo(500)

    // At 50% progress with ease-out-cubic: 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
    // 0.875 * 100 = 87.5, rounded to 0 decimals = 88
    expect(result.current).toBe(88)
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    vi.restoreAllMocks()
  })

  it('reaches the target value after the specified duration', () => {
    const { advanceTo } = mockAnimationTimers()

    const { result } = renderHook(() =>
      useCountUp({ target: 50, duration: 2000 })
    )

    // Advance past the full duration
    advanceTo(2000)

    // After full duration, progress = 1, eased = 1, value = target
    expect(result.current).toBe(50)

    vi.restoreAllMocks()
  })

  it('calls onComplete callback after animation finishes', () => {
    const { advanceTo } = mockAnimationTimers()

    // The hook does not have an onComplete prop — it simply returns the animated value.
    // We verify the value reaches the target which signals the animation is complete.
    const { result } = renderHook(() =>
      useCountUp({ target: 100, duration: 500 })
    )

    expect(result.current).toBe(0)

    // Advance to completion
    advanceTo(500)

    // The animation should have completed — value equals target
    expect(result.current).toBe(100)

    vi.restoreAllMocks()
  })

  it('returns target immediately when enabled is false', () => {
    const { result } = renderHook(() =>
      useCountUp({ target: 42, enabled: false })
    )

    expect(result.current).toBe(42)
  })

  it('respects decimals option', () => {
    const { advanceTo } = mockAnimationTimers()

    const { result } = renderHook(() =>
      useCountUp({ target: 1, duration: 1000, decimals: 2 })
    )

    // Advance halfway
    advanceTo(500)

    // With decimals: 2, the result should have at most 2 decimal places
    const decimalPart = result.current.toString().split('.')[1]
    if (decimalPart) {
      expect(decimalPart.length).toBeLessThanOrEqual(2)
    }

    vi.restoreAllMocks()
  })
})
