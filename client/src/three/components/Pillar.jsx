import * as THREE from "three"

const STONE = "#f1f5f9" // clean minimalist white/off-white plaster

// Shared immutable geometry/material — every pillar reuses one allocation set.
const PLINTH_GEO = new THREE.BoxGeometry(1.4, 0.24, 1.4)
const SHAFT_GEO = new THREE.CylinderGeometry(0.6, 0.62, 9.21, 32)
const CAPITAL_GEO = new THREE.BoxGeometry(1.5, 0.3, 1.5)
const CROWN_GEO = new THREE.BoxGeometry(1.6, 0.27, 1.6)
const STONE_MAT = new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.8 })
const SHAFT_MAT = new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.85 })

function Pillar({ position }) {
  return (
    <group position={position}>
      {/* Simple minimalist base plinth */}
      <mesh geometry={PLINTH_GEO} material={STONE_MAT} position={[0, 0.12, 0]} castShadow />

      {/* Clean minimalist main shaft, running all the way up to the ceiling */}
      <mesh geometry={SHAFT_GEO} material={SHAFT_MAT} position={[0, 4.845, 0]} castShadow />

      {/* Simple minimalist capital */}
      <mesh geometry={CAPITAL_GEO} material={STONE_MAT} position={[0, 9.6, 0]} castShadow />

      {/* Crown plate merged flush into the ceiling */}
      <mesh geometry={CROWN_GEO} material={STONE_MAT} position={[0, 9.885, 0]} />
    </group>
  )
}

export default Pillar
