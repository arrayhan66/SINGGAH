import * as THREE from "three"

// Flat threshold (world Y extent): anything this thin is a decal / floor / rug /
// glow strip / book cover and is walked over, not collided with.
const FLAT_THRESHOLD = 0.22

const tmpBox = new THREE.Box3()
const tmpSize = new THREE.Vector3()

// Collect world-space AABBs of every solid 3D mesh in the scene so the player
// can never walk through a model. Filtered out automatically:
//  - meshes flagged noCollide (self or any ancestor): portals, flush doors,
//    stair treads, the mezzanine slab, …
//  - flat / paper-thin meshes: floors, rugs, glow rings, baseboards, books, …
// Every box keeps its vertical span (minY/maxY) so the resolver in collision.js
// only blocks a player whose body height overlaps it — furniture on the
// mezzanine (y≈4) blocks mezzanine walkers but never ground-floor walkers, and
// ceiling-hung pieces never block anyone.
export function getCollidableAABBs(scene) {
  const boxes = []
  scene.updateMatrixWorld(true)
  scene.traverse((obj) => {
    if (!obj.isMesh) return
    for (let node = obj; node; node = node.parent) {
      if (node.userData?.noCollide) return
    }
    tmpBox.setFromObject(obj)
    if (tmpBox.isEmpty()) return
    tmpBox.getSize(tmpSize)
    if (tmpSize.y < FLAT_THRESHOLD) return
    boxes.push({
      minX: tmpBox.min.x,
      maxX: tmpBox.max.x,
      minZ: tmpBox.min.z,
      maxZ: tmpBox.max.z,
      minY: tmpBox.min.y,
      maxY: tmpBox.max.y,
    })
  })
  return boxes
}
