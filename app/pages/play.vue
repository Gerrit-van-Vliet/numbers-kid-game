<template>
    <div class="main">
        <div class="w-full h-full py-8 flex flex-col items-center justify-between">
            <h1 class="text-4xl font-bold text-orange"><span class="text-orange uppercase">{{ userName }}</span></h1>

            <div class="flex-1 w-full flex flex-col items-center justify-center px-4">
                <div class="flex flex-wrap items-center justify-center w-full max-w-sm gap-4">
                    <div tabindex="0" v-for="tile in tiles" :key="tile.id"
                         class="basis-[calc((100%-theme(space.4)*2)/3)] aspect-square border-4 border-orange rounded-lg flex items-center justify-center cursor-pointer select-none"
                         :class="[tile.bgClass, tile.textClass]" :style="tile.bgStyle" @pointerdown="onTileDown(tile)" :aria-label="tile.ariaLabel">
                        <span v-if="gameMode === 'numbers'" class="text-4xl font-bold text-orange">{{ tile.number }}</span>
                        <img v-else-if="gameMode === 'animals'" :src="tile.src" alt="" class="w-[70%] h-[70%] object-contain" />
                        <img v-else-if="gameMode === 'vehicles'" :src="tile.src" alt="" class="w-[70%] h-[70%] object-contain" />
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

// Basic colors with English and Dutch labels
const colorNames = {
    yellow: { en: 'yellow', nl: 'geel' },
    blue:   { en: 'blue', nl: 'blauw' },
    orange: { en: 'orange', nl: 'oranje' },
    gray:   { en: 'gray', nl: 'grijs' },
    purple: { en: 'purple', nl: 'paars' },
    green:  { en: 'green', nl: 'groen' },
    red:    { en: 'red', nl: 'rood' },
    pink:   { en: 'pink', nl: 'roze' },
    black:  { en: 'black', nl: 'zwart' },
    white:  { en: 'white', nl: 'wit' },
    brown:  { en: 'brown', nl: 'bruin' },
}
const colorList = ['yellow', 'blue', 'orange', 'gray', 'purple', 'green', 'red', 'pink', 'black', 'white', 'brown']

// Animals with English and Dutch labels
const animalNames = {
    cat:      { en: 'cat', nl: 'kat' },
    dog:      { en: 'dog', nl: 'hond' },
    cow:      { en: 'cow', nl: 'koe' },
    horse:    { en: 'horse', nl: 'paard' },
    sheep:    { en: 'sheep', nl: 'schaap' },
    pig:      { en: 'pig', nl: 'varken' },
    lion:     { en: 'lion', nl: 'leeuw' },
    tiger:    { en: 'tiger', nl: 'tijger' },
    elephant: { en: 'elephant', nl: 'olifant' },
    monkey:   { en: 'monkey', nl: 'aap' },
    bird:     { en: 'bird', nl: 'vogel' },
    fish:     { en: 'fish', nl: 'vis' },
}

// Vehicles with English and Dutch labels
const vehicleNames = {
    car:        { en: 'car', nl: 'auto' },
    bus:        { en: 'bus', nl: 'bus' },
    truck:      { en: 'truck', nl: 'vrachtwagen' },
    bicycle:    { en: 'bicycle', nl: 'fiets' },
    motorcycle: { en: 'motorcycle', nl: 'motor' },
    airplane:   { en: 'airplane', nl: 'vliegtuig' },
    helicopter: { en: 'helicopter', nl: 'helikopter' },
    boat:       { en: 'boat', nl: 'boot' },
    train:      { en: 'train', nl: 'trein' },
    tractor:    { en: 'tractor', nl: 'tractor' },
}

const defaultAnimals = [
    { key: 'cat', src: '/assets/animals/cat.svg' },
    { key: 'dog', src: '/assets/animals/dog.svg' },
    { key: 'cow', src: '/assets/animals/cow.svg' },
    { key: 'horse', src: '/assets/animals/horse.svg' },
    { key: 'sheep', src: '/assets/animals/sheep.svg' },
    { key: 'pig', src: '/assets/animals/pig.svg' },
    { key: 'lion', src: '/assets/animals/lion.svg' },
    { key: 'tiger', src: '/assets/animals/tiger.svg' },
    { key: 'elephant', src: '/assets/animals/elephant.svg' },
    { key: 'monkey', src: '/assets/animals/monkey.svg' },
    { key: 'bird', src: '/assets/animals/bird.svg' },
    { key: 'fish', src: '/assets/animals/fish.svg' },
]

