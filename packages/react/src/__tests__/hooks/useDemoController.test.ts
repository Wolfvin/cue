import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useDemoController } from '../../hooks/useDemoController'

describe('useDemoController', () => {
  it('currentStep starts at 0', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 5 })
    )

    expect(result.current.currentStep).toBe(0)
    expect(result.current.isFirst).toBe(true)
  })

  it('next() increments the step', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 5 })
    )

    // First call to next() starts the state machine (moves from -1 to 0 -> then next goes to 1)
    // Actually: the SM starts at currentIndex = -1. Calling next() when not started auto-calls start(),
    // which goes to index 0. So the first next() moves to step 0 (start), second moves to step 1.
    act(() => {
      result.current.next()
    })

    // First next() triggers start() which moves to step-0 (already there, but SM transitions)
    // The SM currentIndex starts at -1, so calling next() auto-starts → goes to step 0
    // Since currentStep was already 0 from useState, onTransition fires with step 0
    expect(result.current.currentStep).toBe(0)

    act(() => {
      result.current.next()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.isFirst).toBe(false)
  })

  it('prev() at step 0 does not decrement (isFirst = true)', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 5 })
    )

    // Start the state machine first
    act(() => {
      result.current.next()
    })
    expect(result.current.currentStep).toBe(0)

    // Try to go prev from step 0 — should stay at 0
    act(() => {
      result.current.prev()
    })

    expect(result.current.currentStep).toBe(0)
    expect(result.current.isFirst).toBe(true)
  })

  it('goTo(2) moves to step 2', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 5 })
    )

    act(() => {
      result.current.goTo(2)
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.isFirst).toBe(false)
    expect(result.current.isLast).toBe(false)
  })

  it('progress = currentStep / (totalSteps - 1)', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 5 })
    )

    // At step 0: progress = 0 / 4 = 0
    expect(result.current.progress).toBe(0)

    act(() => {
      result.current.goTo(2)
    })

    // At step 2: progress = 2 / 4 = 0.5
    expect(result.current.progress).toBe(0.5)

    act(() => {
      result.current.goTo(4)
    })

    // At step 4: progress = 4 / 4 = 1
    expect(result.current.progress).toBe(1)
  })

  it('isLast is true at the last step', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 3 })
    )

    expect(result.current.isLast).toBe(false)

    act(() => {
      result.current.goTo(2)
    })

    expect(result.current.isLast).toBe(true)
    expect(result.current.currentStep).toBe(2)
  })

  it('calls onStepChange when step changes', () => {
    const onStepChange = vi.fn()

    const { result } = renderHook(() =>
      useDemoController({ steps: 3, onStepChange })
    )

    act(() => {
      result.current.goTo(1)
    })

    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('goTo with invalid step index does not change step', () => {
    const { result } = renderHook(() =>
      useDemoController({ steps: 3 })
    )

    act(() => {
      result.current.goTo(-1)
    })
    expect(result.current.currentStep).toBe(0)

    act(() => {
      result.current.goTo(5)
    })
    expect(result.current.currentStep).toBe(0)
  })
})
