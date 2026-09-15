import { create } from "zustand"
import { getBookMeta, fetchGoogleBookData } from "../utils/bookHelpers"

export const useBookInfoStore = create((set, get) => ({
  bookKey: null,
  bookInfo: null,
  loading: false,
  async openBook(coverKey) {
    const manualMeta = getBookMeta(coverKey)
    set({
      bookKey: coverKey,
      bookInfo: manualMeta,
      loading: true,
    })

    try {
      const fetched = await fetchGoogleBookData(coverKey, manualMeta)
      if (get().bookKey === coverKey) {
        set({ bookInfo: fetched, loading: false })
      }
    } catch {
      if (get().bookKey === coverKey) {
        set({ loading: false })
      }
    }
  },
  close() {
    set({ bookKey: null, bookInfo: null, loading: false })
  },
}))

// Expose store singleton so integration tests (Playwright) can drive the exact
// same module instance the UI subscribes to — Vite HMR can otherwise rewrite
// the module URL with a cache-busting `?t=` suffix, splitting the singleton.
if (typeof window !== "undefined") {
  window.__bookInfoStore = useBookInfoStore
}
