/**
 * Migrasi gambar base64 di contentHTML berita ke Cloudinary.
 *
 * Masalah: editor lama menyimpan foto inline sebagai data URI
 * (data:image/png;base64,...). Satu gambar bisa ~950 KB, dan karena
 * contentHTML ikut terkirim di daftar berita, satu halaman memboros
 * belasan megabyte.
 *
 * Perintah:
 *   node scripts/migrateNewsBase64Images.js            # dry-run, hanya laporan
 *   node scripts/migrateNewsBase64Images.js --apply    # benar-benar menulis
 *   node scripts/migrateNewsBase64Images.js --apply --yes   # tanpa konfirmasi interaktif
 *
 * Selalu menulis file backup lebih dulu ke backups/ sehingga bisa dipulihkan
 * dengan --restore.
 */

require("dotenv").config()
const fs = require("fs")
const path = require("path")
const { Op } = require("sequelize")

const { News, sequelize } = require("../models")
const { uploadImage } = require("../utils/uploadToCloudinary")

const APPLY = process.argv.includes("--apply")
const ASSUME_YES = process.argv.includes("--yes")
const RESTORE = process.argv.includes("--restore")
const ONLY_ID = (() => {
  const i = process.argv.indexOf("--id=")
  return i === -1 ? null : process.argv[i].slice(5)
})()

const BACKUP_DIR = path.join(__dirname, "..", "backups")
const CLOUD_FOLDER = "singgah/media"

const DATA_URI = /data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+?)(?=["'\s)]|$)/g

const fmtBytes = (n) => {
  if (!n) return "0 B"
  const mb = n / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.round(n / 1024)} KB`
}

function findBase64(html) {
  if (!html || !html.includes("base64,")) return []
  const found = []
  let m
  DATA_URI.lastIndex = 0
  while ((m = DATA_URI.exec(html)) !== null) {
    found.push({ mime: m[1], b64: m[2], full: m[0], index: m.index })
  }
  return found
}

function guessExt(mime) {
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  }
  return map[mime.toLowerCase()] || "png"
}

function writeBackup(records) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const file = path.join(BACKUP_DIR, `news-contentHTML-${stamp}.json`)
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        note: "Backup contentHTML sebelum migrasi base64 -> Cloudinary",
        records,
      },
      null,
      2,
    ),
  )
  return file
}

async function loadLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) return null
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("news-contentHTML-") && f.endsWith(".json"))
    .sort()
  if (!files.length) return null
  return path.join(BACKUP_DIR, files[files.length - 1])
}

async function restore() {
  const file = await loadLatestBackup()
  if (!file) {
    console.log("Tidak ada file backup di", BACKUP_DIR)
    process.exit(1)
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"))
  console.log(`Memulihkan ${data.records.length} record dari ${path.basename(file)}\n`)
  await sequelize.transaction(async (t) => {
    for (const r of data.records) {
      await News.update({ contentHTML: r.contentHTML }, { where: { id: r.id }, transaction: t })
      console.log(`  #${r.id} ${r.title} -> contentHTML dipulihkan`)
    }
  })
  console.log("\nSelesai memulihkan.")
  process.exit(0)
}

;(async () => {
  if (RESTORE) return await restore()

  const where = { contentHTML: { [Op.like]: "%base64,%" } }
  if (ONLY_ID) where.id = ONLY_ID

  const rows = await News.findAll({
    where,
    attributes: ["id", "title", "contentHTML"],
    order: [["id", "ASC"]],
  })

  console.log("")
  console.log("Migrasi gambar base64 berita -> Cloudinary")
  console.log("-".repeat(62))
  console.log(`Mode         : ${APPLY ? "APPLY (menulis ke database)" : "DRY-RUN (tidak menulis)"}`)
  console.log(`Recordoupon  : ${rows.length}`)
  console.log("")

  if (!rows.length) {
    console.log("Tidak ada berita dengan gambar base64. Selesai.")
    process.exit(0)
  }

  const backupPayload = []
  const plans = []
  let totalBefore = 0
  let totalAfter = 0

  for (const row of rows) {
    const hits = findBase64(row.contentHTML)
    if (!hits.length) continue

    const before = Buffer.byteLength(row.contentHTML, "utf8")
    totalBefore += before

    const uploads = []
    for (const [i, hit] of hits.entries()) {
      const buffer = Buffer.from(hit.b64.replace(/\s/g, ""), "base64")
      uploads.push({
        index: i,
        mime: hit.mime,
        bytes: buffer.length,
        full: hit.full,
        buffer,
        filename: `berita-${row.id}-${i + 1}.${guessExt(hit.mime)}`,
      })
    }

    plans.push({ row, before, uploads })
    backupPayload.push({
      id: row.id,
      title: row.title,
      contentHTML: row.contentHTML,
    })

    console.log(`#${row.id} ${row.title}`)
    console.log(`   contentHTML ${fmtBytes(before)}  |  ${hits.length} gambar base64`)
    for (const u of uploads) {
      console.log(`     - ${u.filename}  ${u.mime}  ${fmtBytes(u.bytes)}`)
    }
  }

  if (!plans.length) {
    console.log("\nTidak ada data URI base64 yang bisa dimigrasi. Selesai.")
    process.exit(0)
  }

  if (!APPLY) {
    console.log("")
    console.log("Dry-run selesai, tidak ada yang diubah.")
    console.log("Jalankan ulang dengan --apply untuk menulis ke database.")
    process.exit(0)
  }

  if (!ASSUME_YES) {
    const readline = require("readline")
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await new Promise((res) => rl.question(`Migrasi ${plans.length} record? (ya/tidak) `, res))
    rl.close()
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log("Dibatalkan.")
      process.exit(0)
    }
  }

  const backupFile = writeBackup(backupPayload)
  console.log("")
  console.log(`Backup: ${backupFile}`)

  let done = 0
  for (const plan of plans) {
    let html = plan.row.contentHTML
    for (const u of plan.uploads) {
      const result = await uploadImage(u.buffer, CLOUD_FOLDER, {
        resource_type: "image",
        filename: u.filename,
        use_filename: true,
      })
      if (!result?.secure_url) throw new Error(`Upload gagal untuk ${u.filename}`)
      html = html.split(u.full).join(result.secure_url)
      console.log(`  #${plan.row.id} ${u.filename} -> ${result.secure_url}`)
    }

    await News.update({ contentHTML: html }, { where: { id: plan.row.id } })
    const after = Buffer.byteLength(html, "utf8")
    totalAfter += after
    done += 1
    console.log(`  #${plan.row.id} contentHTML ${fmtBytes(plan.before)} -> ${fmtBytes(after)}`)
  }

  console.log("")
  console.log("-".repeat(62))
  console.log(`Selesai. ${done} record dimigrasi.`)
  console.log(`Total contentHTML: ${fmtBytes(totalBefore)} -> ${fmtBytes(totalAfter)}`)
  console.log(`Backup bisa dipulihkan dengan: node scripts/migrateNewsBase64Images.js --restore`)
  process.exit(0)
})().catch((err) => {
  console.error("Migrasi gagal:", err.message)
  process.exit(1)
})
