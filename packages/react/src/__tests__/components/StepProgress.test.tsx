import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StepProgress } from '../../components/StepProgress'

describe('StepProgress', () => {
  it('renders N dots in dots variant', () => {
    const { container } = render(
      <StepProgress current={0} total={4} variant="dots" />
    )

    // The dots variant renders a flex container with N child divs
    const dotsContainer = container.firstChild as HTMLElement
    const dots = dotsContainer.querySelectorAll('div > div')
    // There are 4 dots rendered as direct children of the flex container
    expect(dots.length).toBe(4)
  })

  it('active dot has different (red) background color', () => {
    const { container } = render(
      <StepProgress current={2} total={4} variant="dots" />
    )

    const dotsContainer = container.firstChild as HTMLElement
    const dots = Array.from(dotsContainer.querySelectorAll('div > div'))

    // The active dot (index 2) should have the ACCENT color (#C91C1C)
    const activeDot = dots[2]
    expect(activeDot).toBeDefined()
    expect(activeDot.style.backgroundColor).toBe('rgb(201, 28, 28)') // #C91C1C in rgb

    // Inactive dots should have the INACTIVE color (#4B5563)
    const inactiveDot = dots[0]
    expect(inactiveDot.style.backgroundColor).toBe('rgb(75, 85, 99)') // #4B5563 in rgb
  })

  it('active dot is larger than inactive dots', () => {
    const { container } = render(
      <StepProgress current={1} total={3} variant="dots" />
    )

    const dotsContainer = container.firstChild as HTMLElement
    const dots = Array.from(dotsContainer.querySelectorAll('div > div'))

    // Active dot (index 1) should be 12px wide/tall
    const activeDot = dots[1]
    expect(activeDot.style.width).toBe('12px')
    expect(activeDot.style.height).toBe('12px')

    // Inactive dot (index 0) should be 8px wide/tall
    const inactiveDot = dots[0]
    expect(inactiveDot.style.width).toBe('8px')
    expect(inactiveDot.style.height).toBe('8px')
  })

  it('renders bar variant with width percentage', () => {
    const { container } = render(
      <StepProgress current={1} total={4} variant="bar" />
    )

    // Bar variant: track container with an inner fill div
    const track = container.firstChild as HTMLElement
    expect(track).toBeDefined()

    const fill = track.querySelector('div') as HTMLElement
    expect(fill).toBeDefined()

    // current=1, total=4 → pct = (1 / 3) * 100 ≈ 33.33%
    expect(fill.style.width).toBe('33.33333333333333%')
  })

  it('bar variant at last step has 100% width', () => {
    const { container } = render(
      <StepProgress current={3} total={4} variant="bar" />
    )

    const track = container.firstChild as HTMLElement
    const fill = track.querySelector('div') as HTMLElement

    // current=3, total=4 → pct = (3 / 3) * 100 = 100%
    expect(fill.style.width).toBe('100%')
  })

  it('defaults to dots variant when variant is not specified', () => {
    const { container } = render(
      <StepProgress current={0} total={3} />
    )

    // Default is dots — should render dots (flex container with child divs)
    const dotsContainer = container.firstChild as HTMLElement
    expect(dotsContainer.style.display).toBe('flex')
    const dots = dotsContainer.querySelectorAll('div > div')
    expect(dots.length).toBe(3)
  })
})
