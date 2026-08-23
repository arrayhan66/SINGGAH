import { useSyncExternalStore } from "react"

// Shared readiness flag for the main-hall TV video. The loading overlay
// treats it as one extra asset, so the hall only opens at 100% once the
// TV is actually ready to show (and play) its video.
let ready = false
const listeners = new Set()

export function markTvReady() {
  if (ready) return
  ready = true
  listeners.forEach((listener) => listener())
}

export function resetTvReady() {
  ready = false
}

export default function useTvReady() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => ready,
    () => false,
  )
}
