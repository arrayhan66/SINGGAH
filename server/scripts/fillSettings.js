require("dotenv").config()
require("../config/env")

const { Setting, sequelize } = require("../models")

const serialize = (value) => JSON.stringify(value)

const VALUES = {
  email: "singgah@poliban.ac.id",
  phone: "+62 813-4567-8900",
  instagram: "@singgah.poliban",
  twitter: "@singgahpoliban",
  youtube: "@singgahpoliban",
}

;(async () => {
  try {
    await sequelize.authenticate()

    let updated = 0
    let skipped = 0

    for (const [key, value] of Object.entries(VALUES)) {
      const row = await Setting.findOne({ where: { key } })

      if (!row) {
        await Setting.create({ key, value: serialize(value) })
        updated++
        console.log(`  [baru] ${key} = ${value}`)
        continue
      }

      const isEmpty =
        row.value === '""' || row.value === null || row.value === undefined

      if (isEmpty) {
        row.value = serialize(value)
        await row.save()
        updated++
        console.log(`  [diisi] ${key} = ${value}`)
      } else {
        skipped++
        console.log(`  [lewati] ${key} sudah terisi: ${row.value}`)
      }
    }

    console.log(`Selesai. Diisi: ${updated}, Dilewati: ${skipped}`)
    process.exit(0)
  } catch (err) {
    console.error("Gagal:", err.message)
    process.exit(1)
  }
})()
