import * as THREE from "three"

const PLAYER_HEIGHT = 1.7

// Flat threshold (world Y extent): anything this thin is a decal / floor / rug /
// glow strip / book cover and is walked over, not collided with.
const FLAT_THRESHOLD = 0.22

const tmpBox = new THREE.Box3()
const tmpSize = new THREE.Vector3()

// Collect world-space AABBs of every solid 3D mesh in the scene so the player
// can never walk through a model. Filtered out automatically:
//  - meshes flagged noCollide (self or any ancestor): portals, flush doors, …
//  - flat / paper-thin meshes: floors, rugs, glow rings, baseboards, books, …
//  - meshes that sit entirely above the player's head: ceilings, chandeliers,
//    hanging plants, wall clocks, curtains, banners, CCTV, …
// Everything else (furniture, plants, benches, kiosks, statues, barriers, …)
// becomes an impenetrable collider.
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
    if (tmpBox.min.y > PLAYER_HEIGHT) return
    boxes.push({ minX: tmpBox.min.x, maxX: tmpBox.max.x, minZ: tmpBox.min.z, maxZ: tmpBox.max.z })
  })
  return boxes
}
