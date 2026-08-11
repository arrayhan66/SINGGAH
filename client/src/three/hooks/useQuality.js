import { create } from "zustand"

// Quality is STATIC: chosen once before the scene mounts and never changed.
// Runtime tier switching was the source of heavy jank — toggling antialias /
// shadows on the Canvas forces a full WebGL context recreation, and rebuilding
// geometry per tier is expensive. A fixed, conservative setting is smoother.
// No persistence: every load re-detects, so potato devices never stick to a
// heavy tier from an old session.

function detectTier() {
  const nav = typeof navigator !== "undefined" ? navigator : {}
  const ua = nav.userAgent || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (nav.maxTouchPoints || 0) > 1
  const cores = nav.hardwareConcurrency || (isMobile ? 4 : 8)
  const mem = nav.deviceMemory || (isMobile ? 4 : 8)
  if (cores <= 2 || mem <= 2) return "rendah"
  if (isMobile && (cores <= 4 || mem <= 4)) return "rendah"
  if (isMobile) return "sedang"
  if (cores <= 4 || mem <= 4) return "sedang"
  return "sedang"
}

// Cap device pixel ratio against a screen-pixel budget so hi-res monitors
// don't multiply the fill-rate, while never rendering below native resolution
// (below native = blurry). On DPR-1 desktop monitors the budget keeps DPR at
// exactly 1.0 = native = sharp; only hi-DPI screens get a slight cap.
function dprCapFor(max) {
  if (typeof window === "undefined") return max
  const native = Math.max(1, window.devicePixelRatio || 1)
  const cssPx = Math.max(1, window.innerWidth * window.innerHeight)
  const budget = 2_600_000
  const capped = Math.min(native, max, Math.sqrt(budget / cssPx))
  return Math.max(1, capped)
}

export const useQualityStore = create(() => ({
  tier: detectTier(),
}))

export const DPR_FOR = {
  rendah: [1, 1],
  sedang: [1, dprCapFor(1.5)],
  tinggi: [1, dprCapFor(1.5)],
}
export const SHADOW_FOR = { rendah: 512, sedang: 512, tinggi: 1024 }
export const ANISO_FOR = { rendah: 2, sedang: 4, tinggi: 4 }

export function getAnisotropy() {
  return ANISO_FOR[useQualityStore.getState().tier]
}

export function useLow() {
  return useQualityStore((s) => s.tier === "rendah")
}
