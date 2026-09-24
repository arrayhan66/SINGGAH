import * as THREE from "three"
import { textures } from "../../utils/textures"

const WOOD = "#2a3d5f"
const WOOD_DARK = "#1f2f4e"
const FABRIC = "#3f5a7f"
const FABRIC_DARK = "#1f2f4e"
const FABRIC_LIGHT = "#e9eef6"
const OFFWHITE = "#f1f5f9"
const BRASS = "#c9a35e"
const CYAN = "#7dd3fc"
const CREAM = "#f3ecd9"
const LEAF = "#3a6a5a"
const LEAF_DARK = "#2f5f4f"

const BOOK_COLORS = ["#3f6a9e", "#7fa4c9", "#a9c4e0", "#dbe7f5", "#eef3f9", "#c9a35e", "#7dd3fc", "#93b4d4", "#5a7f9e"]

// Shared geometry/material for the ring of floor cushions (tinted per instance).
const CUSHION_GEO = new THREE.BoxGeometry(0.58, 0.12, 0.42)
const CUSHION_TOP_GEO = new THREE.BoxGeometry(0.48, 0.08, 0.33)
const CUSHION_MAT = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 })

const BC_W = 1.86
const BC_D = 0.32
const BOOKCASE_POST_TALL = new THREE.BoxGeometry(0.09, 2.8, BC_D)
const BOOKCASE_POST_SHORT = new THREE.BoxGeometry(0.09, 1.05, BC_D)
const BOOKCASE_FOOT = new THREE.BoxGeometry(0.12, 0.06, 0.24)
const BOOKCASE_SHELF = new THREE.BoxGeometry(BC_W - 0.2, 0.045, BC_D)
const BOOKCASE_SHELF_EDGE = new THREE.BoxGeometry(BC_W - 0.24, 0.09, 0.02)
const BOOKCASE_TOP = new THREE.BoxGeometry(BC_W, 0.05, BC_D)
const BOOKCASE_FRAME_MAT = new THREE.MeshStandardMaterial({ color: "#7fa0c4", roughness: 0.55 })
const BOOKCASE_FRAME_DARK_MAT = new THREE.MeshStandardMaterial({ color: "#6890b5", roughness: 0.55 })
const BOOKCASE_SHELF_MAT = new THREE.MeshStandardMaterial({ color: "#eef3f9", roughness: 0.5 })

// Books are instanced: a unit box scaled per book + per-instance cloth color,
// and one instanced spine plane per spine texture. This collapses the ~150
// book meshes per full bookcase into ~10 draw calls with zero visual change.
const BOOK_BOX_GEO = new THREE.BoxGeometry(1, 1, 1)
const BOOK_SPINE_GEO = new THREE.PlaneGeometry(1, 1)
const BOOK_BOX_MAT = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 })
const _bookSpineDefs = textures.bookSpines()
const BOOK_SPINE_MATS = _bookSpineDefs.map(
  (s) => new THREE.MeshStandardMaterial({ map: s.tex, roughness: 0.55 }),
)
const BOOK_SPINE_MAT_BY_TEX = new Map(
  _bookSpineDefs.map((s, i) => [s.tex, BOOK_SPINE_MATS[i]]),
)
const _iq = new THREE.Quaternion()
const _im = new THREE.Matrix4()
const _iv = new THREE.Vector3()
const _ip = new THREE.Vector3()
const _ic = new THREE.Color()

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export { WOOD, WOOD_DARK, FABRIC, FABRIC_DARK, FABRIC_LIGHT, OFFWHITE, BRASS, CYAN, CREAM, LEAF, LEAF_DARK, BOOK_COLORS, CUSHION_GEO, CUSHION_TOP_GEO, CUSHION_MAT, BC_W, BC_D, BOOKCASE_POST_TALL, BOOKCASE_POST_SHORT, BOOKCASE_FOOT, BOOKCASE_SHELF, BOOKCASE_SHELF_EDGE, BOOKCASE_TOP, BOOKCASE_FRAME_MAT, BOOKCASE_FRAME_DARK_MAT, BOOKCASE_SHELF_MAT, BOOK_BOX_GEO, BOOK_SPINE_GEO, BOOK_BOX_MAT, _bookSpineDefs, BOOK_SPINE_MATS, BOOK_SPINE_MAT_BY_TEX, _iq, _im, _iv, _ip, _ic, mulberry32 }
