<template>
    <div v-if="visible" class="fixed bottom-4 left-4 z-[1000] flex items-center gap-2 select-none">
        <div class="px-2 py-1 rounded bg-black/60 text-primary text-xs font-mono">
            {{ label }}
        </div>
    </div>
    <button type="button" class="fixed bottom-4 left-4 translate-x-[7.5rem] z-[1001] text-xs text-primary underline" @click="toggle">
        Sound Debug: {{ enabledUi ? 'ON' : 'OFF' }}
    </button>
</template>

<script setup>
const { lastEvent, unlocked, activeCount } = useSound()
const { debugEnabled } = useSettings()

const enabledUi = ref(false)
const visible = computed(() => debugEnabled.value && enabledUi.value)
const label = ref('—')

watch([lastEvent, unlocked, activeCount], ([evt, isUnlocked, count]) => {
    if (!visible.value) return
    const evtLabel = evt ? `${evt.type}` : '—'
    label.value = `unlocked=${isUnlocked ? '1' : '0'} active=${count} evt=${evtLabel}`
})

function toggle() {
    enabledUi.value = !enabledUi.value
}
</script>

<style scoped>
</style>