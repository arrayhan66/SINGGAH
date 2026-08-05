import { create } from "zustand"

let endTimer = null

export const useTransitionStore = create((set) => ({
  active: false,
  message: "",
  runId: 0,
  start(message, duration = 1100) {
    if (endTimer) clearTimeout(endTimer)
    set((s) => ({ active: true, message, runId: s.runId + 1 }))
    endTimer = setTimeout(() => set({ active: false }), duration)
  },
  end() {
    if (endTimer) clearTimeout(endTimer)
    endTimer = null
    set({ active: false })
  },
}))
