import { create } from "zustand"

let endTimer = null

export const useTransitionStore = create((set) => ({
  active: false,
  loading: true,
  message: "",
  runId: 0,
  startedAt: 0,
  start(message, duration = 800) {
    if (endTimer) clearTimeout(endTimer)
    set((s) => ({ active: true, message, startedAt: Date.now(), runId: s.runId + 1 }))
    endTimer = setTimeout(() => set({ active: false }), duration)
  },
  end() {
    if (endTimer) clearTimeout(endTimer)
    endTimer = null
    set({ active: false })
  },
  setLoading(value) {
    set({ loading: value })
  },
}))
