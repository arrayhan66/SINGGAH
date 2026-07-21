import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import Mahasiswa from "../../../three/models/Mahasiswa"
import Loader from "../../ui/Loader"

function AnimatedModel() {
  const groupRef = useRef()
  const [progress, setProgress] = useState(0)

  useFrame((state, delta) => {
    if (progress < 1 && groupRef.current) {
      const next = Math.min(progress + delta * 1.5, 1)
      setProgress(next)

      const eased = 1 - Math.pow(1 - next, 3)

      groupRef.current.scale.setScalar(eased * 1.6)

      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true
          child.material.opacity = eased
        }
      })
    }
  })

  return (
    <group ref={groupRef} scale={0}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.12}>
        <Mahasiswa scale={1} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
      </Float>
    </group>
  )
}

function HeroModel3D() {
  return (
    <div className="relative h-[400px] w-full lg:h-[780px] lg:w-[700px]">
      <Canvas shadows camera={{ position: [0, 1.3, 3.5], fov: 32 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 8, 5]} intensity={3} castShadow />

        <Suspense fallback={<Loader />}>
          <AnimatedModel />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          rotateSpeed={0.8}
          makeDefault
        />
      </Canvas>

      <div className="absolute bottom-16 left-1/2 h-28 w-80 -translate-x-1/2 rounded-full bg-cyan-400/25 blur-3xl" />
    </div>
  )
}

export default HeroModel3D
