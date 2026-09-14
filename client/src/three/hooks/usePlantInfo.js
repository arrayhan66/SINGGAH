import { create } from "zustand"

// Popup info tanaman: ikon "i" di dekat pot membuka modal teks (nama + makna)
// lewat aksi raycast LookControls; modal DOM dirender di HallSection.
export const usePlantInfoStore = create((set) => ({
  info: null,
  setInfo(info) {
    set({ info: info ? { ...info } : null })
  },
  close() {
    set({ info: null })
  },
}))