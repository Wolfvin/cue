import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HotspotOverlay } from '../../components/HotspotOverlay'
import type { Hotspot } from '../../components/HotspotOverlay'

describe('HotspotOverlay', () => {
  const baseHotspots: Hotspot[] = [
    { id: 'hs1', x: 100, y: 200, label: 'Feature A' },
    { id: 'hs2', x: 300, y: 400, label: 'Feature B' },
  ]

  it('renders hotspots at the correct x/y positions', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={baseHotspots}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // Each hotspot dot wrapper is positioned with absolute positioning
    // left = x - DOT_SIZE/2 = x - 6, top = y - DOT_SIZE/2 = y - 6
    const hotspotWrappers = container.querySelectorAll('div > div[style*="position: absolute"]')

    // Find the ones that are hotspot dot containers (have left/top positioning)
    const dotContainers: HTMLElement[] = []
    container.querySelectorAll('div').forEach((el) => {
      const style = (el as HTMLElement).style
      if (style.position === 'absolute' && style.left && style.top && style.cursor === 'pointer') {
        dotContainers.push(el as HTMLElement)
      }
    })

    expect(dotContainers.length).toBe(2)

    // First hotspot: x=100 → left = 100 - 6 = 94px
    expect(dotContainers[0].style.left).toBe('94px')
    // y=200 → top = 200 - 6 = 194px
    expect(dotContainers[0].style.top).toBe('194px')

    // Second hotspot: x=300 → left = 300 - 6 = 294px
    expect(dotContainers[1].style.left).toBe('294px')
    // y=400 → top = 400 - 6 = 394px
    expect(dotContainers[1].style.top).toBe('394px')
  })

  it('tooltip is not visible by default', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={baseHotspots}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // Tooltips should NOT be rendered when alwaysShow is false and not hovered
    expect(screen.queryByText('Feature A')).not.toBeInTheDocument()
    expect(screen.queryByText('Feature B')).not.toBeInTheDocument()
  })

  it('tooltip is visible when alwaysShow is true', () => {
    const hotspots: Hotspot[] = [
      { id: 'hs1', x: 100, y: 200, label: 'Always Visible', alwaysShow: true },
    ]

    render(
      <HotspotOverlay
        hotspots={hotspots}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // Tooltip should be rendered immediately when alwaysShow is true
    expect(screen.getByText('Always Visible')).toBeInTheDocument()
  })

  it('tooltip appears on hover and disappears on mouse leave', () => {
    const hotspots: Hotspot[] = [
      { id: 'hs1', x: 100, y: 200, label: 'Hover Me' },
    ]

    const { container } = render(
      <HotspotOverlay
        hotspots={hotspots}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // Not visible initially
    expect(screen.queryByText('Hover Me')).not.toBeInTheDocument()

    // Find the hotspot dot container
    const dotContainers: HTMLElement[] = []
    container.querySelectorAll('div').forEach((el) => {
      const style = (el as HTMLElement).style
      if (style.position === 'absolute' && style.left && style.top && style.cursor === 'pointer') {
        dotContainers.push(el as HTMLElement)
      }
    })
    expect(dotContainers.length).toBe(1)

    // Hover over the hotspot
    fireEvent.mouseEnter(dotContainers[0])
    expect(screen.getByText('Hover Me')).toBeInTheDocument()

    // Mouse leave
    fireEvent.mouseLeave(dotContainers[0])
    expect(screen.queryByText('Hover Me')).not.toBeInTheDocument()
  })

  it('renders multiple hotspots correctly', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={baseHotspots}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // Should render 2 hotspot dot containers
    const dotContainers: HTMLElement[] = []
    container.querySelectorAll('div').forEach((el) => {
      const style = (el as HTMLElement).style
      if (style.position === 'absolute' && style.left && style.top && style.cursor === 'pointer') {
        dotContainers.push(el as HTMLElement)
      }
    })

    expect(dotContainers.length).toBe(2)
  })

  it('renders empty overlay when hotspots array is empty', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={[]}
        containerWidth={800}
        containerHeight={600}
      />
    )

    // The overlay container should exist but have no hotspot children
    const overlay = container.firstChild as HTMLElement
    expect(overlay).toBeDefined()
    expect(overlay.children.length).toBe(0)
  })
})
