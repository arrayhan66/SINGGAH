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
    const snap = JSON.parse(raw)
    // Snapshot ini langsung dipakai sebagai koordinat kamera, jadi bentuknya
    // harus divalidasi. JSON yang tidak lengkap (mis. tulis terputus, atau
    // field diganti nama di rilis berikutnya) akan menghasilkan NaN di
    // THREE.Vector3 -- dan NaN tidak bisa dipulihkan: clamp/damp meneruskannya
    // dan Math.hypot(NaN) selalu false, sehingga collision dan portal mati
    // diam-diam tanpa jalan keluar selain reload.
    if (!snap || typeof snap !== "object") return null
    for (const key of ["x", "y", "z", "yaw"]) {
      if (typeof snap[key] !== "number" || !Number.isFinite(snap[key])) return null
    }
    if (typeof snap.pitch !== "number" || !Number.isFinite(snap.pitch)) snap.pitch = 0
    if (snap.level !== 0 && snap.level !== 1) snap.level = 0
    return snap
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

// Dipakai saat pengunjung menekan "Mulai Eksplorasi" di Beranda: kembalikan
// pemain ke titik spawn hall (tepat di depan hologram) dan buang jejak posisi
// sesi sebelumnya, sehingga masuk hall lagi selalu terasa seperti mulai baru.
export function resetToHallSpawn() {
  clearHallReturn()
  useWalkStore.getState().reset(MUSEUM.spawn.position, MUSEUM.spawn.yaw)
}

export const EYE = EYE_HEIGHT

