require("dotenv").config()
require("../config/env")

const { Setting, sequelize } = require("../models")

const serialize = (value) =>
  value === null || value === undefined ? null : JSON.stringify(value)

const DEFAULTS = {
  siteName: "SINGGAH",
  siteDescription:
    "Pameran karya digital mahasiswa Teknik Elektro Politeknik Negeri Banjarmasin.",
  email: "",
  phone: "",
  address: "Politeknik Negeri Banjarmasin, Kalimantan Selatan",
  instagram: "",
  twitter: "",
  youtube: "",
  footerText: "SINGGAH — Pameran Karya Mahasiswa Teknik Elektro",
  maintenanceMode: false,
  registrationOpen: true,
  emailVerification: true,
  maxUploadSize: 10,
}

const FORCE_KEYS = ["maintenanceMode"]

;(async () => {
  try {
    await sequelize.authenticate()

    let added = 0
    let updated = 0
    let skipped = 0

    for (const [key, value] of Object.entries(DEFAULTS)) {
      const row = await Setting.findOne({ where: { key } })

      if (!row) {
        await Setting.create({ key, value: serialize(value) })
        added++
        continue
      }

      const isEmpty = row.value === '""' || row.value === null || row.value === undefined
      const force = FORCE_KEYS.includes(key)

      if (force || isEmpty) {
        if (row.value !== serialize(value)) {
          row.value = serialize(value)
          await row.save()
          updated++
        } else {
          skipped++
        }
      } else {
        skipped++
      }
    }

    console.log(
      `Seed settings selesai. Ditambahkan: ${added}, Diisi: ${updated}, Dilewati (sudah terisi): ${skipped}`,
    )
    process.exit(0)
  } catch (err) {
    console.error("Seed settings gagal:", err.message)
    process.exit(1)
  }
})()
