'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The settled-state collision rule for PiP, 19 August 2026.
 *
 * While the learner is actively scrolling, PiP is left completely alone: it
 * keeps its approved anchor and its approved size, and it is allowed to pass
 * over whatever happens to be under it. Transient overlap during motion is
 * expected and permitted.
 *
 * The rule applies once the page is still. On settle, PiP looks at what is
 * actually in the viewport and asks a single question: am I sitting on top of
 * something the learner needs to press? Buttons, answer options, form inputs,
 * primary calls to action and navigation all count. If the answer is no —
 * which is the common case — nothing changes at all and PiP keeps exactly the
 * appearance that was approved. If the answer is yes, PiP shrinks to a compact
 * circle and moves along the nearest screen edge to the closest slot where it
 * covers nothing.
 *
 * Two deliberate choices worth stating:
 *
 * The search only walks the left and right edges of the viewport. PiP is a
 * corner assistant and should stay one; landing in the middle of a reading
 * passage would be worse than the problem it solves.
 *
 * Where no clear slot exists on either edge — a stacked card list at 390px,
 * where every card runs the full width — PiP tucks against the edge instead,
 * leaving a handle in the page gutter and putting the rest of itself past the
 * edge of the screen. If even that is covered, PiP takes the position that
 * covers the least and reports `obstructed` rather than quietly pretending it
 * succeeded. Nothing in the build currently reaches that last branch, but a
 * future screen might, and it should be visible when it does.
 */

export type PipSettle = {
  /** True while the page is moving. PiP is left at its approved anchor. */
  scrolling: boolean
  /** Set once PiP has had to shrink and move to clear a control. */
  moved: boolean
  /** Inline position for the launcher, in viewport pixels. */
  left?: number
  top?: number
  /** Edge length of the compact circle, when moved. */
  size?: number
  /** PiP is parked half off screen, leaving a handle in the page gutter. */
  tucked: boolean
  /** No fully clear slot existed; this is the least-obstructive one found. */
  obstructed: boolean
}

type Box = { left: number; top: number; right: number; bottom: number }

const IDLE_MS = 180

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
  // Only what is on screen right now matters; PiP is fixed to the viewport.
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

type Slot = { left: number; top: number; area: number; tucked: boolean }

/**
 * Walk the right edge from the bottom upward, then the left edge, looking for a
 * square of `size` that touches nothing.
 *
 * If neither edge has room — a stacked card list at 390px is the real case,
 * where every card runs the full width and the only clear channel is the 16px
 * page gutter — PiP tucks instead: it keeps its full hit area but slides most
 * of itself past the edge of the screen, leaving a handle in the gutter. The
 * handle covers nothing, and one tap brings PiP back. The tuck is tried at
 * several widths and the widest one that stays clear wins, so it only gets as
 * narrow as the page forces it to be.
 *
 * Returns the first clear slot, or the least-obstructive one if the page has no
 * clear position at all.
 */
function findSlot(size: number, margin: number, obstacles: Box[]): Slot | null {
  const step = 8
  const minTop = margin
  const maxTop = window.innerHeight - margin - size

  let best: Slot | null = null

  const consider = (left: number, top: number, tucked: boolean): Slot | null => {
    const box: Box = { left, top, right: left + size, bottom: top + size }
    let area = 0
    for (const o of obstacles) area += overlapArea(box, o)
    const slot: Slot = { left, top, area, tucked }
    if (area === 0) return slot
    if (!best || area < best.area) best = slot
    return null
  }

  const scanColumn = (left: number, tucked: boolean) => {
    for (let top = maxTop; top >= minTop; top -= step) {
      const hit = consider(left, top, tucked)
      if (hit) return hit
    }
    return null
  }

  // Fully on screen first, at the approved corner side then the opposite one.
  for (const left of [window.innerWidth - margin - size, margin]) {
    const hit = scanColumn(left, false)
    if (hit) return hit
  }

  // Then tucked, widest visible handle first.
  for (const peek of [28, 24, 20, 16, 12]) {
    if (peek >= size) continue
    for (const left of [window.innerWidth - peek, peek - size]) {
      const hit = scanColumn(left, true)
      if (hit) return hit
    }
  }

  return best
}

export function usePipSettle(enabled: boolean) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [settle, setSettle] = useState<PipSettle>(IDLE)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let idleTimer: ReturnType<typeof setTimeout> | undefined
    let frame = 0
    let cancelled = false

    const resolve = () => {
      if (cancelled) return
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
        size: compact,
        tucked: slot.tucked,
        obstructed: slot.area > 0,
      })
    }

    const onMove = () => {
      if (idleTimer) clearTimeout(idleTimer)
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
  return { rootRef, settle: enabled ? settle : IDLE }
}

const IDLE: PipSettle = { scrolling: false, moved: false, tucked: false, obstructed: false }
