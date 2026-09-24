import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"

// ---- Tulip (bunga tulip) ----
// VERSI MODEL 3D: menggantikan tulip prosedural dengan model GLB terkompresi
// (public/model/tulip.glb, turunan OBJ 10MB → GLB ~500KB tanpa simplify).
// Model Z-up: pangkal batang di z≈0.07, kelopak sampai z≈17. Di-render dengan
// rotasi -90° X agar tegak di sumbu Y scene, skalanya diset sehingga tinggi
// total sepadan dengan tulip lama (±1.3 di atas soil pot y=0.42). Warna kelopak
// mengikuti prop flowerColor dari Plant (default putih #f8fafc).
const TULIP_INFO = {
  title: "Bunga Tulip",
  category: "Bunga",
  text: "Bunga adalah bagian reproduksi dari tanaman yang berbunga (angiospermae), biasanya memiliki mahkota berwarna menarik dan wangi yang berfungsi menarik penyerbuk seperti serangga dan burung. Bunga juga sering digunakan sebagai hiasan, simbol kasih sayang, dan memiliki beragam makna budaya di berbagai belahan dunia.",
}

const TULIP_MODEL_URL = "/model/tulip.glb"
// Model tulip: sumbu Z = arah tinggi (pangkal z≈0.068, puncak kelopak z≈16.96).
// Dirender Z-up → rotasi -90° X agar jadi Y-up, lalu dikecilkan supaya tinggi
// total sepadan dengan tulip prosedural lama (puncak ±1.7 dari dasar pot).
// Warna kelopak bisa di-override lewat prop color (dipakai flowerColor dari Plant).
const TULIP_MODEL_SCALE = 0.076

function TulipModel({ color = "#f8fafc" }) {
  const { scene } = useGLTF(TULIP_MODEL_URL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        if (o.material?.name === "petal") {
          o.material = o.material.clone()
          o.material.color.set(color)
        }
      }
    })
    clone.rotation.x = -Math.PI / 2
    clone.scale.setScalar(TULIP_MODEL_SCALE)
    // Pangkal model (z≈0.068 → y≈0.005 setelah rotasi+skala) duduk di atas soil pot.
    clone.position.set(0, 0.42 - 0.068 * TULIP_MODEL_SCALE, 0)
    return clone
  }, [scene, color])
  return <primitive object={model} />
}
export { TULIP_INFO, TulipModel }
