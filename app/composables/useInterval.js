// Simple composable to run a callback at a fixed interval with proper cleanup
// Usage:
// const { start, stop, isRunning, intervalMs } = useInterval(() => { ... }, 1000)
// onMounted(start); onUnmounted(stop)

export function useInterval(callback, ms = 1000) {
  const intervalId = ref(null)
  const isRunning = ref(false)
  const intervalMs = ref(ms)

  function clearExisting() {
    if (intervalId.value !== null) {
      try { clearInterval(intervalId.value) } catch (_) {}
      intervalId.value = null
    }
    isRunning.value = false
  }

  function start(nextMs) {
    clearExisting()
    const delay = typeof nextMs === 'number' && nextMs > 0 ? nextMs : intervalMs.value
    intervalMs.value = delay
    intervalId.value = setInterval(() => {
      try { callback && callback() } catch (_) {}
    }, delay)
    isRunning.value = true
  }

  function stop() {
    clearExisting()
  }

  onBeforeUnmount(() => {
    clearExisting()
  })

  return { start, stop, isRunning, intervalMs }
}


