import { useLayoutEffect, useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

const MODELS = {
  test: "/models/hall/tes.glb",
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url))

function useFittedScene(url) {
  const base = useGLTF(url)
  return useMemo(() => {
    const scene = base.scene.clone(true)
    scene.updateWorldMatrix(true, true)
    return { scene, box: new THREE.Box3().setFromObject(scene), base }
  }, [base])
}

function FittedModel({
  url,
  fitAxis = "max",
  target = 1,
  lift = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  shadow = true,
}) {
  const ref = useRef()
  const { scene, box, base } = useFittedScene(url)
  const done = useRef(false)
  const mixer = useRef()

  useEffect(() => {
    if (!base.animations?.length || !ref.current) return
    mixer.current = new THREE.AnimationMixer(ref.current)
    const action = mixer.current.clipAction(base.animations[0])
    action.play()
    return () => {
      mixer.current?.stopAllAction()
      mixer.current?.dispose()
    }
  }, [base])

  useFrame((state) => {
    if (mixer.current) mixer.current.update(state.delta)
  })

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || done.current) return
    done.current = true

    const size = box.getSize(new THREE.Vector3())
    const axis = fitAxis === "max" ? "max" : fitAxis === "x" ? "x" : fitAxis === "y" ? "y" : "z"
    const baseDim = axis === "max" ? Math.max(size.x, size.y, size.z) : size[axis]
    if (!(baseDim > 0)) return

    const sf = target / baseDim
    const baseY = box.min.y * sf
    const center = box.getCenter(new THREE.Vector3())
    root.scale.setScalar(sf)
    root.position.set(-center.x * sf, lift - baseY, -center.z * sf)

    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = shadow
        child.receiveShadow = true
      }
    })
  }, [scene, box, url, fitAxis, target, lift, shadow])

  return (
    <group position={position} rotation={rotation}>
      <group ref={ref}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

const CHAR_H = 1.65

function StudentDeskVisual() {
  return (
    <group>
      {/* Tes Mixamo character only */}
      <FittedModel url={MODELS.test} fitAxis="y" target={CHAR_H} position={[0, 0, 0]} />

      <pointLight position={[0, 2.2, 0]} intensity={8} distance={7} color="#bfe3ff" />
    </group>
  )
}

export default StudentDeskVisual