const defaultVehicles = [
    { key: 'car', src: '/assets/vehicles/car.svg' },
    { key: 'bus', src: '/assets/vehicles/bus.svg' },
    { key: 'truck', src: '/assets/vehicles/truck.svg' },
    { key: 'bicycle', src: '/assets/vehicles/bicycle.svg' },
    { key: 'motorcycle', src: '/assets/vehicles/motorcycle.svg' },
    { key: 'airplane', src: '/assets/vehicles/airplane.svg' },
    { key: 'helicopter', src: '/assets/vehicles/helicopter.svg' },
    { key: 'boat', src: '/assets/vehicles/boat.svg' },
    { key: 'train', src: '/assets/vehicles/train.svg' },
    { key: 'tractor', src: '/assets/vehicles/tractor.svg' },
]

const animals = ref(defaultAnimals)
const vehicles = ref(defaultVehicles)

function defaultSrcForKey(key) {
    return `/assets/animals/${key}.svg`
}

function defaultVehicleSrcForKey(key) {
    return `/assets/vehicles/${key}.svg`
}

async function fetchAnimals() {
    try {
        const res = await fetch('/assets/animals/animals.json', { cache: 'no-cache' })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : (Array.isArray(data.animals) ? data.animals : null)
        if (!Array.isArray(list) || list.length === 0) return
        animals.value = list.map(item => ({
            key: String(item.key || '').trim() || 'unknown',
            src: item.src || defaultSrcForKey(item.key),
            en: item.en,
            nl: item.nl,
        }))
    } catch (_) {}
}

async function fetchVehicles() {
    try {
        const res = await fetch('/assets/vehicles/vehicles.json', { cache: 'no-cache' })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : (Array.isArray(data.vehicles) ? data.vehicles : null)
        if (!Array.isArray(list) || list.length === 0) return
        vehicles.value = list.map(item => ({
            key: String(item.key || '').trim() || 'unknown',
            src: item.src || defaultVehicleSrcForKey(item.key),
            en: item.en,
            nl: item.nl,
        }))
    } catch (_) {}
}

function getAnimalLabel(key, lang) {
    const override = animals.value.find(a => a.key === key)
    return (override && override[lang]) || (animalNames[key] && animalNames[key][lang]) || key
}

function getVehicleLabel(key, lang) {
    const override = vehicles.value.find(v => v.key === key)
    return (override && override[lang]) || (vehicleNames[key] && vehicleNames[key][lang]) || key
}

function getTileTextClass(colorKey) {
    // Choose readable text color over the background
    const lightBackgrounds = new Set(['yellow', 'orange', 'white', 'gray', 'pink'])
    return lightBackgrounds.has(colorKey) ? 'text-black' : 'text-white'
}
const tiles = computed(() => {
    if (gameMode.value === 'numbers') {
        return Array.from({ length: 10 }, (_, idx) => {
            const n = idx + 1
            return { id: `n-${n}`, number: n, ariaLabel: String(n), bgClass: 'bg-yellow' }
        })
    }
    if (gameMode.value === 'animals') {
        return animals.value.map((a) => {
            const labelEn = getAnimalLabel(a.key, 'en')
            const labelNl = getAnimalLabel(a.key, 'nl')
            return {
                id: `a-${a.key}`,
                animalKey: a.key,
                src: a.src,
                ariaLabel: `${labelEn} / ${labelNl}`,
                bgClass: 'bg-white',
                textClass: 'text-black',
            }
        })
    }
    if (gameMode.value === 'vehicles') {
        return vehicles.value.map((v) => {
            const labelEn = getVehicleLabel(v.key, 'en')
            const labelNl = getVehicleLabel(v.key, 'nl')
            return {
                id: `v-${v.key}`,
                vehicleKey: v.key,
                src: v.src,
                ariaLabel: `${labelEn} / ${labelNl}`,
                bgClass: 'bg-white',
                textClass: 'text-black',
            }
        })
    }
    return colorList.map((c) => ({
        id: `c-${c}`,
        colorName: c,
        ariaLabel: `${colorNames[c].en} / ${colorNames[c].nl}`,
        label: `${colorNames[c].en} / ${colorNames[c].nl}`,
        bgClass: '',
        bgStyle: { backgroundColor: `var(--color-game-${c})` },
        textClass: getTileTextClass(c),
    }))
})

