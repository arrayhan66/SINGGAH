// Cache layer: Redis bila REDIS_URL tersedia & sehat, fallback ke memori bila
// Redis mati/offline. Dinonaktifkan saat mode test agar deterministik dan
// tidak mencemari antar test file.
const { getRedis, isRedisReady } = require("../config/redis")

const isTest = process.env.NODE_ENV === "test"

// In-memory fallback store
const store = new Map()

const NOOP = "Cache disabled in test mode"

const memoryGet = (key) => {
  const item = store.get(key)
  if (!item) return undefined

  if (Date.now() > item.expiresAt) {
    store.delete(key)
    return undefined
  }

  return item.value
}

const memorySet = (key, value, ttlMs) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

const memoryDel = (key) => store.delete(key)

const memoryDelPrefix = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

const redisDel = async (key) => {
  if (!(await isRedisReady())) return
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.del(key)
  } catch (err) {
    // fallback memori tetap sudah dibersihkan oleh pemanggil
  }
}

const redisDelPrefix = async (prefix) => {
  if (!(await isRedisReady())) return
  const redis = getRedis()
  if (!redis) return

  try {
    let cursor = "0"
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        `${prefix}*`,
        "COUNT",
        100,
      )
      cursor = nextCursor
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } while (cursor !== "0")
  } catch (err) {
    // fallback memori tetap sudah dibersihkan oleh pemanggil
  }
}

exports.get = async (key) => {
  if (isTest) return undefined

  if (await isRedisReady()) {
    const redis = getRedis()
    if (redis) {
      try {
        const raw = await redis.get(key)
        if (raw === null || raw === undefined) return undefined
        try {
          return JSON.parse(raw)
        } catch {
          return raw
        }
      } catch (err) {
        // lanjut ke memori
      }
    }
  }

  return memoryGet(key)
}

exports.set = async (key, value, ttlMs = 60000) => {
  if (isTest) return NOOP

  memorySet(key, value, ttlMs)

  if (await isRedisReady()) {
    const redis = getRedis()
    if (redis) {
      try {
        await redis.set(key, JSON.stringify(value), "PX", Math.max(1, ttlMs))
      } catch (err) {
        // redis baru saja down; memori sudah menjadi fallback
      }
    }
  }

  return value
}

exports.del = async (key) => {
  if (isTest) return NOOP

  memoryDel(key)
  await redisDel(key)
  return true
}

exports.delPrefix = async (prefix) => {
  if (isTest) return NOOP

  memoryDelPrefix(prefix)
  await redisDelPrefix(prefix)
  return true
}

exports.clear = () => {
  store.clear()
  return true
}