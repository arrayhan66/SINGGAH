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
    } catch (e) {
      if (get().bookKey === coverKey) {
        set({ loading: false })
      }
    }
  },
  close() {
    set({ bookKey: null, bookInfo: null, loading: false })
  },
}))
