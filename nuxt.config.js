import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    ssr: false,
    devtools: {
      enabled: true,

      timeline: {
        enabled: true
      }
    },
    transpile: [],

    runtimeConfig: {
        public: {
            publicUrl: process.env.PUBLIC_URL || 'http://localhost:3001',
            wsUrl: process.env.WS_ENDPOINT || 'ws://localhost:3001/ws'
        }
    },

    css: [
        './assets/css/style.css'
    ],

    vite: {
        plugins: [
            tailwindcss()
        ]
    },

    modules: [
        '@tresjs/nuxt'
    ],

    app: {
        head: {
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
            ]
        }
    }
})