const Redis = require("ioredis")
const logger = require("../utils/logger")

let client = null
let healthy = false
let lastHealthCheck = 0
const HEALTH_WINDOW = 10_000
const CONNECT_GRACE_MS = 1000

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

  if (Date.now() - lastHealthCheck < HEALTH_WINDOW) return healthy

  lastHealthCheck = Date.now()

  const redis = getRedis()
  if (!redis) {
    healthy = false
    return false
  }

  // Klien baru butuh waktu beberapa saat sebelum siap melayani ping.
  // Tanpa ini, ping pertama bisa gagal dan merusak klien permanen
  // (enableOfflineQueue:false + maxRetriesPerRequest:1).
  if (redis.status !== "ready") {
    await new Promise((resolve) => setTimeout(resolve, CONNECT_GRACE_MS))
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
    // buang klien ini agar dibuat ulang segar pada panggilan berikutnya.
    destroyClient()
  }

  return healthy
}

module.exports = { getRedis, isRedisReady }