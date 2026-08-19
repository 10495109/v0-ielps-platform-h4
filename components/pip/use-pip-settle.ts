'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The settled-state collision rule for Pip, 19 August 2026.
 *
 * While the learner is actively scrolling, Pip is left completely alone: it
 * keeps its approved anchor and its approved size, and it is allowed to pass
 * over whatever happens to be under it. Transient overlap during motion is
 * expected and permitted.
 *
 * The rule applies once the page is still. On settle, Pip looks at what is
 * actually in the viewport and asks a single question: am I sitting on top of
 * something the learner needs to press? Buttons, answer options, form inputs,
 * primary calls to action and navigation all count. If the answer is no —
 * which is the common case — nothing changes at all and Pip keeps exactly the
 * appearance that was approved. If the answer is yes, Pip shrinks to a compact
 * circle and moves along the nearest screen edge to the closest slot where it
 * covers nothing.
 *
 * Two deliberate choices worth stating:
 *
 * The search only walks the left and right edges of the viewport. Pip is a
 * corner assistant and should stay one; landing in the middle of a reading
 * passage would be worse than the problem it solves.
 *
 * Where no clear slot exists on either edge — a stacked card list at 390px,
 * where every card runs the full width — Pip tucks against the edge instead.
 *
 * The tuck was refined on 19 August after review. A narrow sliver of a circle
 * cleared every control but was not recognisable as Pip, so the tucked state is
 * now a tall handle rather than a fraction of a disc: the visible width is
 * still only as wide as the page gutter allows, but it is TUCK_HEIGHT tall, it
 * shows the mascot, and it is the search's own collision box, so the extra
 * height is proven clear rather than assumed. One tap on the handle restores
 * the full launcher; settling re-arms on the next scroll or resize, so a
 * learner who wants Pip back gets it and the page still protects itself
 * afterwards.
 *
 * If even the handle cannot be placed clear, Pip takes the position that covers
 * the least and reports `obstructed` rather than quietly pretending it
 * succeeded. Nothing in the build currently reaches that branch, but a future
 * screen might, and it should be visible when it does.
 */

export type PipSettle = {
  /** True while the page is moving. Pip is left at its approved anchor. */
  scrolling: boolean
  /** Set once Pip has had to shrink and move to clear a control. */
  moved: boolean
  /** Inline position for the launcher, in viewport pixels. */
  left?: number
  top?: number
  /** Rendered size of the adapted launcher. */
  width?: number
  height?: number
  /** Pip is parked against the edge, leaving a tall handle in the gutter. */
  tucked: boolean
  /** Visible width of the tucked handle, in pixels. */
  peek?: number
  /** Which screen edge the handle is against, so the mascot can sit inside it. */
  side?: 'left' | 'right'
  /** No fully clear slot existed; this is the least-obstructive one found. */
  obstructed: boolean
}

type Box = { left: number; top: number; right: number; bottom: number }

const IDLE_MS = 180

/**
 * The tucked handle is deliberately taller than it is wide. Vertical area is
 * the only dimension the page gutter does not constrain, so it is where the
 * affordance has to come from.
 */
const TUCK_HEIGHT = 72
const TUCK_HEIGHT_COMPACT = 64

/**
 * What counts as something a learner must be able to press. Deliberately wide:
 * a card that is itself a link is the card's Open action, so it is included.
 */
const CONTROL_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="radio"]',
].join(',')

function isReachable(el: Element) {
  if (el.getAttribute('aria-hidden') === 'true') return false
  if ((el as HTMLButtonElement).disabled) return false
  const style = getComputedStyle(el)
  if (style.visibility === 'hidden' || style.display === 'none') return false
  if (parseFloat(style.opacity) === 0) return false
  if (style.pointerEvents === 'none') return false
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return false
  // Only what is on screen right now matters; Pip is fixed to the viewport.
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
}

function overlapArea(a: Box, b: Box) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  if (x <= 0 || y <= 0) return 0
  return x * y
}

function collectObstacles(root: Element | null): Box[] {
  const out: Box[] = []
  document.querySelectorAll(CONTROL_SELECTOR).forEach((el) => {
    if (root && root.contains(el)) return
    if (!isReachable(el)) return
    const r = el.getBoundingClientRect()
    out.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })
  })
  return out
}

type Slot = {
  left: number
  top: number
  width: number
  height: number
  area: number
  tucked: boolean
  peek: number
  side: 'left' | 'right'
}

/**
 * Walk the right edge from the bottom upward, then the left edge, looking for a
 * square of `size` that touches nothing.
 *
 * If neither edge has room — a stacked card list at 390px is the real case,
 * where every card runs the full width and the only clear channel is the 16px
 * page gutter — Pip tucks instead: a tall handle occupying the gutter, with the
 * rest of the button past the edge of the screen so the touch target stays
 * generous. The handle is measured at its full rendered height, clipped to the
 * viewport, so the height is verified clear rather than assumed. The tuck is
 * tried at several widths and the widest one that stays clear wins, so it only
 * gets as narrow as the page forces it to be.
 *
 * Returns the first clear slot, or the least-obstructive one if the page has no
 * clear position at all.
 */
