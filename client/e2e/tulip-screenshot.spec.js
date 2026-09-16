import { test } from "@playwright/test"
import { GLTFLoader } from "three-stdlib"
import { MeshoptDecoder } from "meshoptimizer"

// Verifikasi visual: pot tulip model 3D (public/model/tulip.glb, kompresi
// OBJ 10MB → GLB ~0.5MB tanpa simplify) di ruang kategori "website".
// Posisi pot (dari museumLayout.js):
//   x0 = -144, STAIR_WIDTH = 2.6, STAIR_Z0 = ROW_Z0 + 4 = 31.25
//   Tulip dekat tangga : [x0 + STAIR_WIDTH + 1.2, 0, STAIR_Z0 - 0.6] = [-140.2, -, 30.65]
//   Tulip dekor lantai : [x0 + STAIR_WIDTH + 1.2, 0, STAIR_Z0 - 3.4] = [-140.2, -, 27.85]

async function setCam(page, px, py, pz, tx, ty, tz) {
  await page.evaluate(
    async ({ px, py, pz, tx, ty, tz }) => {
      const { useWalkStore } = await import("/src/three/hooks/useWalk.js")
      const pos = useWalkStore.getState().position.set(px, py, pz)
      const eyeY = py + 1.7
      const fx = tx - px,
        fy = ty - eyeY,
        fz = tz - pz
      const len = Math.hypot(fx, fy, fz) || 1
      const nx = fx / len,
        ny = fy / len,
        nz = fz / len
      const yaw = Math.atan2(-nx, -nz)
      const pitch = Math.asin(Math.max(-1, Math.min(1, ny)))
      useWalkStore.setState({
        position: pos,
        yaw,
        pitch,
        target: null,
        isSitting: false,
        level: 0,
        locked: false,
      })
    },
    { px, py, pz, tx, ty, tz },
  )
  await page.waitForTimeout(900)
}

async function openHall(page) {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/hall", { waitUntil: "domcontentloaded" })
  // LoadingOverlay memuat teks "MEMPERSIAPKAN VIRTUAL HALL" dan baru hilang
  // (opacity-0) setelah scene + TV siap. Tunggu elemen spesifik itu transparan:
  await page.waitForFunction(
    () => {
      const ov = [...document.querySelectorAll(".fixed.inset-0.z-50")].find((el) =>
        el.textContent.includes("MEMPERSIAPKAN VIRTUAL HALL"),
      )
      return (
        !!ov &&
        ov.classList.contains("opacity-0") &&
        ov.classList.contains("pointer-events-none")
      )
    },
    { timeout: 60_000 },
  )
  await page.waitForTimeout(3000)
}

test("tulip.glb dimuat & pupus dirender di scene", async ({ page }) => {
  test.setTimeout(150_000)
  const glbReq = page.waitForResponse((r) => r.url().includes("/model/tulip.glb") && r.status() === 200)
  await openHall(page)
  const status = (await glbReq).status()
  if (status !== 200) throw new Error(`tulip.glb gagal dimuat: ${status}`)

  const bytes = await page.evaluate(async () => {
    const res = await fetch("/model/tulip.glb")
    return Array.from(new Uint8Array(await res.arrayBuffer()))
  })

  const buf = new Uint8Array(bytes).buffer
  const { petalMeshes, stalk } = await new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.parse(buf, "", (g) => {
      let petalMeshes = 0
      let stalk = 0
      g.scene.traverse((o) => {
        if (o.isMesh) {
          if (o.material?.name === "petal") petalMeshes++
          if (o.material?.name === "stalk") stalk++
        }
      })
      resolve({ petalMeshes, stalk })
    }, reject)
  })
  if (stalk < 1 || petalMeshes < 6) {
    throw new Error(`Material GLB tak utuh: ${JSON.stringify({ petalMeshes, stalk })}`)
  }
})

test("screenshot tulip model 3D di pot (tangga & lantai)", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // A: tulip dekat tangga (flowerScale 0.68) — kamera di dalam ruangan menghadap pot.
  await setCam(page, -138.2, 0.55, 32.2, -140.2, 1.0, 30.65)
  await page.screenshot({ path: "shots/tulip-tangga.png" })

  // B: tulip dekor lantai (flowerScale default) — dekat & jelas di depan pot.
  await setCam(page, -138.3, 0.55, 29.4, -140.2, 1.0, 27.85)
  await page.screenshot({ path: "shots/tulip-lantai.png" })

  // C: kedua tulip dalam satu frame (dari tengah ruangan ke arah tangga).
  await setCam(page, -133, 0.9, 34.5, -140.2, 1.1, 29)
  await page.screenshot({ path: "shots/tulip-pasangan.png" })
})