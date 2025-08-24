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

function safeLocalStorageHas(key) {
  if (!isClient) return false
  try { return localStorage.getItem(storagePrefix + key) != null } catch (_) { return false }
}

function safeLocalStorageSet(key, value) {
  if (!isClient) return
  try { localStorage.setItem(storagePrefix + key, String(value)) } catch (_) {}
}

function computeCheerfulDefaults(shortLang) {
  const short = (shortLang || 'en').toLowerCase()
  // Slightly higher pitch and near-normal rate for a happier, more natural kid-friendly tone
  if (short === 'nl') return { rate: 0.98, pitch: 1.1, volume: 1 }
  return { rate: 1, pitch: 1.1, volume: 1 }
}

function loadPersisted() {
  enabled.value = safeLocalStorageGet('enabled', 'true') === 'true'
  const savedLang = safeLocalStorageGet('lang', 'nl')
  language.value = savedLang === 'nl' ? 'nl' : 'en'
  const savedVoiceUri = safeLocalStorageGet('voiceUri', null)
  selectedVoiceUri.value = savedVoiceUri
  // Use cheerful defaults if nothing has been saved yet
  const defaults = computeCheerfulDefaults(language.value)
  const hasRate = safeLocalStorageHas('rate')
  const hasPitch = safeLocalStorageHas('pitch')
  const hasVolume = safeLocalStorageHas('volume')
  const savedRate = parseFloat(safeLocalStorageGet('rate', String(defaults.rate)))
  const savedPitch = parseFloat(safeLocalStorageGet('pitch', String(defaults.pitch)))
  const savedVolume = parseFloat(safeLocalStorageGet('volume', String(defaults.volume)))
  rate.value = hasRate && Number.isFinite(savedRate) ? savedRate : defaults.rate
  pitch.value = hasPitch && Number.isFinite(savedPitch) ? savedPitch : defaults.pitch
  volume.value = hasVolume && Number.isFinite(savedVolume) ? savedVolume : defaults.volume
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

function scoreVoiceForLanguage(voice, shortLang) {
  const lang = (shortLang || 'en').toLowerCase()
  let score = 0
  const voiceLang = (voice.lang || '').toLowerCase()
  if (voiceLang.startsWith(lang)) score += 10
  if (lang === 'nl') {
    if (voiceLang === 'nl-nl') score += 6
    if (voiceLang === 'nl-be') score += 5
  }
  const name = (voice.name || '').toLowerCase()
  // Prefer natural/neural/cloud-backed voices
  if (name.includes('google')) score += 6
  if (name.includes('microsoft')) score += 4
  if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 6
  // Heuristic female indicators and common Dutch female names
  const femaleHints = ['female', 'vrouw', 'vrouwelijk', 'fem', 'hanna', 'katja', 'claire', 'ellen', 'sofie', 'lotte', 'saskia']
  if (femaleHints.some(h => name.includes(h))) score += 6
  // De-emphasize known male names in Dutch
  const maleHints = ['xander', 'bavo', 'lucas']
  if (maleHints.some(h => name.includes(h))) score -= 4
  // Prefer non-local cloud voices slightly (often more natural)
  if (voice.localService === false) score += 2
  return score
}

function getBestVoiceForLanguage(shortLang) {
  const list = voices.value || []
  if (list.length === 0) return null
  let best = null
  let bestScore = -Infinity
  for (const v of list) {
    const s = scoreVoiceForLanguage(v, shortLang)
    if (s > bestScore) { best = v; bestScore = s }
  }
  return best
}

function onVoicesChanged() {
  refreshVoiceList()
  // If we have a saved voiceUri, and it's available, keep it
  // Otherwise, pick a sensible default for the current language
  if (selectedVoiceUri.value && voices.value.some(v => v.voiceURI === selectedVoiceUri.value)) {
    return
  }
  // Prefer best-scored voice for current language
  const best = getBestVoiceForLanguage(language.value)
  selectedVoiceUri.value = best ? best.voiceURI : (voices.value[0] ? voices.value[0].voiceURI : null)
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
  // If current voice does not match language, switch to a better one if available
  const best = getBestVoiceForLanguage(language.value)
  if (best) {
    selectedVoiceUri.value = best.voiceURI
  }
  // If user never saved custom tuning, apply cheerful defaults for the new language
  const hasRate = safeLocalStorageHas('rate')
  const hasPitch = safeLocalStorageHas('pitch')
  const hasVolume = safeLocalStorageHas('volume')
  if (!hasRate || !hasPitch || !hasVolume) {
    const d = computeCheerfulDefaults(language.value)
    if (!hasRate) rate.value = d.rate
    if (!hasPitch) pitch.value = d.pitch
    if (!hasVolume) volume.value = d.volume
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
  // Apply cheerful defaults as base, then allow overrides and user tuning
  const cheerful = computeCheerfulDefaults(useLang)
  const baseRate = typeof opts.rate === 'number' ? opts.rate : (rate.value ?? cheerful.rate)
  const basePitch = typeof opts.pitch === 'number' ? opts.pitch : (pitch.value ?? cheerful.pitch)
  const baseVolume = typeof opts.volume === 'number' ? opts.volume : (volume.value ?? cheerful.volume)
  utter.rate = baseRate
  utter.pitch = basePitch
  utter.volume = baseVolume

  // Apply voice
  let voiceToUse = null
  if (opts.voiceUri) {
    voiceToUse = voices.value.find(v => v.voiceURI === opts.voiceUri) || null
  } else if (selectedVoice.value) {
    voiceToUse = selectedVoice.value
  } else {
    // Try to pick the best voice matching the language
    voiceToUse = getBestVoiceForLanguage(useLang) || voiceListForLanguage.value[0] || null
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


