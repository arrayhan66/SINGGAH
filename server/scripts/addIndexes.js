require("dotenv").config()
require("../config/env")

const models = require("../models")
const { sequelize } = models

;(async () => {
  try {
    await sequelize.authenticate()

    const queryInterface = sequelize.getQueryInterface()
    let added = 0
    let skipped = 0

    for (const modelName of Object.keys(models)) {
      const model = models[modelName]
      if (!model || typeof model.getTableName !== "function") continue
      if (!Array.isArray(model.options.indexes) || model.options.indexes.length === 0) {
        continue
      }

      const tableName = model.getTableName()
      const existing = await queryInterface.showIndex(tableName)
      const existingNames = new Set(existing.map((i) => i.name))

      for (const index of model.options.indexes) {
        if (index.name && existingNames.has(index.name)) {
          skipped += 1
          continue
        }

        const fields = index.fields.map((f) => {
          if (typeof f === "string") return f
          return f.attribute || f
        })

        await queryInterface.addIndex(tableName, fields, {
          name: index.name || `${String(tableName)}_${fields.join("_")}`,
          unique: !!index.unique,
        })

        console.log(`+ INDEX ${index.name || ""} on ${String(tableName)} (${fields.join(", ")})`)
        added += 1
      }
    }

    console.log(`\nIndex check selesai: ${added} ditambahkan, ${skipped} sudah ada.`)
    process.exit(0)
  } catch (err) {
    console.error("Gagal menambahkan index:", err.message)
    if (err.original) console.error(err.original.message)
    process.exit(1)
  }
})()