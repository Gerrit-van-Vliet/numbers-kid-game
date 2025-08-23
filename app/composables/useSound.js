// Simple sound composable using HTMLAudioElement
// - Supports multiple simultaneous sounds
// - Supports loop and per-sound volume

const isClient = typeof window !== 'undefined'

// Registry of active sounds
// id -> { audio: HTMLAudioElement }
const activeSounds = new Map()
let nextId = 1

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

function play(url, options = {}) {
    if (!isClient) return null
    const audio = createAudio(url, options)
    const id = nextId++
    activeSounds.set(id, { audio })
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
        const p = entry.audio.play()
        if (p && typeof p.catch === 'function') { p.catch(() => {}) }
    } catch (_) {}
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
        // actions
        play,
        stop,
        pause,
        resume,
        setVolume,
        stopAll,
    }
}



