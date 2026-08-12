import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _eul = new THREE.Euler()
const _scl = new THREE.Vector3()
const _mat = new THREE.Matrix4()
const _col = new THREE.Color()

// Static instanced meshes: builds the instance matrices once from `transforms`
// instead of mounting hundreds of individual <mesh> elements. Each transform
// is { position?, rotation? | quaternion?, scale? }. Optional `colors` (array of
// THREE.Color / hex / css) sets per-instance color on a shared material.
export default function InstancedMeshes({
  count,
  geometry,
  material,
  transforms,
  colors,
  ...rest
}) {
  const ref = useRef()
  const items = useMemo(() => transforms || [], [transforms])
  const tints = useMemo(() => colors || [], [colors])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const n = Math.min(items.length, count || 0)
    for (let i = 0; i < n; i++) {
      const t = items[i]
      if (!t) continue
      _pos.set(t.position?.[0] ?? 0, t.position?.[1] ?? 0, t.position?.[2] ?? 0)
      if (t.quaternion) {
        _quat.set(t.quaternion[0], t.quaternion[1], t.quaternion[2], t.quaternion[3])
      } else {
        const r = t.rotation || [0, 0, 0]
        _eul.set(r[0], r[1], r[2])
        _quat.setFromEuler(_eul)
      }
      const s = t.scale || [1, 1, 1]
      _scl.set(s[0], s[1], s[2])
      mesh.setMatrixAt(i, _mat.compose(_pos, _quat, _scl))
      if (tints[i]) mesh.setColorAt(i, _col.set(tints[i]))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items, tints, count])

  if (!count) return null
  return (
    <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} {...rest} />
  )
}
