import sharp from "sharp"
import { readdir } from "node:fs/promises"
import { join, basename } from "node:path"

const COVER_DIR = "src/assets/images/coverbuku"
const IMG_DIR = "src/assets/images"
const ICON_DIR = "src/assets/icons"

async function convert(file, { max, quality = 80, lossless = false }) {
  const out = file.replace(/\.(png|jpe?g|webp)$/i, ".webp")
  const tmp = out + ".tmp"
  const meta = await sharp(file).metadata()
  const w = Math.min(meta.width, max)
  const h = Math.round(meta.height * (w / meta.width))
  const img = lossless
    ? sharp(file).resize(w, h).webp({ lossless: true, effort: 6 })
    : sharp(file).resize(w, h).webp({ quality, effort: 6 })
  const info = await img.toFile(tmp)
  const { rename, rm } = await import("node:fs/promises")
  for (let i = 0; i < 5; i++) {
    try {
      await rm(out, { force: true })
      await rename(tmp, out)
      break
    } catch (e) {
      if (i === 4) throw e
      await new Promise((r) => setTimeout(r, 300 * (i + 1)))
    }
  }
  const before = (meta.size / 1024 / 1024).toFixed(2)
  const after = (info.size / 1024 / 1024).toFixed(2)
  console.log(`${basename(out)}  ${meta.width}x${meta.height} -> ${w}x${h}  ${before}MB -> ${after}MB`)
  return out
}

const coverFiles = (await readdir(COVER_DIR))
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .map((f) => join(COVER_DIR, f))

const imgFiles = (await readdir(IMG_DIR))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !f.endsWith(".webp"))
  .map((f) => join(IMG_DIR, f))

for (const f of coverFiles) {
  const big = ["samuel.jpg", "bukupython.png", "gustirabykatakokoh.png", "makanyamikir.png"].includes(basename(f))
  await convert(f, { max: big ? 1024 : 800 })
}

for (const f of imgFiles) {
  const name = basename(f)
  if (name === "bg-login.jpg") await convert(f, { max: 1600 })
  else if (name === "prabowo.png" || name === "gibran.png") await convert(f, { max: 800 })
  else if (name === "exit.jpg") continue
  else await convert(f, { max: 1024 })
}

await convert(join(ICON_DIR, "logo.png"), { max: 512, lossless: true })
