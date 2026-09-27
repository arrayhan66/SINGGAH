const { Setting, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const cache = require("../utils/cache")
const singleFlight = require("../utils/singleFlight")

// getSetting() dipanggil di setiap request /api lewat maintenanceMiddleware
// dan di setiap request upload lewat uploadMiddleware. Tanpa cache itu satu
// query database per request untuk nilai yang jarang berubah.
const SETTING_TTL_MS = 30_000
const SETTING_PREFIX = "setting:"

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

const ALL_SETTINGS_KEY = SETTING_PREFIX + "__all__"

exports.getSettings = async () => {
  const cached = await cache.get(ALL_SETTINGS_KEY)
  if (cached) return cached

  return singleFlight(ALL_SETTINGS_KEY, async () => {
    const afterWait = await cache.get(ALL_SETTINGS_KEY)
    if (afterWait) return afterWait

    const rows = await Setting.findAll()

    const settings = {}
    rows.forEach((row) => {
      settings[row.key] = deserialize(row.value)
    })

    await cache.set(ALL_SETTINGS_KEY, settings, SETTING_TTL_MS)
    return settings
  })
}

exports.getSetting = async (key) => {
  const cacheKey = SETTING_PREFIX + key

  const cached = await cache.get(cacheKey)
  if (cached !== undefined) return cached

  return singleFlight(cacheKey, async () => {
    // Double-check: mungkin request lain sudah mengisi cache sambil
    // menunggu promise ini.
    const afterWait = await cache.get(cacheKey)
    if (afterWait !== undefined) return afterWait

    const row = await Setting.findOne({ where: { key } })
    const value = row ? deserialize(row.value) : null
    await cache.set(cacheKey, value, SETTING_TTL_MS)
    return value
  })
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

  // Segera hapus cache supaya perubahan maintenanceMode / maxUploadSize
  // langsung berlaku, tidak menunggu TTL 30 detik habis.
  await cache.delPrefix(SETTING_PREFIX)

  return exports.getSettings()
}
