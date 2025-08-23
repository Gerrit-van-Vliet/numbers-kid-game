// Text-to-Speech composable built on the Web Speech API
// - Lists available voices and keeps them reactive
// - Allows selecting language (en/nl), specific voice, and tuning rate/pitch/volume
// - Persists settings to localStorage

const isClient = typeof window !== 'undefined'
const synth = isClient && typeof window.speechSynthesis !== 'undefined' ? window.speechSynthesis : null

const isSupported = Boolean(synth)

// Reactive state (module-scoped singletons)
const initialized = ref(false)
const enabled = ref(true)
const voices = ref([]) // Array<SpeechSynthesisVoice>
const selectedVoiceUri = ref(null)
const language = ref('nl') // 'en' | 'nl'
const rate = ref(1)
const pitch = ref(1)
const volume = ref(1)

const speaking = ref(false)
const pending = ref(false)

let storagePrefix = 'tts.'

function safeLocalStorageGet(key, fallback) {
  if (!isClient) return fallback
  try {
    const raw = localStorage.getItem(storagePrefix + key)
    return raw == null ? fallback : raw
  } catch (_) {
    return fallback
  }
}

function safeLocalStorageSet(key, value) {
  if (!isClient) return
  try { localStorage.setItem(storagePrefix + key, String(value)) } catch (_) {}
}

function loadPersisted() {
  enabled.value = safeLocalStorageGet('enabled', 'true') === 'true'
  const savedLang = safeLocalStorageGet('lang', 'nl')
  language.value = savedLang === 'nl' ? 'nl' : 'en'
  const savedVoiceUri = safeLocalStorageGet('voiceUri', null)
  selectedVoiceUri.value = savedVoiceUri
  const savedRate = parseFloat(safeLocalStorageGet('rate', '1'))
  const savedPitch = parseFloat(safeLocalStorageGet('pitch', '1'))
  const savedVolume = parseFloat(safeLocalStorageGet('volume', '1'))
  rate.value = Number.isFinite(savedRate) ? savedRate : 1
  pitch.value = Number.isFinite(savedPitch) ? savedPitch : 1
  volume.value = Number.isFinite(savedVolume) ? savedVolume : 1
}

function persistOnChange() {
  watch(enabled, v => safeLocalStorageSet('enabled', Boolean(v)))
  watch(language, v => safeLocalStorageSet('lang', v))
  watch(selectedVoiceUri, v => safeLocalStorageSet('voiceUri', v || ''))
  watch(rate, v => safeLocalStorageSet('rate', v))
  watch(pitch, v => safeLocalStorageSet('pitch', v))
  watch(volume, v => safeLocalStorageSet('volume', v))
}

function refreshVoiceList() {
  if (!isSupported) {
    voices.value = []
    return
  }
  const list = synth.getVoices() || []
  // Sort by language then name for stable UI
  list.sort((a, b) => {
    if (a.lang === b.lang) return a.name.localeCompare(b.name)
    return (a.lang || '').localeCompare(b.lang || '')
  })
  voices.value = list
}

function onVoicesChanged() {
  refreshVoiceList()
  // If we have a saved voiceUri, and it's available, keep it
  // Otherwise, pick a sensible default for the current language
  if (selectedVoiceUri.value && voices.value.some(v => v.voiceURI === selectedVoiceUri.value)) {
    return
  }
  // Prefer voices matching current language, then any
  const preferred = voices.value.find(v => (v.lang || '').toLowerCase().startsWith(language.value))
  selectedVoiceUri.value = preferred ? preferred.voiceURI : (voices.value[0] ? voices.value[0].voiceURI : null)
}

function ensureInit(options = {}) {
  if (initialized.value) return
  storagePrefix = typeof options.storagePrefix === 'string' && options.storagePrefix ? options.storagePrefix : 'tts.'
  loadPersisted()
  persistOnChange()
  if (isSupported) {
    refreshVoiceList()
    // In some browsers, voices may not be ready immediately
    try { synth.addEventListener('voiceschanged', onVoicesChanged) } catch (_) {}
    // Attempt a delayed refresh in case the event does not fire
    setTimeout(onVoicesChanged, 250)
    setTimeout(onVoicesChanged, 1000)
  }
  initialized.value = true
}

const voiceListForLanguage = computed(() => {
  const langPrefix = (language.value || 'en').toLowerCase()
  return voices.value.filter(v => (v.lang || '').toLowerCase().startsWith(langPrefix))
})

const selectedVoice = computed(() => {
  if (!selectedVoiceUri.value) return null
  return voices.value.find(v => v.voiceURI === selectedVoiceUri.value) || null
})

function setLanguage(next) {
  const short = (next || '').toLowerCase()
  language.value = short === 'nl' ? 'nl' : 'en'
  // If current voice does not match language, switch to a matching one if available
  const matching = voiceListForLanguage.value
  if (matching.length) {
    selectedVoiceUri.value = matching[0].voiceURI
  }
}

function selectVoiceByUri(uri) {
  if (!uri) return
  const found = voices.value.find(v => v.voiceURI === uri)
  if (found) {
    selectedVoiceUri.value = found.voiceURI
    // Align language to the selected voice's lang
    const short = (found.lang || 'en').slice(0, 2).toLowerCase()
    language.value = short === 'nl' ? 'nl' : 'en'
  }
}

function cancel() {
  if (!isSupported) return
  try { synth.cancel() } catch (_) {}
}

function speak(text, opts = {}) {
  if (!isSupported) return false
  if (!enabled.value) return false
  const utter = new SpeechSynthesisUtterance(String(text))
  const useLang = (opts.lang || language.value || 'en').toLowerCase()
  // Map short to plausible default full tags
  const defaultLangTag = useLang === 'nl' ? 'nl-NL' : 'en-US'
  utter.lang = opts.langTag || defaultLangTag
  utter.rate = typeof opts.rate === 'number' ? opts.rate : rate.value
  utter.pitch = typeof opts.pitch === 'number' ? opts.pitch : pitch.value
  utter.volume = typeof opts.volume === 'number' ? opts.volume : volume.value

  // Apply voice
  let voiceToUse = null
  if (opts.voiceUri) {
    voiceToUse = voices.value.find(v => v.voiceURI === opts.voiceUri) || null
  } else if (selectedVoice.value) {
    voiceToUse = selectedVoice.value
  } else {
    // Try to pick a voice matching the language
    voiceToUse = voiceListForLanguage.value[0] || null
  }
  if (voiceToUse) {
    utter.voice = voiceToUse
    // When voice is set, browsers usually ignore utter.lang, but it's fine
  }

  utter.onstart = () => { speaking.value = true; pending.value = synth.pending }
  utter.onend = () => { speaking.value = false; pending.value = synth.pending }
  utter.onerror = () => { speaking.value = false; pending.value = synth.pending }

  if (opts.interrupt) {
    cancel()
  }

  try {
    synth.speak(utter)
    pending.value = synth.pending
    return true
  } catch (_) {
    return false
  }
}

export function useTextToSpeech(options = {}) {
  ensureInit(options)
  return {
    // capability
    isSupported,
    // state
    enabled,
    language,
    voices,
    voiceListForLanguage,
    selectedVoiceUri,
    selectedVoice,
    rate,
    pitch,
    volume,
    speaking,
    pending,
    // actions
    refreshVoiceList,
    setLanguage,
    selectVoiceByUri,
    speak,
    cancel,
  }
}


