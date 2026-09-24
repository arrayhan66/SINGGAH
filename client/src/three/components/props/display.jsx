import { Text } from "@react-three/drei"

function Chandelier({ position, lit = 0.8, drop = 1.2 }) {
  return (
    <group position={position}>
      <mesh position={[0, drop / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, drop, 8]} />
        <meshStandardMaterial color="#223047" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f3ecdf" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.34, 0.025, 8, 32]} />
        <meshStandardMaterial color="#d8cdb8" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color="#fff6e0"
          emissive="#ffd98a"
          emissiveIntensity={lit * 2.5}
        />
      </mesh>
    </group>
  )
}

function InfoPanel({ position, rotationY, entries = [] }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.0, -0.62]}>
        <boxGeometry args={[0.4, 0.12, 0.66]} />
        <meshStandardMaterial color="#223047" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[1.75, 1.52, 0.07]} />
        <meshStandardMaterial color="#16283f" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1.75, 0.05, 0.07]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <Text
        position={[0, 1.64, 0.04]}
        fontSize={0.2}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
        font="/fonts/Poppins-SemiBold.ttf"
      >
        RUANG KARYA
      </Text>
      {entries.map((e, i) => (
        <group key={i} position={[0, 1.12 - i * 0.42, 0.04]}>
          <mesh position={[-0.72, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.3} />
          </mesh>
          <Text
            position={[-0.62, 0, 0]}
            fontSize={0.17}
            color="#e2e8f0"
            anchorX="left"
            anchorY="middle"
            maxWidth={1.15}
            raycast={() => null}
            font="/fonts/Poppins-Medium.ttf"
          >
            {e.title}
          </Text>
          <Text
            position={[0.76, 0, 0]}
            fontSize={0.17}
            color="#93c5fd"
            anchorX="right"
            anchorY="middle"
            raycast={() => null}
            font="/fonts/Poppins-Medium.ttf"
          >
            {e.count}
          </Text>
        </group>
      ))}
    </group>
  )
}

function InfoKiosk({ position, rotationY, stats, categories = [], variant = "info" }) {
  const total = categories.reduce((s, c) => s + (stats?.[c.slug]?.total || 0), 0) || 49
  const catCount = categories.length || 7

  const cementColor = "#cbd5e1"
  const postColor = "#94a3b8"

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Cement Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.75, 0.1, 0.5]} />
        <meshStandardMaterial color={cementColor} roughness={0.75} />
      </mesh>
      {/* Cement Post */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.14, 2.1, 0.1]} />
        <meshStandardMaterial color={postColor} roughness={0.8} />
      </mesh>
      {/* Cement Board Frame */}
      <mesh position={[0, 2.3, 0.03]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.75, 2.1, 0.05]} />
        <meshStandardMaterial color={cementColor} roughness={0.75} />
      </mesh>

      {/* Board Panel + content (White background, Dark Navy text, Accent blue) */}
      <group position={[0, 2.3, 0.06]} rotation={[-0.15, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.65, 2.0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {variant === "guide" ? (
          <>
            {/* Guide Header */}
            <Text
              position={[0, 0.74, 0.01]}
              fontSize={0.2}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-SemiBold.ttf"
            >
              PANDUAN
            </Text>
            <Text
              position={[0, 0.58, 0.01]}
              fontSize={0.1}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Cara Menjelajah Museum
            </Text>

            <mesh position={[0, 0.42, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            <Text
              position={[-0.72, 0.34, 0.01]}
              fontSize={0.1}
              lineHeight={1.35}
              color="#1F2A44"
              anchorX="left"
              anchorY="top"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              {[
                "Drag untuk melihat-lihat",
                "Tekan WASD / klik lantai untuk berjalan",
                "Klik lukisan untuk detail karya",
                "Lewati portal putih untuk pindah kategori",
              ]
                .map((item) => `•  ${item}`)
                .join("\n")}
            </Text>

            <Text
              position={[0, -0.7, 0.01]}
              fontSize={0.14}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Selamat menjelajah!
            </Text>
          </>
        ) : (
          <>
            {/* Info Header */}
            <Text
              position={[0, 0.74, 0.01]}
              fontSize={0.2}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-SemiBold.ttf"
            >
              SINGGAH
            </Text>
            <Text
              position={[0, 0.58, 0.01]}
              fontSize={0.1}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Virtual Exhibition
            </Text>

            <mesh position={[0, 0.42, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            <Text
              position={[0, 0.26, 0.01]}
              fontSize={0.12}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              {`${total} Karya  ·  ${catCount} Kategori`}
            </Text>

            <mesh position={[0, 0.1, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            {[
              "Selamat datang di SINGGAH",
              "Virtual Exhibition",
              "karya Dosen & Mahasiswa.",
              "Masuki portal putih untuk",
              "menjelajahi setiap kategori.",
            ].map((line, i) => (
              <Text
                key={i}
                position={[0, -0.1 - i * 0.15, 0.01]}
                fontSize={0.1}
                lineHeight={1.35}
                color="#1F2A44"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.45}
                raycast={() => null}
                font="/fonts/Poppins-Medium.ttf"
              >
                {line}
              </Text>
            ))}
          </>
        )}
      </group>
    </group>
  )
}

function WallSconce({ position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.16, 0.8, 0.04]} />
        <meshStandardMaterial color="#223047" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.08, 0.7, 0.05]} />
        <meshStandardMaterial color="#dff2ff" emissive="#38bdf8" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

function CCTV({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation} scale={1.6}>
      {/* Wall corner mounting bracket (sits in the corner) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Short joint / neck */}
      <mesh position={[0, 0, 0.16]}>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Bullet camera main body (tilted down into the room) */}
      <mesh position={[0, -0.16, 0.2]} rotation={[0.85, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.46, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Camera sunshield hood */}
      <mesh position={[0, -0.06, 0.17]} rotation={[0.85, 0, 0]}>
        <boxGeometry args={[0.26, 0.035, 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Camera lens bezel front */}
      <mesh position={[0, -0.36, 0.38]} rotation={[0.85, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Glass camera lens */}
      <mesh position={[0, -0.4, 0.4]} rotation={[0.85, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
        <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={1.8} roughness={0.05} />
      </mesh>
      {/* Bright blinking recording LED */}
      <mesh position={[0.075, -0.2, 0.26]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
      </mesh>
    </group>
  )
}
export { Chandelier, InfoPanel, InfoKiosk, WallSconce, CCTV }
