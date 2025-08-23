<template>
    <div class="main">
        <div class="w-full h-full flex flex-col items-center justify-center gap-8">
            <NuxtLink to="/play" class="relative group">
                <span class="sr-only">Play</span>
                <div class="absolute inset-0 z-0 button-orange rounded-full opacity-40 animate-ping"></div>
                <button type="button" class="button-orange text-2xl font-bold uppercase !px-8 !py-2 rounded-full relative z-10">Play</button>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.pulse-ring {
    position: absolute;
    inset: -18px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(255,165,0,0.35) 0%, rgba(255,165,0,0.15) 40%, rgba(255,165,0,0.0) 70%);
    animation: pulse 1600ms ease-out infinite;
}

@keyframes pulse {
    0% { transform: scale(0.9); opacity: 0.9; }
    70% { transform: scale(1.15); opacity: 0.15; }
    100% { transform: scale(1.2); opacity: 0; }
}
</style>