const currentChallengeTarget = ref(null)
function createChallenge() {
    if (gameMode.value === 'numbers') {
        currentChallengeTarget.value = Math.floor(Math.random() * 10) + 1
        motivateToClickSpecificTarget(String(currentChallengeTarget.value))
    } else if (gameMode.value === 'animals') {
        const pool = animals.value.map(a => a.key)
        const target = pool[Math.floor(Math.random() * pool.length)]
        currentChallengeTarget.value = target
        motivateToClickSpecificTarget(String(target))
    } else if (gameMode.value === 'vehicles') {
        const pool = vehicles.value.map(v => v.key)
        const target = pool[Math.floor(Math.random() * pool.length)]
        currentChallengeTarget.value = target
        motivateToClickSpecificTarget(String(target))
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
            } else if (gameMode.value === 'animals') {
                const selected = getAnimalLabel(item.animalKey, language.value)
                if (item.animalKey === currentChallengeTarget.value) {
                    speak(`${selected}. ${messages.great_job[language.value]} ${userName.value}!`, { interrupt: true })
                    currentChallengeTarget.value = null
                } else {
                    const target = getAnimalLabel(String(currentChallengeTarget.value), language.value)
                    speak(`${selected}. ${messages.nope_that_was_wrong[language.value]} ${target}.`, { interrupt: true })
                }
            } else if (gameMode.value === 'vehicles') {
                const selected = getVehicleLabel(item.vehicleKey, language.value)
                if (item.vehicleKey === currentChallengeTarget.value) {
                    speak(`${selected}. ${messages.great_job[language.value]} ${userName.value}!`, { interrupt: true })
                    currentChallengeTarget.value = null
                } else {
                    const target = getVehicleLabel(String(currentChallengeTarget.value), language.value)
                    speak(`${selected}. ${messages.nope_that_was_wrong[language.value]} ${target}.`, { interrupt: true })
                }
            } else {
                const selected = colorNames[item.colorName][language.value]
                if (item.colorName === currentChallengeTarget.value) {
                    speak(`${selected}. ${messages.great_job[language.value]} ${userName.value}!`, { interrupt: true })
                    currentChallengeTarget.value = null
                } else {
                    const target = colorNames[currentChallengeTarget.value][language.value]
                    speak(`${selected}. ${messages.nope_that_was_wrong[language.value]} ${target}.`, { interrupt: true })
                }
            }
        } else {
            if (gameMode.value === 'numbers') {
                speak(String(item.number), { interrupt: true })
            } else if (gameMode.value === 'animals') {
                const name = getAnimalLabel(item.animalKey, language.value)
                speak(name, { interrupt: true })
            } else if (gameMode.value === 'vehicles') {
                const name = getVehicleLabel(item.vehicleKey, language.value)
                speak(name, { interrupt: true })
            } else {
                const name = colorNames[item.colorName][language.value]
                speak(name, { interrupt: true })
            }
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
    if (!ttsEnabled.value) return
    if (gameMode.value === 'numbers') {
        speak(messages.click[language.value] + String(label), { interrupt: true })
        return
    }
    if (gameMode.value === 'animals') {
        const key = String(label)
        const name = getAnimalLabel(key, language.value)
        speak(`${messages.click[language.value]} ${name}`, { interrupt: true })
        return
    }
    if (gameMode.value === 'vehicles') {
        const key = String(label)
        const name = getVehicleLabel(key, language.value)
        speak(`${messages.click[language.value]} ${name}`, { interrupt: true })
        return
    }
    // Colors: label is the color key. Speak only in active language
    const key = String(label)
    const name = colorNames[key]?.[language.value] || key
    speak(`${messages.click[language.value]} ${name}`, { interrupt: true })
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
    // Load optional animals config
    fetchAnimals()
    // Load optional vehicles config
    fetchVehicles()
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
