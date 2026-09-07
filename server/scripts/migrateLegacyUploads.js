/* Migrasi media era penyimpanan lokal (/uploads/...) ke Cloudinary.
 * Cara pakai:
 *   cd server
 *   node scripts/migrateLegacyUploads.js            # jalankan sungguhan
 *   node scripts/migrateLegacyUploads.js --dry-run   # lihat rencana saja
 *   node scripts/migrateLegacyUploads.js --verbose   # log detail per file
 *
 * Penggunaannya aman: file lokal TIDAK dihapus. URL di DB diganti ke
 * https://res.cloudinary.com/... sehingga media kembali tampil setelah
 * deploy (route /uploads sudah tidak dilayani). */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") })
require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env.cloudinary.bak"),
})

const fs = require("fs")
const path = require("path")
const { QueryTypes } = require("sequelize")
const sequelize = require("../config/database")
const cloudinary = require("../config/cloudinary")

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "..", "uploads")

const DRY_RUN = process.argv.includes("--dry-run")
const VERBOSE = process.argv.includes("--verbose")

const EXT_RESOURCE = {
  ".mp4": "video",
  ".webm": "video",
  ".ogv": "video",
  ".mov": "video",
  ".avi": "video",
  ".pdf": "raw",
  ".doc": "raw",
  ".docx": "raw",
  ".ppt": "raw",
  ".pptx": "raw",
  ".xls": "raw",
  ".xlsx": "raw",
  ".txt": "raw",
  ".zip": "raw",
  ".rar": "raw",
}

function resourceTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return EXT_RESOURCE[ext] || "image"
}

function folderFromUrl(oldUrl) {
  const rel = oldUrl.replace(/^\/uploads\//, "").replace(/^\//, "")
  const dir = path.posix.dirname(rel)
  return dir === "." ? "" : dir
}

function existsOnDisk(oldUrl) {
  const safe = oldUrl.replace(/^\/uploads\//, "").replace(/\.\./g, "")
  return path.join(UPLOAD_ROOT, safe)
}

async function listStringColumns() {
  const rows = await sequelize.query(
    `SELECT TABLE_NAME AS \`table\`, COLUMN_NAME AS \`column\`, COLUMN_TYPE AS type
       FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND (DATA_TYPE IN ('varchar','char','text'))
      ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    { type: QueryTypes.SELECT },
  )
  return rows
}

async function findLegacyRows(table, column) {
  const quoted = `\`${table}\`.\`${column}\``
  return sequelize.query(
    `SELECT id, ${quoted} AS value
       FROM \`${table}\`
      WHERE ${quoted} LIKE '%/uploads/%'
        AND ${quoted} IS NOT NULL`,
    { type: QueryTypes.SELECT },
  )
}

async function uploadOne(oldUrl, absPath) {
  const folder = folderFromUrl(oldUrl)
  const resource_type = resourceTypeFromPath(absPath)
  const result = await cloudinary.uploader.upload(absPath, {
    folder,
    resource_type,
    secure: true,
    use_filename: false,
    overwrite: false,
  })
  return result.secure_url
}

async function updateRow(table, column, id, newUrl) {
  await sequelize.query(
    `UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`,
    { replacements: [newUrl, id] },
  )
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME belum diisi. Salin nilai dari server/.env.cloudinary.bak ke server/.env.",
    )
  }
  if (DRY_RUN) console.log(">>> MODE DRY-RUN: tidak upload & tidak ubah DB\n")
  else console.log(">>> MODE NYATA: file akan di-upload ke Cloudinary & DB diupdate\n")

  await sequelize.authenticate()
  console.log("Koneksi DB OK\n")

  const columns = await listStringColumns()
  const taskByUrl = new Map()

  for (const { table, column } of columns) {
    const rows = await findLegacyRows(table, column)
    if (!rows.length) continue
    console.log(`${table}.${column}: ${rows.length} record dengan URL lama`)
    for (const r of rows) taskByUrl.set(r.value, { table, column, rowId: r.id })
  }

  if (!taskByUrl.size) {
    console.log("\nTidak ada URL /uploads/ ditemukan di DB. Tidak ada yang perlu dimigrasi.")
    await sequelize.close()
    return
  }

  console.log(`\n${taskByUrl.size} URL unik akan dipindah.\n`)

  let migrated = 0
  let missing = 0
  let failed = 0
  const updatedUrls = new Set()

  for (const [oldUrl, meta] of taskByUrl) {
    if (updatedUrls.has(oldUrl)) {
      if (VERBOSE) console.log(`skip (sudah dicek): ${oldUrl}`)
      continue
    }
    updatedUrls.add(oldUrl)

    if (!/^\/uploads\//.test(oldUrl)) {
      if (VERBOSE) console.log(`skip (bukan relatif lokal): ${oldUrl}`)
      continue
    }

    const absPath = existsOnDisk(oldUrl)
    if (!fs.existsSync(absPath)) {
      console.log(`LEWAT (file tidak ada di disk): ${oldUrl}`)
      missing++
      continue
    }

    if (DRY_RUN) {
      console.log(`[rencana] ${oldUrl} -> ${folderFromUrl(oldUrl)}/ ${path.basename(absPath)}`)
      continue
    }

    try {
      const newUrl = await uploadOne(oldUrl, absPath)
      await updateRow(meta.table, meta.column, meta.rowId, newUrl)
      if (VERBOSE) console.log(`OK ${meta.table}.${meta.column}#${meta.rowId}`)
      else console.log(`OK ${oldUrl} -> ${newUrl}`)
      migrated++
    } catch (err) {
      console.error(`GAGAL ${oldUrl}: ${err.message}`)
      failed++
    }
  }

  if (DRY_RUN) return
  console.log(
    `\nSelesai. Berhasil: ${migrated}, file hilang: ${missing}, gagal: ${failed}.`,
  )
  if (missing || failed) {
    console.log("Jika ada yang gagal, jalankan ulang skrip — file yang sudah OK akan dilewati.")
  }
}

main()
  .catch((err) => {
    console.error("\nERROR:", err.message)
    process.exitCode = 1
  })
  .finally(() => sequelize.close())