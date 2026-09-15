import { test } from "@playwright/test"

// Verifikasi visual fitur buku 3D interaktif di hall:
// (1) beberapa buku dengan cover berbeda di atas meja,
// (2) popup info buku saat salah satu buku diklik.

const SIDE_TABLE = { x: -13.4, y: 0, z: 9.0 } // SideTable di hall (Museum.jsx)

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

test("screenshot buku 3D di meja samping hall", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // Sudut 3/4 dekat meja samping (−13.4, 9.0) agar 2 buku + minuman terlihat.
  await setCam(page, -10.6, 0.5, 11.6, SIDE_TABLE.x + 0.3, 0.7, SIDE_TABLE.z - 0.6)
  await page.screenshot({ path: "shots/book-table.png" })

  // Depan-dekat untuk tampilan jelas cover buku di atas meja.
  await setCam(page, -10.8, 0, 7.0, SIDE_TABLE.x, 0.75, SIDE_TABLE.z + 0.2)
  await page.screenshot({ path: "shots/book-table-depan.png" })
})

test("screenshot popup info buku saat buku diklik", async ({ page }) => {
  test.setTimeout(150_000)
  await openHall(page)

  // Buka popup lewat store singleton yang sama dengan komponen UI
  // (window.__bookInfoStore — di-expose dari modul app agar kebal HMR `?t=`).
  await page.evaluate(async () => {
    window.__bookInfoStore.getState().openBook("laskar-pelangi")
  })

  await page.waitForSelector('[role="dialog"][aria-label="Info buku"]', { timeout: 10_000 })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: "shots/book-popup.png" })
})