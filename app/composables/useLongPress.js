// Long-press composable for pointer devices (mouse/touch/pen)
// Usage: const press = useLongPress({ duration: 3000, onSuccess })
// Bind handlers: @pointerdown, @pointerup, @pointerleave, @pointercancel

export function useLongPress(options = {}) {
  const { duration = 3000, onSuccess } = options

  const isPressing = ref(false)
  const progress = ref(0) // 0..1

  let frameId = null
  let startTs = 0

  function cancelAnimation() {
    if (frameId != null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
  }

  function reset() {
    cancelAnimation()
    isPressing.value = false
    progress.value = 0
    startTs = 0
  }

  function step(ts) {
    if (!startTs) startTs = ts
    const elapsed = ts - startTs
    const nextProgress = Math.min(1, elapsed / duration)
    progress.value = nextProgress

    if (nextProgress >= 1) {
      // Success
      isPressing.value = false
      cancelAnimation()
      if (typeof onSuccess === 'function') {
        onSuccess()
      }
      // Keep progress at 1 briefly; caller can reset when modal opens/closes
      return
    }

    frameId = requestAnimationFrame(step)
  }

  function onPointerDown(e) {
    // Avoid right-click / secondary buttons
    if (e.button && e.button !== 0) return
    // Prevent long-press context menu on mobile
    try { e.preventDefault() } catch (_) {}
    isPressing.value = true
    progress.value = 0
    startTs = 0
    cancelAnimation()
    frameId = requestAnimationFrame(step)
  }

  function onPointerUp() {
    if (progress.value < 1) {
      reset()
    }
  }

  function onPointerLeave() {
    if (progress.value < 1) {
      reset()
    }
  }

  function forceReset() {
    reset()
  }

  return {
    isPressing,
    progress,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    forceReset
  }
}


