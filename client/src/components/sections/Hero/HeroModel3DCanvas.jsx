import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Edges } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Loader from "../../ui/Loader";
import { attachWebGLContextGuard } from "../../../three/utils/webglGuard";

// Kontainer jajargenjang menggantikan aset GLB/FBX karakter 3D.
// Semua dibentuk dari geometri proceduraal (THREE.Shape) sehingga tidak
// memerlukan file model eksternal maupun loader GLTF/FBX.
function useParallelogramShape({ w = 1.1, h = 1.4, skew = 0.4 } = {}) {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + skew / 2, -h / 2);
    s.lineTo(w / 2 + skew / 2, -h / 2);
    s.lineTo(w / 2 - skew / 2, h / 2);
    s.lineTo(-w / 2 - skew / 2, h / 2);
    s.closePath();
    return s;
  }, [w, h, skew]);
}

function ParallelogramPanel({ shape, colorTop, colorBottom, depth = 0.18 }) {
  return (
    <group>
      <mesh>
        <extrudeGeometry
          args={[shape, { depth, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 3 }]}
        />
        <meshStandardMaterial
          color={colorTop}
          metalness={0.55}
          roughness={0.25}
          emissive={colorBottom}
          emissiveIntensity={0.35}
        />
        <Edges scale={1.01} linewidth={2}>
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} transparent opacity={0.75} />
        </Edges>
      </mesh>
    </group>
  );
}

function ParallelogramContainer() {
  const shapeBig = useParallelogramShape({ w: 1.15, h: 1.5, skew: 0.42 });
  const shapeSmall = useParallelogramShape({ w: 1.0, h: 1.3, skew: 0.38 });

  return (
    <group rotation={[0, -0.5, 0]}>
      {/* Lapisan belakang */}
      <group position={[0, 0.06, -0.14]}>
        <ParallelogramPanel shape={shapeSmall} colorTop="#081a30" colorBottom="#164e79" />
      </group>
      {/* Lapisan tengah */}
      <group position={[0, -0.04, -0.06]}>
        <ParallelogramPanel shape={shapeBig} colorTop="#0a2446" colorBottom="#0e7490" />
      </group>
      {/* Lapisan depan berglow tipis */}
      <group position={[0, -0.12, 0.08]}>
        <ParallelogramPanel shape={shapeSmall} colorTop="#0d2b52" colorBottom="#0891b2" />
      </group>
    </group>
  );
}

function AnimatedScene() {
  const groupRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    if (progress < 1 && groupRef.current) {
      const next = Math.min(progress + delta * 1.2, 1);
      setProgress(next);
      const eased = 1 - Math.pow(1 - next, 3);
      groupRef.current.scale.setScalar(0.85 * eased);
    }
  });

  return (
    <group ref={groupRef} scale={0} position={[0, -0.4, 0]}>
      <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.05}>
        <ParallelogramContainer />
      </Float>
      {/* Alas silinder tipis sebagai lantai */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
        <ringGeometry args={[1.05, 1.35, 48]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0891b2" emissiveIntensity={0.5} transparent opacity={0.35} />
      </mesh>
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