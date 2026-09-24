import { Pot, posHash, resolveStyle, resolveFlower, SOIL_MAT, PLANT_STEM_MAT, PLANT_LEAF_MAT, PLANT_LEAF_DARK_MAT } from "./shared.jsx"
import { FlowerHead } from "./flowerheads.jsx"
import { SunflowerPlant } from "./sunflower.jsx"
import { MonsteraMini } from "./monstera.jsx"
import { RubberPlant } from "./rubber.jsx"
import { PersianFoliage } from "./persian.jsx"
import { TulipModel } from "./tulip.jsx"
import { PlantInfoIcon } from "./infoicon.jsx"

function Plant({
  position,
  scale = 1,
  variant = "bush",
  flowerColor = "#38bdf8",
  potColor,
  potStyle,
flowerType,
  flowerScale = 1,
  monsteraVariant = "besar",
  info,
}) {
  const h = posHash(position)
  const style = resolveStyle(potStyle, h)
  const ftype = variant === "flower" ? resolveFlower(flowerType, h) : null
  // Per-stem head orientations (deterministic, varied per stem)
  const headTurns = [
    [0.25, h % 6.28, 0.15],
    [-0.2, ((h >>> 5) % 6.28), -0.12],
    [0.15, ((h >>> 9) % 6.28), 0.2],
  ]

  return (
    <group position={position} scale={scale}>
      {/* Soil disc shared by every pot style */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.03, 18]} />
        <primitive object={SOIL_MAT} attach="material" />
      </mesh>
      <Pot style={style} colorOverride={potColor} />

      {variant === "bush" && (
        <>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 0.6, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          {[[0.3, 0.5, 0.1], [-0.25, 0.6, 0.2], [0.05, 0.75, -0.2], [-0.15, 0.5, -0.25], [0.2, 0.7, 0.22]].map(
            (p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.3, 12, 12]} />
                <primitive object={PLANT_LEAF_MAT} attach="material" />
              </mesh>
            ),
          )}
        </>
      )}

      {variant === "flower" &&
        (ftype === "tulip" ? (
          <group scale={flowerScale}>
            <TulipModel color={flowerColor} />
            {info && <PlantInfoIcon info={info} position={[0, 2.35, 0]} />}
          </group>
        ) : ftype === "sunflower" ? (
          <SunflowerPlant h={h} />
        ) : (
          <>
            {[[-0.18, 0, -0.05], [0.18, 0, 0.05], [0, 0, 0.12]].map((s, i) => (
              <mesh
                key={i}
                position={[s[0], 0.75, s[2]]}
                rotation={[s[2] * 0.6, 0, s[0] * 0.6]}
              >
                <cylinderGeometry args={[0.02, 0.035, 0.9, 6]} />
                <primitive object={PLANT_STEM_MAT} attach="material" />
              </mesh>
            ))}
            {headTurns.map((t, i) => (
              <group
                key={i}
                position={[[-0.2, 1.22, -0.1], [0.2, 1.18, 0.08], [0, 1.26, 0.15]][i]}
                rotation={[t[0], t[1], t[2]]}
                scale={ftype === "lavender" ? 0.95 : 1}
              >
                <FlowerHead type={ftype} color={flowerColor} />
              </group>
            ))}
            {[[-0.28, 1.05, 0.02], [0.3, 1.0, 0.12]].map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <primitive object={PLANT_LEAF_MAT} attach="material" />
              </mesh>
            ))}
            {[[-0.16, 0.9, -0.02], [0.16, 0.86, 0.1]].map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <primitive object={PLANT_LEAF_MAT} attach="material" />
              </mesh>
            ))}
          </>
        ))}

      {variant === "tall" && (
        <>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 1.7, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          {[[0, 1.35, 0], [0.12, 1.1, 0.1], [-0.12, 1.5, -0.1], [0.08, 1.7, 0.15]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.34, 12, 12]} />
              <primitive object={PLANT_LEAF_MAT} attach="material" />
            </mesh>
          ))}
          <mesh position={[0, 2.0, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <primitive object={PLANT_LEAF_DARK_MAT} attach="material" />
          </mesh>
        </>
      )}

      {variant === "topiary" && (
        <>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.55, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.36, 16, 16]} />
            <primitive object={PLANT_LEAF_MAT} attach="material" />
          </mesh>
          <mesh position={[0, 1.18, 0]}>
            <sphereGeometry args={[0.26, 16, 16]} />
            <primitive object={PLANT_LEAF_DARK_MAT} attach="material" />
          </mesh>
        </>
      )}

      {variant === "leafy" && (
        <RubberPlant h={h} />
      )}

      {variant === "leafy" && info && (
        <PlantInfoIcon info={info} position={[0, 2.05, 0]} />
      )}

      {variant === "persian" && (
        <PersianFoliage h={h} />
      )}

      {variant === "persian" && info && (
        <PlantInfoIcon info={info} position={[0, 1.45, 0]} />
      )}

      {variant === "monstera" && (
        <MonsteraMini h={h} variant={monsteraVariant} />
      )}

      {variant === "monstera" && info && (
        <PlantInfoIcon
          info={info}
          position={[0, monsteraVariant === "besar" ? 2.1 : 1.4, 0]}
        />
      )}
    </group>
  )
}
export { Plant }
