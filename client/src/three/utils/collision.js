const PLAYER_RADIUS = 0.35
const PLAYER_HEIGHT = 1.7

// A collider blocks a player only when its vertical span overlaps the player's
// body (feet at position.y, head at position.y + PLAYER_HEIGHT). This lets the
// same 2D grid serve both the ground floor (y=0) and the mezzanine (y≈4).
function boxBlocksLevel(b, py) {
  const minY = b.minY ?? 0
  const maxY = b.maxY ?? Infinity
  return minY < py + PLAYER_HEIGHT && maxY > py
}

// Resolve a circular player against a list of axis-aligned boxes.
// Each box is { minX, maxX, minZ, maxZ, minY?, maxY? } in world space and is
// expanded by the player radius before resolving, so the push-out keeps the
// player exactly `radius` away from the box faces.
function resolveBoxes(position, boxes, radius) {
  const p = position.clone()
  for (const b of boxes) {
    if (!boxBlocksLevel(b, p.y)) continue
    const a = {
      minX: b.minX - radius,
      maxX: b.maxX + radius,
      minZ: b.minZ - radius,
      maxZ: b.maxZ + radius,
    }
    const cx = Math.max(a.minX, Math.min(p.x, a.maxX))
    const cz = Math.max(a.minZ, Math.min(p.z, a.maxZ))
    const dx = p.x - cx
    const dz = p.z - cz
    const distSq = dx * dx + dz * dz
    if (distSq === 0) {
      const pushX = Math.abs(p.x - a.minX) < Math.abs(p.x - a.maxX) ? a.minX : a.maxX
      const pushZ = Math.abs(p.z - a.minZ) < Math.abs(p.z - a.maxZ) ? a.minZ : a.maxZ
      if (Math.abs(p.x - pushX) < Math.abs(p.z - pushZ)) p.x = pushX
      else p.z = pushZ
      continue
    }
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq)
      const nx = dx / dist
      const nz = dz / dist
      p.x = cx + nx * radius
      p.z = cz + nz * radius
    }
  }
  return p
}

export function resolveCollision(position, walls) {
  const boxes = []
  for (const w of walls) {
    if (w.axis === "x") {
      boxes.push({
        minX: w.at - w.t / 2,
        maxX: w.at + w.t / 2,
        minZ: w.from,
        maxZ: w.to,
        minY: w.y0,
        maxY: w.y1,
      })
    } else {
      boxes.push({
        minX: w.from,
        maxX: w.to,
        minZ: w.at - w.t / 2,
        maxZ: w.at + w.t / 2,
        minY: w.y0,
        maxY: w.y1,
      })
    }
  }
  return resolveBoxes(position, boxes, PLAYER_RADIUS)
}

// Resolve the player against arbitrary world-space AABBs (3D models).
export function resolveAABBs(position, boxes, radius = PLAYER_RADIUS) {
  return resolveBoxes(position, boxes, radius)
}

export function resolveObjectCollision(position, colliders, level = 0) {
  const p = position.clone()
  for (const c of colliders) {
    if (c.level !== undefined && c.level !== level) continue
    const dx = p.x - c.x
    const dz = p.z - c.z
    const minDist = c.radius + PLAYER_RADIUS
    const distSq = dx * dx + dz * dz
    if (distSq === 0) {
      p.x += minDist
      continue
    }
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq)
      const push = minDist - dist
      p.x += (dx / dist) * push
      p.z += (dz / dist) * push
    }
  }
  return p
}
