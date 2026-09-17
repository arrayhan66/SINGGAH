import { test } from "@playwright/test"

// Verifikasi margin papan karya dari sudut/ujung tembok setelah FRAME_EDGE_PAD
// dinaikkan ke 1x lebar papan (2.2 m). Kamera diletakkan di dalam ruangan
// kategori "website" melihat miring ke sudut ruangan.
//
// Geometri ruangan website: x = -144..-108, z = ROW_Z0(27.25)..ROW_Z1(81.25).
//   A: sudut belakang-kiri  = titik temu dinding kiri (x=-144) & dinding
//      belakang (z=81.25) — kerja dinding kiri harus berhenti ~2.2 m sebelum
//      sudut ini.
//   B: sudut depan-kanan    = titik temu dinding kanan (x=-108) & segmen depan
//      (z=27.25), di sekitar portal keluar.

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
  await page.waitForTimeout(1200)
}

async function openHall(page) {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/hall", { waitUntil: "domcontentloaded" })
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
    { timeout: 240_000 },
  )
  // KaryaRooms lazy + tekstur butuh waktu; tunggu ekstra sebelum ambil kamera.
  await page.waitForTimeout(6000)
}

test("screenshot margin papan karya di sudut ruangan", async ({ page }) => {
  test.setTimeout(300_000)
  await openHall(page)

  // A: sudut belakang-kiri — dinding kiri (karya terakhir) ke dinding belakang.
  await setCam(page, -136.5, 0.7, 78.2, -143.4, 1.7, 80.6)
  await page.screenshot({ path: "shots/paint-margin-sudut-bl.png" })

  // B: sudut depan-kanan dekat portal — cek tak ada karya menepel/nutup.
  await setCam(page, -110.0, 0.7, 29.8, -108.8, 1.7, 27.6)
  await page.screenshot({ path: "shots/paint-margin-sudut-dr.png" })
})