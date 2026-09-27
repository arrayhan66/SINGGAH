import { create } from "zustand"

// Ambient hall soundtrack, owned by the music box next to the TV: clicking the
// box toggles it, and it is already playing the moment the visitor walks in.
//
// The <audio> element is a module-level singleton rather than a component: the
// toggle has to survive remounts of the 3D scene (moving between rooms,
// opening a project detail and walking back) without restarting the track or
// re-fetching the file from the start.
const SRC = "/audios/music.mp3"
const VOLUME = 0.5
// Fade in/out length. A hard cut between loops is jarring, but a long ramp
// makes the toggle feel unresponsive — keep it short but clearly audible.
const FADE_MS = 600
const FADE_STEPS = 12

let audio = null
let unlocked = false
let volume = 0
let fadeTimer = null
let detachUnlock = null
// Once the visitor has toggled the box themselves their choice sticks: leaving
// the room and walking back in must not silently re-start the music. Before
// that first interaction the hall always opens with the music on.
let userOverrode = false

function ensureAudio() {
  if (audio) return audio
  audio = new Audio(SRC)
  audio.loop = true
  audio.preload = "auto"
  audio.volume = 0
  return audio
}

function fadeTo(target, then) {
  if (fadeTimer) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
  if (!audio) {
    volume = target
    then?.()
    return
  }
  const from = volume
  if (Math.abs(from - target) < 0.005) {
    volume = target
    audio.volume = target
    then?.()
    return
  }
  let step = 0
  fadeTimer = setInterval(() => {
    step += 1
    volume = from + (target - from) * (step / FADE_STEPS)
    if (audio) audio.volume = volume
    if (step >= FADE_STEPS) {
      clearInterval(fadeTimer)
      fadeTimer = null
      then?.()
    }
  }, FADE_MS / FADE_STEPS)
}

// Browsers only allow audio to start inside a user gesture. Reaching the hall
// normally means clicking through the site, so a gesture has almost always
// happened already — but a deep link straight to /hall can be autoplay-blocked.
// Try immediately, then latch onto the next pointer/key event and start there.
function primeUnlock() {
  if (!detachUnlock) {
    const tryStart = () => {
      if (unlocked) return
      const el = ensureAudio()
      el.volume = volume
      el.play().then(() => {
        unlocked = true
        detachUnlock?.()
        detachUnlock = null
      }).catch(() => {})
    }
    const onPointer = () => tryStart()
    const onKey = () => tryStart()
    window.addEventListener("pointerdown", onPointer)
    window.addEventListener("keydown", onKey)
    detachUnlock = () => {
      window.removeEventListener("pointerdown", onPointer)
      window.removeEventListener("keydown", onKey)
    }
  }
  const el = ensureAudio()
  el.volume = volume
  el.play().then(() => {
    unlocked = true
    detachUnlock?.()
    detachUnlock = null
  }).catch(() => {})
}

function startPlayback() {
  primeUnlock()
  ensureVisibilityBinding()
  const el = ensureAudio()
  el.play().then(() => {
    unlocked = true
    detachUnlock?.()
    detachUnlock = null
    fadeTo(VOLUME)
  }).catch(() => {
    // Autoplay blocked: keep the box lit (the visitor is in the hall, music
    // should be on) and let primeUnlock's gesture hook start it for real on
    // the first click or keypress.
    fadeTo(VOLUME)
  })
}

function stopPlayback({ rewind = false } = {}) {
  const el = audio
  if (!el) return
  fadeTo(0, () => {
    el.pause()
    // Toggling the box off and on again should pick the track back up where it
    // stopped; only a full hall exit rewinds it.
    if (rewind) el.currentTime = 0
  })
}

// Don't decode/play in a background tab — same treatment the hall TV gives its
// video. The visitor's chosen state is untouched, only the sound stops.
function bindVisibility() {
  const onChange = () => {
    const el = audio
    if (!el) return
    if (document.hidden) el.pause()
    else if (useHallMusicStore.getState().playing && el.paused) el.play().catch(() => {})
  }
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

let unbindVisibility = null

export const useHallMusicStore = create((set, get) => ({
  playing: false,

  setPlaying(next, { byUser = false } = {}) {
    if (byUser) userOverrode = true
    if (get().playing === next) {
      set({ playing: next })
      if (next) startPlayback()
      return
    }
    set({ playing: next })
    if (next) startPlayback()
    else stopPlayback()
  },

  toggle() {
    userOverrode = true
    get().setPlaying(!get().playing)
  },

  // The visitor just walked into the hall: the box must already be glowing and
  // playing. Their own choice wins once they have made it — but the element
  // still has to be (re)started, because leaving the hall paused it and the
  // canvas remounts on the way back in.
  enterHall() {
    if (!userOverrode) set({ playing: true })
    if (get().playing) startPlayback()
  },

  // Stepping out of the hall (or unmounting the canvas) silences the music so it
  // never plays over the rest of the site. The toggle state is kept for the
  // next visit, so returning resumes exactly as the visitor left it.
  leaveHall() {
    stopPlayback({ rewind: true })
    unbindVisibility?.()
    unbindVisibility = null
  },
}))

// Bind once, lazily, the first time playback is actually requested.
function ensureVisibilityBinding() {
  if (!unbindVisibility) unbindVisibility = bindVisibility()
}

export default useHallMusicStore
