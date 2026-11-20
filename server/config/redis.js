const Redis = require("ioredis")
const logger = require("../utils/logger")

let client = null
let healthy = false
let lastHealthCheck = 0
let nextRetryAt = 0
const HEALTH_WINDOW = 10_000

// Kalau Redis sedang flapping (log produksi pernah menunjukkan ECONNRESET,
// ENOTFOUND, lalu ETIMEDOUT berulang), setiap cache.get bisa menghabiskan
// beberapa detik hanya untuk menunggu klien baru "ready". Karena getNews dan
// getProjects memanggil cache beberapa kali per request, delay ini menjalar
// sampai request diakhiri 503 oleh proxy. Setelah gagal, beri jeda sebelum
// mencoba lagi dan langsung pakai fallback memori selama jeda itu.
const FAILURE_COOLDOWN = parseInt(process.env.REDIS_FAILURE_COOLDOWN_MS, 10) || 30_000
const MAX_READY_WAIT = 1_500

function isEnabled() {
  return process.env.NODE_ENV !== "test" && Boolean(process.env.REDIS_URL)
}

function destroyClient() {
  if (client) {
    try {
      client.disconnect()
    } catch (err) {
      // abaikan
    }
    client = null
  }
  healthy = false
}

function getRedis() {
  if (!isEnabled()) return null
  if (client) return client

  try {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      retryStrategy: (times) => (times >= 3 ? null : times * 1000),
    })

    client.on("error", (err) => {
      healthy = false
      logger.warn(`Redis error: ${err.message}`)
    })

    client.on("ready", () => {
      healthy = true
      logger.info("Redis connected")
    })

    client.on("end", () => {
      healthy = false
    })
  } catch (err) {
    logger.warn(`Redis init error: ${err.message}`)
    client = null
  }

  return client
}

async function isRedisReady() {
  if (!isEnabled()) return false

  const now = Date.now()
  if (now < nextRetryAt) return false
  if (now - lastHealthCheck < HEALTH_WINDOW) return healthy

  lastHealthCheck = now

  const redis = getRedis()
  if (!redis) {
    healthy = false
    nextRetryAt = Date.now() + FAILURE_COOLDOWN
    return false
  }

  // Klien baru butuh waktu beberapa saat sebelum siap melayani ping.
  // Tanpa ini, ping pertama bisa gagal dan merusak klien permanen
  // (enableOfflineQueue:false + maxRetriesPerRequest:1).
  if (redis.status !== "ready") {
    // Tunggu sampai klien benar-benar siap (polling status), bukan tidur
    // acak. Pada start pertama, klien bisa berada di fase connecting/reconnect
    // dan ping akan ditolak (enableOfflineQueue:false).
    const deadline = Date.now() + Math.min(redis.options.connectTimeout, MAX_READY_WAIT)
    while (redis.status !== "ready" && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  try {
    const pong = await redis.ping()
    healthy = pong === "PONG"
  } catch (err) {
    healthy = false
    logger.warn(`Redis health check failed: ${err.message}`)
  }

  if (!healthy) {
    // Ping yang gagal bisa meninggalkan klien dalam kondisi rusak;
    // buang klien ini agar dibuat ulang segar setelah masa jeda habis.
    destroyClient()
    nextRetryAt = Date.now() + FAILURE_COOLDOWN
  }

  return healthy
}

module.exports = { getRedis, isRedisReady }