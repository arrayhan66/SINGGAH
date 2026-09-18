import { create } from "zustand"
import * as THREE from "three"
import { MUSEUM, resolveHeight } from "../rooms/museumLayout"

const EYE_HEIGHT = 1.7

// How close the player must be before a work (painting) becomes hoverable and
// clickable. Shared by the painting highlight and the cursor/click gates.
export const INTERACT_RANGE = 3
// Karya (lukisan/proyek — mahasiswa maupun dosen): pengunjung boleh membuka
// detail dari jarak 6 m. Dipakai juga oleh penanda hover seminar/plakat rumah
// (project alias "karya").
export const PROJECT_RANGE = 6

const HALL_RETURN_KEY = "singgah_hall_return"

export const useWalkStore = create((set, get) => ({
  position: new THREE.Vector3(...MUSEUM.spawn.position),
  yaw: 0,
  pitch: 0,
  target: null,
  onArrive: null,
  dragMoved: false,
  pendingClick: null,
  level: 0,
  locked: false,
  isSitting: false,
  // Titik lantai yang sedang di-hover kursor (ring kursor). Null saat tidak
  // menunjuk area jalan.
  pointerPosition: null,
  hoverFloor: false,

  setLocked(value) {
    set({ locked: Boolean(value) })
  },

  setSitting(value) {
    set({ isSitting: Boolean(value) })
  },

  setPointerPosition(point) {
    set({ pointerPosition: point ? point.clone() : null })
  },

  setHoverFloor(value) {
    set({ hoverFloor: Boolean(value) })
  },

  look(dx, dy, sensitivity = 0.0035) {
    const state = get()
    const yaw = state.yaw - dx * sensitivity
    const pitch = THREE.MathUtils.clamp(state.pitch - dy * sensitivity, -1.45, 1.45)
    set({ yaw, pitch })
  },

  setTarget(point) {
    // Target duduk di ketinggian lantai yang benar di titik itu (bukan ikut
    // tinggi pemain), jadi garis & marker klik selalu menempel di lantai tujuan
    // meski pemain sedang di lantai lain / di tengah tangga.
    const p = point.clone()
    const rh = resolveHeight(p.x, p.z, get().level)
    p.setY(rh.height)
    set({ target: p })
  },

  setArrive(fn) {
    set({ onArrive: fn || null })
  },

  setDragMoved(value) {
    set({ dragMoved: value })
  },

  setPendingClick(point) {
    set({ pendingClick: point ? point.clone() : null })
  },

reset(position = [0, 0, 20], yaw = 0) {
    set({
      position: new THREE.Vector3(...position),
      yaw,
      pitch: 0,
      isSitting: false,
      locked: false,
      dragMoved: false,
      pendingClick: null,
      level: 0,
      target: null,
      onArrive: null,
      pointerPosition: null,
      hoverFloor: false,
    })
  },
}))

export function saveHallReturn() {
  const { position, yaw, pitch, level } = useWalkStore.getState()
  try {
    localStorage.setItem(
      HALL_RETURN_KEY,
      JSON.stringify({
        x: position.x,
        y: position.y,
        z: position.z,
        yaw,
        pitch,
        level,
      }),
    )
  } catch {
    /* storage unavailable — fall back to default spawn */
  }
}

export function loadHallReturn() {
  try {
    const raw = localStorage.getItem(HALL_RETURN_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearHallReturn() {
  try {
    localStorage.removeItem(HALL_RETURN_KEY)
  } catch {
    /* ignore */
  }
}

export const EYE = EYE_HEIGHT

