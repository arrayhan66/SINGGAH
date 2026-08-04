const { Setting, sequelize } = require("../models")
const AppError = require("../utils/AppError")

const serialize = (value) => {
  if (value === null || value === undefined) return null
  return JSON.stringify(value)
}

const deserialize = (stored) => {
  if (stored === null || stored === undefined || stored === "") return null
  try {
    return JSON.parse(stored)
  } catch {
    return stored
  }
}

exports.getSettings = async () => {
  const rows = await Setting.findAll()

  const settings = {}
  rows.forEach((row) => {
    settings[row.key] = deserialize(row.value)
  })

  return settings
}

exports.getSetting = async (key) => {
  const row = await Setting.findOne({ where: { key } })
  return row ? deserialize(row.value) : null
}

exports.updateSettings = async (data) => {
  const keys = Object.keys(data)

  if (keys.length === 0) {
    throw new AppError("Tidak ada pengaturan yang dikirim", 400)
  }

  await sequelize.transaction(async (t) => {
    await Promise.all(
      keys.map(async (key) => {
        const value = serialize(data[key])
        const row = await Setting.findOne({ where: { key }, transaction: t })

        if (row) {
          row.value = value
          await row.save({ transaction: t })
        } else {
          await Setting.create({ key, value }, { transaction: t })
        }
      }),
    )
  })

  return exports.getSettings()
}
