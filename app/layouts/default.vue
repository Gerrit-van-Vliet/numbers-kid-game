<template>
    <div class="main-layout">
        <slot />
        <SoundDebug v-if="debugEnabled" />
        <HapticsDebug v-if="debugEnabled" />
    </div>
</template>

<script setup>
const { debugEnabled } = useSettings()
</script>