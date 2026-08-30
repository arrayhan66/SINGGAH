const rateLimit = require("express-rate-limit")
const { RedisStore } = require("rate-limit-redis")
const { getRedis, isRedisReady } = require("../config/redis")

// Dipakai untuk E2E / lingkungan non-produksi agar percobaan login berulang
// dari satu IP tidak kena 429. Default: aktif (dilindungi).
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true"

// Fallback store dalam memori, menggunakan interface MODERN express-rate-limit
// v8 (increment/decrement/resetKey). Store dengan method `incr` justru
// ditafsirkan sebagai interface legacy callback-style dan akan hang.
function createMemoryStore() {
  const hits = new Map()
  const resetMs = 60 * 1000

  return {
    async increment(key) {
      const now = Date.now()
      const current = hits.get(key)

      if (!current || now > current.expiresAt) {
        hits.set(key, { count: 1, expiresAt: now + resetMs })
        return { totalHits: 1, resetTime: new Date(now + resetMs) }
      }

      current.count += 1
      return { totalHits: current.count, resetTime: new Date(current.expiresAt) }
    },
    async decrement(key) {
      const current = hits.get(key)
      if (current) current.count = Math.max(0, current.count - 1)
    },
    async resetKey(key) {
      hits.delete(key)
    },
  }
}

// Store rate limit: Redis bila tersedia, fallback memori bila Redis
// mati/tidak dikonfigurasi. Prefix disimpan lewat RedisStore option `prefix`
// agar tidak bentrok antar limiter.
function createStore(limiterName) {
  const memoryStore = createMemoryStore()
  let redisStore = null

  if (process.env.NODE_ENV !== "test" && process.env.REDIS_URL) {
    const redis = getRedis()
    if (redis) {
      redisStore = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: `rl:${limiterName}:`,
      })
    }
  }

  return {
    init(options) {
      if (redisStore) {
        const fn = redisStore.init?.bind(redisStore)
        return fn ? fn(options) : undefined
      }
    },
    async increment(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.increment(key)
        } catch (err) {
          // redis baru saja down → fallback memori
        }
      }
      return memoryStore.increment(key)
    },
    async decrement(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.decrement(key)
        } catch (err) {
          // lanjut ke memori
        }
      }
      return memoryStore.decrement(key)
    },
    async resetKey(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.resetKey(key)
        } catch (err) {
          // lanjut ke memori
        }
      }
      return memoryStore.resetKey(key)
    },
  }
}

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("login"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
})

exports.verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("verify-code"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan verifikasi. Coba lagi dalam 15 menit.",
  },
})

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("register"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
  },
})

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("forgot-password"),
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan reset password. Coba lagi dalam 15 menit.",
  },
})

exports.resendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("resend-code"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan kode. Coba lagi dalam 15 menit.",
  },
})