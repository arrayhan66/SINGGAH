import { test } from "@playwright/test"

// Verifikasi visual struktur baru tanaman: Persian (ungu) di lounge dan
// Rubber Plant (Ficus elastica, hijau) di samping hologram hall.
// Kamera diatur langsung lewat useWalkStore (modul yang sama dengan app).

const PERSIAN_PLANT = { x: 7.3, y: 0, z: 0 } // lounge topiary/persian di radius 7.3, arah +X
const RUBBER_PLANT = { x: -2.6, y: 0, z: 0 } // hall, samping hologram

async function setCam(page, px, py, pz, tx, ty, tz) {
  await page.evaluate(
    async ({ px, py, pz, tx, ty, tz }) => {
      // eslint-disable-next-line no-undef
      const { useWalkStore } = await import("/src/three/hooks/useWalk.js")
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
        position: { x: px, y: py, z: pz },
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
  // Overlay loading baru hilang saat scene benar-benar siap (atau fallback 15s).
  await page
    .waitForSelector(".opacity-0.pointer-events-none", { timeout: 60_000 })
    .catch(() => {})
  await page.waitForTimeout(7000)
}

test("screenshot tanaman persian dari 3 sudut", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // Verifikasi clipping: "3/4 depan-atas" — melihat pot + bagian bawah daun
  // dari depan-kanan yang sedikit ditinggikan.
  await setCam(page, 10.8, 1.0, 3.4, PERSIAN_PLANT.x + 0.1, 0.85, 0.1)
  await page.screenshot({ path: "shots/plant-34.png" })

  // "Depan": berdiri di luar radius, memandang ke mahkota.
  await setCam(page, 11.2, 0, 0, PERSIAN_PLANT.x + 0.1, 1.0, 0)
  await page.screenshot({ path: "shots/plant-depan.png" })

  // "Samping": dari arah tegak lurus, siluet cangkir terlihat dari sisi.
  await setCam(page, PERSIAN_PLANT.x, 0, 7.2, PERSIAN_PLANT.x, 1.0, 0)
  await page.screenshot({ path: "shots/plant-samping.png" })

  // "Atas": vantage tinggi (eye ~5.1) melihat menunduk ke pusat.
  await setCam(page, 8.1, 3.4, 0, PERSIAN_PLANT.x, 0.6, 0)
  await page.screenshot({ path: "shots/plant-atas.png" })
})

test("screenshot rubber plant dari 3 sudut + label", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // "Depan": dari luar, sejajar hologram, memandang spiral daun.
  await setCam(page, 1.4, 0, 0, RUBBER_PLANT.x, 0.85, 0)
  await page.screenshot({ path: "shots/rubber-depan.png" })

  // "Samping": tegak lurus arah, siluet batang + susunan spiral terlihat.
  await setCam(page, RUBBER_PLANT.x, 0, 2.8, RUBBER_PLANT.x, 0.9, 0)
  await page.screenshot({ path: "shots/rubber-samping.png" })

  // "Atas": menunduk melihat susunan spiral dari pucuk.
  await setCam(page, -1.6, 3.4, 0.4, RUBBER_PLANT.x, 0.7, 0)
  await page.screenshot({ path: "shots/rubber-atas.png" })

  // "Label": dekat & di depan pot supaya kartu informasi terbaca jelas.
  await setCam(page, -2.2, 0.55, 2.3, RUBBER_PLANT.x, 0.9, 0)
  await page.screenshot({ path: "shots/rubber-label.png" })
})

test("screenshot popup info tanaman terbuka", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // Buka popup lewat store yang sama dengan aksi klik ikon "i".
  await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const { usePlantInfoStore } = await import("/src/three/hooks/usePlantInfo.js")
    usePlantInfoStore.getState().setInfo({
      title: "Rubber Plant (Ficus elastica)",
      text: "Tanaman hias populer dengan daun hijau tebal mengkilap yang tahan banting. Melambangkan pertumbuhan, kemakmuran, dan keteguhan — dipercaya membawa energi positif serta mudah dirawat sehingga cocok untuk ruang kerja maupun pameran.",
    })
  })

  await page.getByText("Rubber Plant (Ficus elastica)").waitFor({ timeout: 5000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: "shots/rubber-popup.png" })
})

test("screenshot popup info tanaman saat light mode", async ({ page }) => {
  test.setTimeout(150_000)
  // Paksa tema terang sebelum app di-muat.
  await page.addInitScript(() => localStorage.setItem("singgah-theme", "light"))
  await openHall(page)

  await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const { usePlantInfoStore } = await import("/src/three/hooks/usePlantInfo.js")
    usePlantInfoStore.getState().setInfo({
      title: "Persian Shield (Strobilanthes dyerianus)",
      text: "Tanaman hias asal Asia Tenggara dengan daun ungu metalik ikonik. Melambangkan keanggunan, kreativitas, dan keunikan — sering digunakan untuk mempercantik ruang dengan sentuhan warna yang berani namun elegan.",
    })
  })

  await page.getByText("Persian Shield (Strobilanthes dyerianus)").waitFor({ timeout: 5000 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: "shots/rubber-popup-light.png" })
})