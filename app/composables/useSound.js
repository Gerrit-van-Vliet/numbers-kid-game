// Simple sound composable using HTMLAudioElement
// - Supports multiple simultaneous sounds
// - Supports loop and per-sound volume
// - Adds user-gesture unlock flow for autoplay policies

const isClient = typeof window !== 'undefined'

// Registry of active sounds
// id -> { audio: HTMLAudioElement }
const activeSounds = new Map()
let nextId = 1

// Autoplay unlock handling
const unlocked = ref(false)
let unlockListenersAdded = false
const unlockWaiters = [] // Array<() => void>

function clampVolume(v) {
    const n = Number(v)
    if (!Number.isFinite(n)) return 1
    return Math.max(0, Math.min(1, n))
}

function createAudio(url, options = {}) {
    const audio = new Audio()
    audio.src = String(url)
    audio.loop = Boolean(options.loop)
    audio.volume = clampVolume(options.volume == null ? 1 : options.volume)
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    audio.playsInline = true
    return audio
}

function resolveUnlockWaiters() {
    while (unlockWaiters.length) {
        const resolve = unlockWaiters.shift()
        try { resolve && resolve() } catch (_) {}
    }
}

function doUnlock() {
    if (!isClient) return
    if (unlocked.value) return
    unlocked.value = true
    // Unmute and attempt to play any active sounds (e.g., background loop)
    activeSounds.forEach(({ audio }) => {
        try { audio.muted = false } catch (_) {}
        try {
            const p = audio.play()
            if (p && typeof p.catch === 'function') { p.catch(() => {}) }
        } catch (_) {}
    })
    // Cleanup listeners
    removeUnlockListeners()
    // Notify waiters
    resolveUnlockWaiters()
}

function onFirstGesture() { doUnlock() }

function addUnlockListeners() {
    if (!isClient || unlockListenersAdded || unlocked.value) return
    unlockListenersAdded = true
    try {
        window.addEventListener('pointerdown', onFirstGesture, { once: true, capture: true })
        window.addEventListener('touchstart', onFirstGesture, { once: true, capture: true })
        window.addEventListener('mousedown', onFirstGesture, { once: true, capture: true })
        window.addEventListener('keydown', onFirstGesture, { once: true, capture: true })
        window.addEventListener('click', onFirstGesture, { once: true, capture: true })
    } catch (_) {}
}

function removeUnlockListeners() {
    if (!isClient) return
    if (!unlockListenersAdded) return
    unlockListenersAdded = false
    try {
        window.removeEventListener('pointerdown', onFirstGesture, { capture: true })
        window.removeEventListener('touchstart', onFirstGesture, { capture: true })
        window.removeEventListener('mousedown', onFirstGesture, { capture: true })
        window.removeEventListener('keydown', onFirstGesture, { capture: true })
        window.removeEventListener('click', onFirstGesture, { capture: true })
    } catch (_) {}
}

function waitForUnlock() {
    if (!isClient) return Promise.resolve()
    addUnlockListeners()
    if (unlocked.value) return Promise.resolve()
    return new Promise((resolve) => {
        unlockWaiters.push(resolve)
    })
}

function unlock() {
    // Public API to unlock immediately on a known user gesture
    doUnlock()
}

function play(url, options = {}) {
    if (!isClient) return null
    // Ensure unlock listeners are attached early
    addUnlockListeners()
    const audio = createAudio(url, options)
    const id = nextId++
    activeSounds.set(id, { audio })

    // If not unlocked yet, attempt muted autoplay. We'll unmute on unlock.
    if (!unlocked.value) {
        try { audio.muted = true } catch (_) {}
    }

    try {
        const p = audio.play()
        if (p && typeof p.catch === 'function') {
            p.catch(() => {})
        }
    } catch (_) {}
    return id
}

function stop(id) {
    const entry = activeSounds.get(id)
    if (!entry) return
    try { entry.audio.pause() } catch (_) {}
    try { entry.audio.currentTime = 0 } catch (_) {}
    // Clear source to allow GC
    try { entry.audio.src = '' } catch (_) {}
    activeSounds.delete(id)
}

function pause(id) {
    const entry = activeSounds.get(id)
    if (!entry) return
    try { entry.audio.pause() } catch (_) {}
}

function resume(id) {
    const entry = activeSounds.get(id)
    if (!entry) return
    try {
        // Ensure unmuted when resuming after unlock
        try { entry.audio.muted = false } catch (_) {}
        const p = entry.audio.play()
        if (p && typeof p.catch === 'function') { p.catch(() => {}) }
    } catch (_) {}
}

function resumeAll() {
    activeSounds.forEach((_, id) => resume(id))
}

function setVolume(id, volume) {
    const entry = activeSounds.get(id)
    if (!entry) return
    entry.audio.volume = clampVolume(volume)
}

function stopAll() {
    Array.from(activeSounds.keys()).forEach(stop)
}

export function useSound() {
    return {
        // state/utilities
        unlocked,
        waitForUnlock,
        unlock,
        // actions
        play,
        stop,
        pause,
        resume,
        resumeAll,
        setVolume,
        stopAll,
    }
}



