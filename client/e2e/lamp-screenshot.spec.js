import { test } from "@playwright/test"

// Verifikasi visual: tiang lampu (floor lamp) di reading circle kategori
// (samping kursi ottoman). Ruang kategori pertama "website" berpusat di
// cx=-126, ROOM_CENTER_Z=54.25.

async function setCam(page, px, py, pz, tx, ty, tz) {
  await page.evaluate(
    async ({ px, py, pz, tx, ty, tz }) => {
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
  await page
    .waitForSelector(".opacity-0.pointer-events-none", { timeout: 60_000 })
    .catch(() => {})
  await page.waitForTimeout(7000)
}

test("screenshot ottoman + tiang lampu di reading circle", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // A: berdiri di samping ottoman, memandang tiang lampu di atas meja tengah.
  await setCam(page, -123.6, 0, 55.4, -126, 1.9, 54.2)
  await page.screenshot({ path: "shots/lamp-ottoman-a.png" })

  // B: dari sisi lain, memperlihatkan lampu di atas meja dengan ottoman di depan.
  await setCam(page, -126, 0, 57.2, -126, 1.8, 54.2)
  await page.screenshot({ path: "shots/lamp-ottoman-b.png" })
})