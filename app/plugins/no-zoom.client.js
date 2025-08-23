export default defineNuxtPlugin(() => {
  if (process.client) {
    const prevent = (e) => { try { e.preventDefault() } catch (_) {} }
    try {
      document.addEventListener('gesturestart', prevent, { passive: false })
      document.addEventListener('gesturechange', prevent, { passive: false })
      document.addEventListener('gestureend', prevent, { passive: false })
    } catch (_) {}
    // Prevent ctrl/cmd + wheel zoom (desktop)
    try {
      window.addEventListener('wheel', (e) => { if (e.ctrlKey) prevent(e) }, { passive: false })
    } catch (_) {}
  }
})


