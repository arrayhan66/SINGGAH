import { test } from "@playwright/test"

// Screenshot the isolated booth harness (headless-friendly: small scene, no
// hall Suspense chain). Usage:
//   - BEFORE: git stash the 3 booth files, SHOT_DIR=shots/harness-before, run.
//   - AFTER:  pop the stash, SHOT_DIR=shots/harness-after, run same command.

const OUT = process.env.SHOT_DIR || "shots/harness"

const VIEWS = [
  ["front34", [6.4, 3.2, 7.6], [0, 2.0, 0.4]],
  ["plakat", [1.5, 1.0, 3.6], [0, 0.82, 0.55]],
  ["layar", [3.6, 4.4, 4.4], [0.6, 3.9, -0.4]],
  ["depan", [0.0, 1.15, 5.6], [0, 1.6, 0.0]],
]

async function setCamera(page, pos, look) {
  await page.evaluate(
    async ({ pos, look }) => {
      // eslint-disable-next-line no-undef
      const h = await new Promise((resolve) => {
        const t = setInterval(() => {
          if (window.__harness) {
            clearInterval(t)
            resolve(window.__harness)
          }
        }, 100)
      })
      h.camera.position.set(...pos)
      h.camera.lookAt(...look)
      h.invalidate()
    },
    { pos, look },
  )
  await page.waitForTimeout(2500)
}

test("screenshot booth harness", async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`/harness.html`, { waitUntil: "domcontentloaded" })
  // Let the harness canvas mount, settle, and run a few frames.
  await page.waitForSelector("canvas", { timeout: 30_000 })
  await page.waitForTimeout(6000)

  for (const [name, pos, look] of VIEWS) {
    await setCamera(page, pos, look)
    await page.screenshot({ path: `${OUT}-${name}.png` })
  }
})