function findSlot(size: number, margin: number, obstacles: Box[]): Slot | null {
  const step = 8
  const tuckHeight = window.innerWidth < 560 ? TUCK_HEIGHT_COMPACT : TUCK_HEIGHT

  let best: Slot | null = null

  const consider = (
    left: number,
    top: number,
    width: number,
    height: number,
    tucked: boolean,
    peek: number,
  ): Slot | null => {
    // Only the on-screen part of the button can cover anything, so the box is
    // clipped to the viewport before it is compared.
    const box: Box = {
      left: Math.max(left, 0),
      top,
      right: Math.min(left + width, window.innerWidth),
      bottom: top + height,
    }
    let area = 0
    for (const o of obstacles) area += overlapArea(box, o)
    const slot: Slot = {
      left,
      top,
      width,
      height,
      area,
      tucked,
      peek,
      side: left + width / 2 > window.innerWidth / 2 ? 'right' : 'left',
    }
    if (area === 0) return slot
    if (!best || area < best.area) best = slot
    return null
  }

  const scanColumn = (
    left: number,
    width: number,
    height: number,
    tucked: boolean,
    peek: number,
  ) => {
    const maxTop = window.innerHeight - margin - height
    for (let top = maxTop; top >= margin; top -= step) {
      const hit = consider(left, top, width, height, tucked, peek)
      if (hit) return hit
    }
    return null
  }

  // Fully on screen first, at the approved corner side then the opposite one.
  for (const left of [window.innerWidth - margin - size, margin]) {
    const hit = scanColumn(left, size, size, false, size)
    if (hit) return hit
  }

  // Then tucked, widest visible handle first.
  for (const peek of [28, 24, 20, 16, 12]) {
    if (peek >= size) continue
    for (const left of [window.innerWidth - peek, peek - size]) {
      const hit = scanColumn(left, size, tuckHeight, true, peek)
      if (hit) return hit
    }
  }

  return best
}

export function usePipSettle(enabled: boolean) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [settle, setSettle] = useState<PipSettle>(IDLE)
  // Set by a learner tapping the tucked handle. Suppresses the automatic
  // placement until the page next moves, so the restore is not undone by the
  // very next resolve.
  const restoredRef = useRef(false)

  const restore = useCallback(() => {
    restoredRef.current = true
    setSettle(IDLE)
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let idleTimer: ReturnType<typeof setTimeout> | undefined
    let frame = 0
    let cancelled = false

    const resolve = () => {
      if (cancelled || restoredRef.current) return
      const root = rootRef.current
      const launcher = root?.querySelector<HTMLElement>('.ielps-pip-launcher')
      if (!launcher) return

      const compact = window.innerWidth < 560 ? 44 : 52
      const margin = window.innerWidth < 560 ? 14 : 20
      const obstacles = collectObstacles(root)

      // First ask whether the approved resting position is already clear. If
      // it is, nothing moves and nothing is resized.
      const r = launcher.getBoundingClientRect()
      const atRest: Box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      const restingOverlap = obstacles.reduce((sum, o) => sum + overlapArea(atRest, o), 0)
      if (restingOverlap === 0) {
        setSettle(IDLE)
        return
      }

      const slot = findSlot(compact, margin, obstacles)
      if (!slot) {
        setSettle(IDLE)
        return
      }
      setSettle({
        scrolling: false,
        moved: true,
        left: Math.round(slot.left),
        top: Math.round(slot.top),
        width: slot.width,
        height: slot.height,
        tucked: slot.tucked,
        peek: slot.peek,
        side: slot.side,
        obstructed: slot.area > 0,
      })
    }

    const onMove = () => {
      if (idleTimer) clearTimeout(idleTimer)
      // A deliberate restore survives until the learner moves the page again.
      restoredRef.current = false
      // Hand the approved anchor back for the duration of the movement.
      setSettle((prev) => (prev.scrolling ? prev : { ...prev, scrolling: true }))
      idleTimer = setTimeout(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(resolve)
      }, IDLE_MS)
    }

    // Capture phase so scrolling inside a panel or an expanded reading window
    // counts as movement too — scroll events do not bubble.
    window.addEventListener('scroll', onMove, { passive: true, capture: true })
    window.addEventListener('resize', onMove, { passive: true })

    // Resolve once after mount, giving the page a moment to finish laying out.
    idleTimer = setTimeout(() => {
      frame = requestAnimationFrame(resolve)
    }, 400)

    return () => {
      cancelled = true
      if (idleTimer) clearTimeout(idleTimer)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [enabled])

  // Derived rather than reset through the effect: while the hook is disabled
  // there is nothing to measure and nothing to move, so it reports the neutral
  // state without a render pass of its own.
  return { rootRef, settle: enabled ? settle : IDLE, restore }
}

const IDLE: PipSettle = { scrolling: false, moved: false, tucked: false, obstructed: false }
