// Centralized app settings with localStorage persistence
// Keeps simple, app-wide settings that are not owned by other composables

const isClient = typeof window !== 'undefined'

// Module-scoped singletons so settings remain shared
const initialized = ref(false)
const storagePrefix = 'settings.'

// Settings
const soundOn = ref(true)
const userName = ref('Luuk')
const difficulty = ref('easy') // reserved for future use
const challengesEnabled = ref(true)
const debugEnabled = ref(false)

function safeGet(key, fallback) {
    if (!isClient) return fallback
    try {
        const raw = localStorage.getItem(storagePrefix + key)
        return raw == null ? fallback : raw
    } catch (_) {
        return fallback
    }
}

function safeSet(key, value) {
    if (!isClient) return
    try { localStorage.setItem(storagePrefix + key, String(value)) } catch (_) {}
}

function ensureInit() {
    if (initialized.value) return
    // Load
    soundOn.value = safeGet('soundOn', 'true') === 'true'
    const savedName = safeGet('userName', 'Luuk')
    userName.value = savedName && savedName.trim() !== '' ? savedName : 'Luuk'
    const savedDiff = safeGet('difficulty', 'easy')
    difficulty.value = ['easy', 'medium', 'hard'].includes(savedDiff) ? savedDiff : 'easy'
    challengesEnabled.value = safeGet('challengesEnabled', 'true') === 'true'
    debugEnabled.value = safeGet('debugEnabled', 'false') === 'true'

    // Persist on change
    watch(soundOn, v => safeSet('soundOn', Boolean(v)))
    watch(userName, v => safeSet('userName', (v || '').trim()))
    watch(difficulty, v => safeSet('difficulty', v))
    watch(challengesEnabled, v => safeSet('challengesEnabled', Boolean(v)))
    watch(debugEnabled, v => safeSet('debugEnabled', Boolean(v)))

    initialized.value = true
}

export function useSettings() {
    ensureInit()
    return {
        soundOn,
        userName,
        difficulty,
        challengesEnabled,
        debugEnabled,
    }
}



