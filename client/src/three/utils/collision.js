const PLAYER_RADIUS = 0.35
const PLAYER_HEIGHT = 1.7

function wallAABB(w, r) {
  if (w.axis === "x") {
    return {
      minX: w.at - w.t / 2 - r,
      maxX: w.at + w.t / 2 + r,
      minZ: w.from - r,
      maxZ: w.to + r,
    }
  }
  return {
    minX: w.from - r,
    maxX: w.to + r,
    minZ: w.at - w.t / 2 - r,
    maxZ: w.at + w.t / 2 + r,
  }
}

export function resolveCollision(position, walls) {
  const p = position.clone()
  for (const w of walls) {
    if (w.y0 > PLAYER_HEIGHT) continue
    const a = wallAABB(w, PLAYER_RADIUS)
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
    if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
      const dist = Math.sqrt(distSq)
      const nx = dx / dist
      const nz = dz / dist
      p.x = cx + nx * PLAYER_RADIUS
      p.z = cz + nz * PLAYER_RADIUS
    }
  }
  return p
}
