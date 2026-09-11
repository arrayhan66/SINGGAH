import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { Suspense, useRef, useState, useCallback } from "react";
import StudentDeskVisual from "../../../three/components/StudentDeskScene";
import Loader from "../../ui/Loader";
import { attachWebGLContextGuard } from "../../../three/utils/webglGuard";

function AnimatedScene() {
  const groupRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    if (progress < 1 && groupRef.current) {
      const next = Math.min(progress + delta * 1.2, 1);
      setProgress(next);
      const eased = 1 - Math.pow(1 - next, 3);
      groupRef.current.scale.setScalar(0.82 * eased);
    }
  });

  return (
    <group ref={groupRef} scale={0} position={[0, -0.45, 0]}>
      <Float speed={0.8} rotationIntensity={0.01} floatIntensity={0.04}>
        <StudentDeskVisual />
      </Float>
    </group>
  );
}

function HeroModel3DCanvas() {
  const [epoch, setEpoch] = useState(0);
  const remount = useCallback(() => setEpoch((n) => n + 1), []);

  return (
    <Canvas
      key={epoch}
      onCreated={({ gl }) => attachWebGLContextGuard(gl, remount)}
      shadows
      camera={{ position: [0, 1.3, 3.5], fov: 32 }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 8, 5]} intensity={3} castShadow />

      <Suspense fallback={<Loader />}>
        <AnimatedScene />
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
  );
}

export default HeroModel3DCanvas;