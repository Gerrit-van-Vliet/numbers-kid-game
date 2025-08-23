// Simple haptics composable using the Vibration API
// Provides small helpers and a shared enable/disable toggle persisted to localStorage

// Module-scoped singleton state so all users share the same refs
const isClient = typeof window !== 'undefined'
const isSupported = isClient && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

const enabled = ref(true)
const lastEvent = ref(null) // { type: string, ts: number }

let hasWarnedUnsupported = false
let initialized = false
let storageKey = 'haptics.enabled'

function ensureInit(options = {}) {
  if (initialized) return
  const { localStorageKey = 'haptics.enabled', defaultEnabled = true } = options
  storageKey = localStorageKey
  enabled.value = defaultEnabled

  if (isClient) {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved != null) {
        enabled.value = saved === 'true'
      } else {
        localStorage.setItem(storageKey, String(enabled.value))
      }
    } catch (_) {}
  }

  watch(enabled, (next) => {
    if (!isClient) return
    try { localStorage.setItem(storageKey, String(Boolean(next))) } catch (_) {}
  })

  initialized = true
}

function vibrate(pattern) {
  if (!enabled.value) return false
  if (!isSupported) {
    if (!hasWarnedUnsupported) {
      hasWarnedUnsupported = true
      try { alert('[Haptics] navigator.vibrate is not supported on this device/browser.') } catch (_) {}
    }
    return false
  }
  try {
    return navigator.vibrate(pattern)
  } catch (_) {
    return false
  }
}

// Common patterns
function selection() { lastEvent.value = { type: 'selection', ts: Date.now() }; return vibrate(16) }
function impactLight() { lastEvent.value = { type: 'impactLight', ts: Date.now() }; return vibrate(24) }
function impactMedium() { lastEvent.value = { type: 'impactMedium', ts: Date.now() }; return vibrate(40) }
function impactHeavy() { lastEvent.value = { type: 'impactHeavy', ts: Date.now() }; return vibrate(70) }
function success() { lastEvent.value = { type: 'success', ts: Date.now() }; return vibrate([30, 40, 30]) }
function warning() { lastEvent.value = { type: 'warning', ts: Date.now() }; return vibrate([50, 60, 50]) }
function error() { lastEvent.value = { type: 'error', ts: Date.now() }; return vibrate([70, 80, 70]) }

export function useHaptics(options = {}) {
  ensureInit(options)
  return {
    // state
    enabled,
    isSupported,
    lastEvent,
    // low-level
    vibrate,
    // helpers
    selection,
    impactLight,
    impactMedium,
    impactHeavy,
    success,
    warning,
    error,
  }
}


