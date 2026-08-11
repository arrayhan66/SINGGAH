import { useQualityStore, SHADOW_FOR } from "../hooks/useQuality"

function GalleryLights() {
  const tier = useQualityStore((s) => s.tier)
  const shadow = SHADOW_FOR[tier]
  return (
    <>
      <hemisphereLight args={["#cfe0f5", "#1e3a5f", 0.95]} />
      <ambientLight intensity={0.75} color="#bfe0ff" />
      <directionalLight
        position={[15, 24, 10]}
        intensity={1.3}
        color="#e4f1ff"
        castShadow={tier === "tinggi"}
        shadow-mapSize-width={shadow}
        shadow-mapSize-height={shadow}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={34}
        shadow-camera-bottom={-50}
      />
    </>
  )
}

export default GalleryLights
