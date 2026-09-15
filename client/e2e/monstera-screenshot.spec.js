import { test } from "@playwright/test"

// Verifikasi visual: pot Monstera mini (Monstera deliciosa) di ring hijau
// reading circle kategori. Ruang kategori pertama "website" berpusat di
// cx=-126, ROOM_CENTER_Z=54.25.
//   besar  -> indeks ring 0, posisi [-116.13, 58.54]
//   kecil  -> indeks ring 2, posisi [-126.54, 64.59]

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

test("screenshot Monstera besar & kecil di ring reading circle (front view)", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // A: Monstera BESAR (indeks ring 0) — dari sisi dalam ring memandang ke luar.
  await setCam(page, -119.5, 0, 56.5, -116.13, 1.1, 58.54)
  await page.screenshot({ path: "shots/monstera-besar.png" })

  // B: Monstera KECIL (indeks ring 2) — dari sisi dalam ring memandang ke luar.
  await setCam(page, -126.5, 0, 61.5, -126.54, 0.9, 64.59)
  await page.screenshot({ path: "shots/monstera-kecil.png" })

  // C: gabungan besar+kecil dalam satu frame (inda 1 besar transit di dekat kecil).
  await setCam(page, -129, 0, 56, -126.5, 1.1, 62)
  await page.screenshot({ path: "shots/monstera-besar-kecil.png" })
})