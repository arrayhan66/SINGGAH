// Shared lounge seating layout used by LoungeSeating.jsx (render) and
// objectColliders.js (collision). Keep in sync by importing from here.
export const LOUNGE_RADIUS = 8.6
export const LOUNGE_LAYOUT = [
  { angle: Math.PI / 7, lamp: false },
  { angle: Math.PI - Math.PI / 7, lamp: true },
  { angle: Math.PI + Math.PI / 7, lamp: false },
  { angle: -Math.PI / 7, lamp: true },
]

// Chair offsets along the group's local tangent, facing each other across the table.
export const CHAIR_LOCAL_OFFSETS = [
  [-1.8, 0],
  [1.8, 0],
]

export const LOUNGE_TOPIARIES = [0, Math.PI, -Math.PI / 2]
export const TOPIARY_RADIUS = 7.3

export function loungeWorldPos(angle, radius) {
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
}

export function loungeRotationY(angle) {
  return Math.PI / 2 - angle
}
