<template>
    <div class="main">
        <div class="w-full h-full py-8 flex flex-col items-center justify-between">
            <h1 class="text-4xl font-bold text-orange"><span class="text-orange uppercase">{{ userName }}</span></h1>

            <div class="flex-1 w-full flex flex-col items-center justify-center px-4">
                <div class="flex flex-wrap items-center justify-center w-full max-w-sm gap-4">
                    <div tabindex="0" v-for="tile in tiles" :key="tile.id"
                         class="basis-[calc((100%-theme(space.4)*2)/3)] aspect-square border-4 border-orange rounded-lg flex items-center justify-center cursor-pointer select-none"
                         :class="tile.bgClass" @pointerdown="onTileDown(tile)" :aria-label="tile.ariaLabel">
                        <span v-if="gameMode === 'numbers'" class="text-4xl font-bold text-orange">{{ tile.number }}</span>
                        <span class="sr-only">{{ tile.ariaLabel }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Absolute long-press settings button -->
        <button type="button"
                class="absolute bottom-4 right-4 w-12 h-12 bg-green border-2 border-orange rounded-full flex items-center justify-center overflow-hidden touch-none select-none cursor-pointer"
                aria-label="Open settings" title="Hold 3s for settings" @pointerdown="onPointerDown"
                @pointerup="onPointerUp" @pointerleave="onPointerLeave" @pointercancel="onPointerLeave"
                @contextmenu.prevent>
            <span class="absolute inset-0 rounded-full bg-orange z-0 origin-center"
                  :style="{ transform: `scale(${Math.max(0, progress)})` }" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5 text-orange relative z-10 mix-blend-multiply">
                <path class="stroke-orange" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path class="stroke-orange"
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.4l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
        </button>

        <!-- Absolute long-press fullscreen button -->
        <button type="button"
                class="absolute bottom-4 left-4 w-12 h-12 bg-green border-2 border-orange rounded-full flex items-center justify-center overflow-hidden touch-none select-none cursor-pointer"
                aria-label="Open settings" title="Hold 3s for settings" @pointerdown="onPointerDownFullscreen"
                @pointerup="onPointerUpFullscreen" @pointerleave="onPointerLeaveFullscreen"
                @pointercancel="onPointerLeaveFullscreen" @contextmenu.prevent>
            <span class="absolute inset-0 rounded-full bg-orange z-0 origin-center"
                  :style="{ transform: `scale(${Math.max(0, progressFullscreen)})` }" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5 text-orange relative z-10 mix-blend-multiply">
                <path class="stroke-orange" d="M9 3H3v6" />
                <path class="stroke-orange" d="M15 3h6v6" />
                <path class="stroke-orange" d="M9 21H3v-6" />
                <path class="stroke-orange" d="M15 21h6v-6" />
            </svg>
        </button>

        <!-- Absolute long-press back button -->
        <button type="button"
                class="absolute top-4 left-4 w-12 h-12 bg-green border-2 border-orange rounded-full flex items-center justify-center overflow-hidden touch-none select-none cursor-pointer"
                aria-label="Back to menu" title="Hold 3s to return" @pointerdown="onPointerDownBack"
                @pointerup="onPointerUpBack" @pointerleave="onPointerLeaveBack"
                @pointercancel="onPointerLeaveBack" @contextmenu.prevent>
            <span class="absolute inset-0 rounded-full bg-orange z-0 origin-center"
                  :style="{ transform: `scale(${Math.max(0, progressBack)})` }" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="w-5 h-5 text-orange relative z-10 mix-blend-multiply">
                <polyline class="stroke-orange" points="15 18 9 12 15 6" />
            </svg>
        </button>

        <!-- Modal for settings -->
        <SettingsModal v-model="showSettings" @apply="onApplySettings" />
    </div>
</template>

<script setup>
definePageMeta({ middleware: ['require-index-origin'] })
const { enabled: hapticsEnabled, impactLight, impactMedium } = useHaptics()
const { speak, enabled: ttsEnabled, setLanguage, selectVoiceByUri, language } = useTextToSpeech()
const { soundOn, userName, challengesEnabled, bgVolume, gameMode } = useSettings()
const { play: playSound, stop: stopSound, pause: pauseSound, resume: resumeSound, unlock, unlocked, setVolume } = useSound()
const showSettings = ref(false)
const lastNumber = ref(null)
const lastPressAt = ref(null)
const mountedAt = ref(Date.now())
const inactivityThresholdMs = 5000
const messages = {
    click: {
        en: 'Click on: ',
        nl: 'Klik op : '
    },
    great_job: {
        en: 'Great job!',
        nl: 'Goed gedaan'
    },
    keep_going: {
        en: 'Keep going!',
        nl: 'Ga zo door'
    },
    nope_that_was_wrong: {
        en: 'Nope, that was wrong! You need to click on: ',
        nl: 'Nee, dat was niet goed! Klik maar op : '
    }
}

const colorList = ['yellow', 'blue', 'orange', 'gray', 'purple', 'green']
const tiles = computed(() => {
    if (gameMode.value === 'numbers') {
        return Array.from({ length: 10 }, (_, idx) => {
            const n = idx + 1
            return { id: `n-${n}`, number: n, ariaLabel: String(n), bgClass: 'bg-yellow' }
        })
    }
    return colorList.map((c) => ({ id: `c-${c}`, colorName: c, ariaLabel: c, bgClass: `bg-${c}` }))
})

const currentChallengeTarget = ref(null)
function createChallenge() {
    if (gameMode.value === 'numbers') {
        currentChallengeTarget.value = Math.floor(Math.random() * 10) + 1
        motivateToClickSpecificTarget(String(currentChallengeTarget.value))
    } else {
        const target = colorList[Math.floor(Math.random() * colorList.length)]
        currentChallengeTarget.value = target
        motivateToClickSpecificTarget(String(target))
    }
}

const { progress, onPointerDown, onPointerUp, onPointerLeave, forceReset } = useLongPress({
    duration: 1500,
    onSuccess: () => { showSettings.value = true }
})

const { progress: progressFullscreen, onPointerDown: onPointerDownFullscreen, onPointerUp: onPointerUpFullscreen, onPointerLeave: onPointerLeaveFullscreen, forceReset: forceResetFullscreen } = useLongPress({
    duration: 1500,
    onSuccess: () => {
        if (document.fullscreenElement) {
            document.exitFullscreen(); forceResetFullscreen()
        } else {
            document.documentElement.requestFullscreen(); forceResetFullscreen()
        }
    }
})

const router = useRouter()
const { progress: progressBack, onPointerDown: onPointerDownBack, onPointerUp: onPointerUpBack, onPointerLeave: onPointerLeaveBack, forceReset: forceResetBack } = useLongPress({
    duration: 1500,
    onSuccess: () => { router.push('/'); forceResetBack() }
})

watch(showSettings, (isOpen) => { if (!isOpen) { forceReset() } })

// Background music handling
const backgroundSoundId = ref(null)
function startBackgroundSound() {
    if (backgroundSoundId.value != null) return
    backgroundSoundId.value = playSound('/assets/sounds/backround.mp3', { loop: true, volume: bgVolume.value })
}
watch(soundOn, (enabled) => {
    if (enabled) {
        if (backgroundSoundId.value == null) { startBackgroundSound(); return }
        resumeSound(backgroundSoundId.value)
    } else {
        if (backgroundSoundId.value != null) { pauseSound(backgroundSoundId.value) }
    }
})
watch(bgVolume, (v) => {
    if (backgroundSoundId.value != null) { setVolume(backgroundSoundId.value, v) }
})

function onTileDown(item) {
    if (hapticsEnabled.value) { impactMedium() }
    lastNumber.value = item
    lastPressAt.value = new Date().getTime()
    if (ttsEnabled.value) {
        if (challengesEnabled.value && currentChallengeTarget.value) {
            if (gameMode.value === 'numbers') {
                if (item.number === currentChallengeTarget.value) {
                    speak(String(item.number) + '. ' + messages.great_job[language.value] + ' ' + userName.value + '!', { interrupt: true })
                    currentChallengeTarget.value = null
                } else {
                    speak(String(item.number) + '. ' + messages.nope_that_was_wrong[language.value] + String(currentChallengeTarget.value) + '.', { interrupt: true })
                }
            } else {
                if (item.colorName === currentChallengeTarget.value) {
                    speak(String(item.colorName) + '. ' + messages.great_job[language.value] + ' ' + userName.value + '!', { interrupt: true })
                    currentChallengeTarget.value = null
                } else {
                    speak(String(item.colorName) + '. ' + messages.nope_that_was_wrong[language.value] + String(currentChallengeTarget.value) + '.', { interrupt: true })
                }
            }
        } else {
            const label = gameMode.value === 'numbers' ? String(item.number) : String(item.colorName)
            speak(label, { interrupt: true })
        }
    }
}

function checkIfChallengeIsCompleted() {
    const now = Date.now()
    const lastInteractionAt = lastPressAt.value || mountedAt.value
    if (challengesEnabled.value && !currentChallengeTarget.value && (now - lastInteractionAt) >= inactivityThresholdMs) {
        createChallenge()
    }
}

function motivateToClickSpecificTarget(label) {
    if (ttsEnabled.value) { speak(messages.click[language.value] + String(label), { interrupt: true }) }
}

function onApplySettings(settings) {
    if (typeof settings?.hapticsOn === 'boolean') { hapticsEnabled.value = settings.hapticsOn }
    if (settings?.language) { setLanguage(settings.language) }
    if (typeof settings?.ttsOn === 'boolean') { ttsEnabled.value = settings.ttsOn }
    if (settings?.ttsVoiceUri) { selectVoiceByUri(settings.ttsVoiceUri) }
    if (typeof settings?.challengesOn === 'boolean') {
        // When toggled off, clear any current challenge
        if (!settings.challengesOn) { currentChallengeTarget.value = null }
    }
}

const { start: startInactivityTimer, stop: stopInactivityTimer } = useInterval(checkIfChallengeIsCompleted, 1000)

// Start background sound on first user gesture instead of onMounted
let startedByGesture = false
function handleFirstGestureStart() {
    if (startedByGesture) return
    startedByGesture = true
    // Unlock audio immediately within the same gesture
    unlock()
    if (soundOn.value) {
        startBackgroundSound()
    }
    // Remove listeners after first trigger
    try {
        window.removeEventListener('pointerdown', handleFirstGestureStart, { capture: true })
        window.removeEventListener('touchstart', handleFirstGestureStart, { capture: true })
        window.removeEventListener('mousedown', handleFirstGestureStart, { capture: true })
        window.removeEventListener('keydown', handleFirstGestureStart, { capture: true })
        window.removeEventListener('click', handleFirstGestureStart, { capture: true })
    } catch (_) {}
}

onMounted(() => {
    startInactivityTimer()
    // If audio is already unlocked (e.g., from index Play click), start immediately
    if (unlocked.value && soundOn.value) {
        startBackgroundSound()
        return
    }
    // Otherwise attach gesture listeners to start audio
    try {
        window.addEventListener('pointerdown', handleFirstGestureStart, { once: true, capture: true })
        window.addEventListener('touchstart', handleFirstGestureStart, { once: true, capture: true })
        window.addEventListener('mousedown', handleFirstGestureStart, { once: true, capture: true })
        window.addEventListener('keydown', handleFirstGestureStart, { once: true, capture: true })
        window.addEventListener('click', handleFirstGestureStart, { once: true, capture: true })
    } catch (_) {}
})

onBeforeUnmount(() => {
    stopInactivityTimer()
    if (backgroundSoundId.value != null) { stopSound(backgroundSoundId.value); backgroundSoundId.value = null }
})
</script>
