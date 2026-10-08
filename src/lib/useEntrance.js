import { useEffect } from 'react'

/**
 * Safety net for entrance animations.
 *
 * Elements like the cart drawer and modals start offset (translated/scaled away)
 * and are animated into place. If animations never tick — a document whose
 * timeline is paused, reduced-motion tooling, an offscreen webview — the element
 * would be stranded in its pre-animation state and become unusable (or invisible).
 *
 * After a grace period slightly longer than the longest entrance animation, any
 * animation still sitting at its first frame is cancelled, which snaps the
 * element back to its resting CSS. In a normal browser the animation has already
 * finished by then, so this is a no-op.
 */
export function useEntrance(ref, active, graceMs = 450) {
  useEffect(() => {
    if (!active) return undefined
    const timer = window.setTimeout(() => {
      const node = ref.current
      if (!node || typeof node.getAnimations !== 'function') return
      let animations = []
      try {
        animations = node.getAnimations({ subtree: true })
      } catch {
        animations = []
      }
      for (const anim of animations) {
        try {
          const duration = anim.effect?.getTiming?.().duration ?? 0
          if (!anim.currentTime || anim.currentTime < duration) anim.cancel()
        } catch {
          /* animation already torn down */
        }
      }
    }, graceMs)
    return () => window.clearTimeout(timer)
  }, [ref, active, graceMs])
}
