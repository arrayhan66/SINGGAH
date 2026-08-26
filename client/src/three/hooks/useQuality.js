import { create } from "zustand"

// Quality is STATIC: chosen once before the scene mounts and never changed.
// Runtime tier switching was the source of heavy jank — toggling antialias /
// shadows on the Canvas forces a full WebGL context recreation, and rebuilding
// geometry per tier is expensive. A fixed, conservative setting is smoother.
// No persistence: every load re-detects, so potato devices never stick to a
// heavy tier from an old session.

function detectTier() {
  const nav = typeof navigator !== "undefined" ? navigator : {}
  const isMobile = detectMobile()
  const cores = nav.hardwareConcurrency || (isMobile ? 4 : 8)
  const mem = nav.deviceMemory || (isMobile ? 4 : 8)
  if (cores <= 2 || mem <= 2) return "rendah"
  // HP/tablet flagship: GPU kuat, prioritas resolusi tajam
  if (isMobile) return cores >= 8 && mem >= 6 ? "tinggi" : "sedang"
  // Laptop/desktop: hanya mesin besar yang naik tier (lampu ekstra +
  // shadow pass itu mahal); mayoritas laptop tetap "sedang" tapi kini
  // lebih ringan karena lampu dekoratif dipangkas di tier ini
  if (cores >= 12 && mem >= 8) return "tinggi"
  return "sedang"
}

function detectMobile() {
  const nav = typeof navigator !== "undefined" ? navigator : {}
  const ua = nav.userAgent || ""
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (nav.maxTouchPoints || 0) > 1
  )
}

// Cap device pixel ratio against a screen-pixel budget so hi-res monitors
// don't multiply the fill-rate. The budget is set HIGH enough that phones
// render near their native DPR (tajam / tidak burik) while huge desktop
// monitors still get capped so fill-rate stays affordable.
function dprCapFor(max, budget) {
  if (typeof window === "undefined") return max
  const native = Math.max(1, window.devicePixelRatio || 1)
  const cssPx = Math.max(1, window.innerWidth * window.innerHeight)
  const capped = Math.min(native, max, Math.sqrt(budget / cssPx))
  // Jangan pernah turun di bawah 1.25 — di bawah itu terlihat burik
  return Math.max(1.25, capped)
}

export const useQualityStore = create(() => ({
  tier: detectTier(),
}))

// Budget piksel (css-px^2): layar kecil dapat DPR mendekati native,
// monitor raksasa tetap dibatasi. Min 1.25 agar selalu tajam.
const BUDGET_TINGGI = 3_200_000
const BUDGET_SEDANG = 2_400_000
const BUDGET_RENDAH = 1_600_000

export const DPR_FOR = {
  rendah: [1.25, dprCapFor(1.5, BUDGET_RENDAH)],
  sedang: [1.25, dprCapFor(2, BUDGET_SEDANG)],
  tinggi: [1.25, dprCapFor(2.5, BUDGET_TINGGI)],
}
export const SHADOW_FOR = { rendah: 512, sedang: 512, tinggi: 1024 }
// Anisotropy tinggi = lantai marmer & dinding tetap tajam dilihat dari
// sudut rendah (khas museum) — murah di GPU modern, hasilnya jelas terlihat
export const ANISO_FOR = { rendah: 2, sedang: 8, tinggi: 16 }

export function getAnisotropy() {
  return ANISO_FOR[useQualityStore.getState().tier]
}

export function useLow() {
  return useQualityStore((s) => s.tier === "rendah")
}

export function isMobile() {
  return detectMobile()
}
