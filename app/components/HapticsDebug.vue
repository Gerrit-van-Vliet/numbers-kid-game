<template>
    <div v-if="visible" class="fixed bottom-4 left-4 z-[1000] flex items-center gap-2 select-none">
        <div class="w-10 h-10 rounded-full border-2 border-yellow flex items-center justify-center">
            <div
                class="w-6 h-6 rounded-full"
                :class="ringClass"
                :style="{ backgroundColor: color, opacity }"
            />
        </div>
        <div class="px-2 py-1 rounded bg-black/60 text-yellow text-xs font-mono">
            {{ label }}
        </div>
    </div>
    <button type="button" class="fixed bottom-4 left-4 translate-x-14 z-[1001] text-xs text-yellow underline" @click="toggle">
        Haptics Debug: {{ enabledUi ? 'ON' : 'OFF' }}
    </button>
</template>

<script setup>
const { lastEvent } = useHaptics()

const enabledUi = ref(false)
const visible = ref(false)
const label = ref('—')
const color = ref('#facc15')
const opacity = ref(0)

const typeToColor = {
    selection: '#a3e635',
    impactLight: '#86efac',
    impactMedium: '#facc15',
    impactHeavy: '#fb7185',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
}

const ringClass = computed(() => enabledUi.value ? 'animate-ping-slow' : '')

watch(lastEvent, (evt) => {
    if (!enabledUi.value || !evt) return
    label.value = `${evt.type}`
    color.value = typeToColor[evt.type] || '#facc15'
    visible.value = true
    opacity.value = 1
    // fade out
    requestAnimationFrame(() => {
        setTimeout(() => { opacity.value = 0.6 }, 30)
        setTimeout(() => { opacity.value = 0.3 }, 130)
        setTimeout(() => { opacity.value = 0.1 }, 260)
        setTimeout(() => { visible.value = false }, 500)
    })
})

function toggle() {
    enabledUi.value = !enabledUi.value
}
</script>

<style scoped>
@keyframes ping-slow {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0.2; }
}
.animate-ping-slow {
  animation: ping-slow 450ms ease-out;
}
</style>


