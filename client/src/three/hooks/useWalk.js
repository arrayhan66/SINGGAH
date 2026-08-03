import { create } from "zustand"
import * as THREE from "three"

const EYE_HEIGHT = 1.7

export const useWalkStore = create((set, get) => ({
  position: new THREE.Vector3(0, 0, 20),
  yaw: 0,
  pitch: 0,
  target: null,
  onArrive: null,
  dragMoved: false,
  pendingClick: null,

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
    })
  },
}))

export const EYE = EYE_HEIGHT
