const Redis = require("ioredis")
const logger = require("../utils/logger")

let client = null
let healthy = false
let lastHealthCheck = 0
const HEALTH_WINDOW = 10_000

function isEnabled() {
  return process.env.NODE_ENV !== "test" && Boolean(process.env.REDIS_URL)
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

  try {
    const pong = await redis.ping()
    healthy = pong === "PONG"
  } catch (err) {
    healthy = false
  }

  return healthy
}

module.exports = { getRedis, isRedisReady }