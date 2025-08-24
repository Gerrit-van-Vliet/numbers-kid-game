<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50" @click="close" />

                <transition name="scaleIn">
                    <div class="relative z-10 w-full max-w-md rounded-2xl bg-secondary p-4 shadow-xl">
                        <div class="flex items-center justify-between mb-2">
                            <h2 class="text-black text-2xl font-bold">Settings</h2>
                            <button type="button" class="button-black !py-1 !px-2 text-black" @click="close">Close</button>
                        </div>

                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Sound</label>
                                <input type="checkbox" v-model="soundOn" class="accent-primary" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Background volume</label>
                                <div class="w-[60%] flex items-center gap-2">
                                    <input type="range" min="0" max="1" step="0.01" v-model="bgVolume" class="w-full accent-primary" />
                                    <span class="text-black text-sm">{{ Math.round(bgVolume * 100) }}%</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Haptics</label>
                                <input type="checkbox" v-model="hapticsOn" class="accent-primary" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Challenges enabled</label>
                                <input type="checkbox" v-model="challengesEnabled" class="accent-primary" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Debug tools</label>
                                <input type="checkbox" v-model="debugEnabled" class="accent-primary" />
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">Language</label>
                                <select v-model="ttsLanguage" class="input-primary !py-1 !px-2">
                                    <option value="en">English</option>
                                    <option value="nl">Nederlands</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between">
                                <label class="text-black font-semibold">User name</label>
                                <input type="text" v-model="userName" class="input-primary !py-1 !px-2" />
                            </div>
                            <div class="flex items-center justify-between" v-if="ttsSupported">
                                <label class="text-black font-semibold">Text to Speech</label>
                                <input type="checkbox" v-model="ttsEnabled" class="accent-primary" />
                            </div>
                            <div v-if="ttsSupported" class="flex items-center justify-between">
                                <label class="text-black font-semibold">Voice</label>
                                <select v-model="voiceUri" class="input-primary !py-1 !px-2 w-[60%]">
                                    <option v-for="v in voicesForLang" :key="v.voiceURI" :value="v.voiceURI">
                                        {{ v.name }} ({{ v.lang }})
                                    </option>
                                </select>
                            </div>
                            <div v-if="ttsSupported" class="flex items-center justify-between">
                                <label class="text-black font-semibold">Voice pitch</label>
                                <div class="w-[60%] flex items-center gap-2">
                                    <input type="range" min="0.8" max="1.6" step="0.01" v-model.number="ttsPitch" class="w-full accent-primary" />
                                    <span class="text-black text-sm">{{ ttsPitch.toFixed(2) }}×</span>
                                </div>
                            </div>
                            <div v-if="ttsSupported" class="flex items-center justify-between">
                                <label class="text-black font-semibold">Voice speed</label>
                                <div class="w-[60%] flex items-center gap-2">
                                    <input type="range" min="0.6" max="1.4" step="0.01" v-model.number="ttsRate" class="w-full accent-primary" />
                                    <span class="text-black text-sm">{{ ttsRate.toFixed(2) }}×</span>
                                </div>
                            </div>
                            <div v-if="ttsSupported" class="flex items-center justify-between">
                                <label class="text-black font-semibold">Voice volume</label>
                                <div class="w-[60%] flex items-center gap-2">
                                    <input type="range" min="0" max="1" step="0.01" v-model.number="ttsVolume" class="w-full accent-primary" />
                                    <span class="text-black text-sm">{{ Math.round(ttsVolume * 100) }}%</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 flex justify-end gap-2">
                            <button type="button" class="button-primary" @click="apply">Apply</button>
                        </div>
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'apply'])

// Central settings
const { soundOn, userName, difficulty, challengesEnabled, debugEnabled, bgVolume } = useSettings()
// Haptics
const { enabled: hapticsEnabled } = useHaptics()
const hapticsOn = computed({
    get: () => hapticsEnabled.value,
    set: (v) => { hapticsEnabled.value = Boolean(v) }
})
// TTS
const { isSupported: ttsSupported, enabled: ttsEnabledRef, language: ttsLanguageRef, voiceListForLanguage, selectedVoiceUri, selectVoiceByUri, setLanguage, rate: rateRef, pitch: pitchRef, volume: volumeRef } = useTextToSpeech()

const ttsEnabled = computed({
    get: () => ttsEnabledRef.value,
    set: (v) => { ttsEnabledRef.value = Boolean(v) }
})

const ttsLanguage = computed({
    get: () => ttsLanguageRef.value,
    set: (v) => { setLanguage(v) }
})

const voicesForLang = computed(() => voiceListForLanguage.value)

const voiceUri = computed({
    get: () => selectedVoiceUri.value,
    set: (uri) => { selectVoiceByUri(uri) }
})

const ttsRate = computed({
    get: () => rateRef.value,
    set: (v) => { rateRef.value = Number(v) }
})
const ttsPitch = computed({
    get: () => pitchRef.value,
    set: (v) => { pitchRef.value = Number(v) }
})
const ttsVolume = computed({
    get: () => volumeRef.value,
    set: (v) => { volumeRef.value = Number(v) }
})

function close() {
    emit('update:modelValue', false)
}

function apply() {
    emit('apply', {
        soundOn: soundOn.value,
        hapticsOn: hapticsOn.value,
        difficulty: difficulty.value,
        language: ttsLanguage.value,
        ttsOn: ttsEnabled.value,
        ttsVoiceUri: voiceUri.value,
        userName: userName.value,
        challengesOn: challengesEnabled.value,
    })
    close()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scaleIn-enter-active, .scaleIn-leave-active { transition: transform 220ms ease, opacity 220ms ease; }
.scaleIn-enter-from, .scaleIn-leave-to { transform: scale(0.9); opacity: 0; }
</style>


