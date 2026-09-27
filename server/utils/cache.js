// Cache layer: Redis bila REDIS_URL tersedia & sehat, fallback ke memori bila
// Redis mati/offline. Dinonaktifkan saat mode test agar deterministik dan
// tidak mencemari antar test file.
//
// Pengecekan dilakukan saat panggil (bukan sekali saat modul dimuat) supaya
// test yang perlu menguji invalidasi cache bisa menyalakannya lewat
// CACHE_IN_TEST=true tanpa harus mocking modul ini. Mocking berisiko membuat
// models/User.js (yang memuat cache lebih dulu lewat tests/setup.js) dan
// middleware memegang objek berbeda, sehingga hook invalidasi tidak berlaku
// dan test justru berbohong.
const { getRedis, isRedisReady } = require("../config/redis")

const isTest = () =>
  process.env.NODE_ENV === "test" && process.env.CACHE_IN_TEST !== "true"

// In-memory fallback store.
// Dibatasi karena Map ini tidak pernah dibersihkan otomatis selain saat
// dibaca setelah kedaluwarsa. Dengan key yang berasal dari query string
// (mis. news:list:1:37, news:list:1:38, ...) jumlah key bisa tumbuh tanpa
// batas dan menghabiskan memori sampai OOM.
const MAX_MEMORY_ENTRIES = 500
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
  // Hapus dulu supaya key yang di-refresh kembali jadi yang paling baru.
  store.delete(key)
  store.set(key, { value, expiresAt: Date.now() + ttlMs })

  // Map mempertahankan urutan insert, jadi kunci pertama adalah yang paling
  // lama. Cukup untuk bounds; tidak perlu LRU penuh.
  while (store.size > MAX_MEMORY_ENTRIES) {
    const oldest = store.keys().next().value
    if (oldest === undefined) break
    store.delete(oldest)
  }

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
  if (isTest()) return undefined

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
  if (isTest()) return NOOP

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
  if (isTest()) return NOOP

  memoryDel(key)
  await redisDel(key)
  return true
}

exports.delPrefix = async (prefix) => {
  if (isTest()) return NOOP

  memoryDelPrefix(prefix)
  await redisDelPrefix(prefix)
  return true
}

exports.clear = () => {
  store.clear()
  return true
}