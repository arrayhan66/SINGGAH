import { create } from "zustand"
import * as THREE from "three"
import { MUSEUM } from "../rooms/museumLayout"

const EYE_HEIGHT = 1.7

// How close the player must be before a work (painting) becomes hoverable and
// clickable. Shared by the painting highlight and the cursor/click gates.
export const INTERACT_RANGE = 6

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

  setLocked(value) {
    set({ locked: Boolean(value) })
  },

  setSitting(value) {
    set({ isSitting: Boolean(value) })
  },

  look(dx, dy, sensitivity = 0.0035) {
    const state = get()
    const yaw = state.yaw - dx * sensitivity
    const pitch = THREE.MathUtils.clamp(state.pitch - dy * sensitivity, -1.45, 1.45)
    set({ yaw, pitch })
  },

  setTarget(point) {
    set({ target: point.clone().setY(get().position.y) })
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
      position: new THREE.Vector3(position[0], position[1], position[2]),
      yaw,
      pitch: 0,
      target: null,
      onArrive: null,
      dragMoved: false,
      pendingClick: null,
      level: 0,
      locked: false,
      isSitting: false,
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
