import { create } from "zustand"

const KEY = "singgah-hall-quality"
const TIER_ORDER = ["rendah", "sedang", "tinggi"]

function readStored() {
  try {
    const v = localStorage.getItem(KEY)
    return TIER_ORDER.includes(v) ? v : null
  } catch {
    return null
  }
}

// Rough capability probe — coarse but enough to pick a sensible starting tier.
// Kept cheap and dependency-free so it runs before the 3D scene mounts.
function detectTier() {
  const stored = readStored()
  if (stored) return stored
  const nav = typeof navigator !== "undefined" ? navigator : {}
  const ua = nav.userAgent || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (nav.maxTouchPoints || 0) > 1
  const cores = nav.hardwareConcurrency || (isMobile ? 4 : 8)
  const mem = nav.deviceMemory || (isMobile ? 4 : 8)
  if (isMobile && (cores <= 4 || mem <= 4)) return "rendah"
  if (isMobile) return "sedang"
  if (cores <= 4 || mem <= 4) return "sedang"
  return "tinggi"
}

function persist(tier) {
  try {
    localStorage.setItem(KEY, tier)
  } catch {
    /* storage unavailable */
  }
}

export const useQualityStore = create((set, get) => ({
  tier: detectTier(),
  auto: true,
  setTier(tier) {
    persist(tier)
    set({ tier, auto: false })
  },
  cycle() {
    const { tier } = get()
    const next = TIER_ORDER[(TIER_ORDER.indexOf(tier) + 1) % TIER_ORDER.length]
    persist(next)
    set({ tier: next, auto: false })
  },
  downgrade() {
    const i = TIER_ORDER.indexOf(get().tier)
    if (i > 0) {
      const next = TIER_ORDER[i - 1]
      persist(next)
      set({ tier: next })
    }
  },
  upgrade() {
    const i = TIER_ORDER.indexOf(get().tier)
    if (i < TIER_ORDER.length - 1) {
      const next = TIER_ORDER[i + 1]
      persist(next)
      set({ tier: next })
    }
  },
}))

export const TIERS = TIER_ORDER

export const DPR_FOR = { rendah: [1, 1], sedang: [1, 1.5], tinggi: [1, 2] }
export const SHADOW_FOR = { rendah: 512, sedang: 1024, tinggi: 2048 }
export const ANISO_FOR = { rendah: 2, sedang: 4, tinggi: 8 }

export function getAnisotropy() {
  return ANISO_FOR[useQualityStore.getState().tier]
}
