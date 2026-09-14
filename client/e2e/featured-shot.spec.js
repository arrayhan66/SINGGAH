import { test } from "@playwright/test"

// Screenshot booth "KARYA UNGGULAN" (FeaturedWork) inside the category room.
// Configurable output dir via SHOT_DIR (default shots/featured-detail).

const BOOTH = { x: -116.5, y: 0, z: 32 } // website room cx=-126 → cx+9.5 ; rotationY=-0.46
const OUT = process.env.SHOT_DIR || "shots/featured-detail"

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
  await page.waitForTimeout(1200)
}

async function openHall(page) {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`/hall/website`, { waitUntil: "domcontentloaded" })
  // Overlay loading baru force-hide via MAX_WAIT (15s) kalau TV video tidak
  // playable di headless; tunggu sampai useTransitionStore.loading=false.
  await page.waitForFunction(
    async () => {
      // eslint-disable-next-line no-undef
      const { useTransitionStore } = await import("/src/three/hooks/useTransition.js")
      return useTransitionStore.getState().loading === false
    },
    { timeout: 60_000 },
  )
  // Biarkan beberapa frame WebGL selesai di-render + kamera settle.
  await page.waitForTimeout(3000)
}

test("screenshot booth karya unggulan", async ({ page }) => {
  test.setTimeout(180_000)
  await openHall(page)

  // 3/4 depan-atas: seluruh booth (podium, backboard, layar)
  await setCam(page, -120.94, 0, 40.96, -116.06, 3.0, 31.1)
  await page.screenshot({ path: `${OUT}-booth34.png` })

  // Detail plakat "KARYA UNGGULAN"
  await setCam(page, -118.36, 0, 35.76, -116.5, 0.85, 32)
  await page.screenshot({ path: `${OUT}-plakat.png` })

  // Detail layar/frame karya
  await setCam(page, -118.94, 0, 36.93, -116.32, 3.4, 31.64)
  await page.screenshot({ path: `${OUT}-layar.png` })
})