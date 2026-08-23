import { execFileSync } from "node:child_process"
import { stat, rename, rm } from "node:fs/promises"
import ffmpegPath from "ffmpeg-static"

// Re-encode public/videos/hall-tv.mp4 to a lightweight build that is cheap
// to decode as a THREE.VideoTexture (540p, capped bitrate). The original
// file is kept in media/ (git-ignored) as hall-tv-original.mp4.
//
// Usage: node scripts/compress-hall-tv.mjs

const TARGET = "public/videos/hall-tv.mp4"
const ORIGINAL = "media/hall-tv-original.mp4"

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2)

const before = await stat(TARGET)
await rm(ORIGINAL, { force: true })
await rename(TARGET, ORIGINAL)

execFileSync(
  ffmpegPath,
  [
    "-y",
    "-i", ORIGINAL,
    "-vf", "scale=-2:540",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "29",
    "-maxrate", "600k",
    "-bufsize", "1200k",
    "-profile:v", "main",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "96k",
    "-movflags", "+faststart",
    TARGET,
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
)

const after = await stat(TARGET)
console.log(`hall-tv.mp4  ${mb(before.size)}MB -> ${mb(after.size)}MB`)
