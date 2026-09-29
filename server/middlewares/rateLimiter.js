// Store memori bersifat PER-PROCESS. Kalau aplikasi berjalan sebagai >1 worker
// PM2 (cluster mode) tanpa Redis, tiap worker punya hitungan sendiri sehingga
// batas efektif menjadi `max x jumlahWorker` (batas login 5 jadi 15).
// Pelonggaran itu tidak disengaja dan sebelumnya tidak terlihat dari log.
//
// Catatan penting soal "bagi batas dengan jumlah worker": itu terdengar seperti
// tightening yang aman, tapi untuk batas kecil (login max 5 di 3 worker -> 1 per
// worker) justru mengunci user sah yang salah ketik 2x, karena request-nya
// berputar antar worker. Trade-off-nya lebih buruk daripada batas yang agak
// longgar. Jadi TIDAK dibagi secara default. Set RATE_LIMIT_SHARED_MAX=true
// hanya kalau memang memilih tightening itu secara sadar.
const isClustered = () => process.env.NODE_APP_INSTANCE !== undefined;

function workerCount() {
  const n = parseInt(process.env.PM2_INSTANCES, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function redisConfigured() {
  return Boolean(process.env.REDIS_URL);
}

// Batas yang benar-benar ditegakkan. Tanpa Redis di mode cluster, angka asli
// tidak bisa dipertahankan secara akurat lintas worker.
function effectiveMax(max) {
  if (!isClustered() || redisConfigured()) return max;
  if (process.env.RATE_LIMIT_SHARED_MAX !== "true") return max;
  const workers = workerCount();
  if (!workers || workers <= 1) return max;
  return Math.max(1, Math.floor(max / workers));
}

function warnLooseLimitOnce() {
  if (!isClustered() || redisConfigured()) return;
  if (process.env.NODE_ENV === "test") return;
  if (warnLooseLimitOnce.done) return;
  warnLooseLimitOnce.done = true;

  const workers = workerCount();
  const detail = workers
    ? `PM2_INSTANCES=${workers}`
    : "PM2_INSTANCES belum diset, jumlah worker tidak diketahui";

  console.warn(
    `[rateLimiter] PERINGATAN: berjalan multi-worker PM2 tanpa Redis. ` +
      `Rate limit memakai store memori per-process, jadi batas efektifnya ` +
      `longgar sesuai jumlah worker (${detail}). Batas TIDAK dibagi otomatis. ` +
      `Perbaikan: set REDIS_URL, atau jalankan PM2 dengan 1 instance.`,
  );
}

const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { getRedis, isRedisReady } = require("../config/redis");

// Dipakai untuk E2E / lingkungan non-produksi agar percobaan login berulang
// dari satu IP tidak kena 429. Default: aktif (dilindungi).
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true";

// Fallback store dalam memori, menggunakan interface MODERN express-rate-limit
// v8 (increment/decrement/resetKey). Store dengan method `incr` justru
// ditafsirkan sebagai interface legacy callback-style dan akan hang.
//
// PENTING: jendela waktu harus mengikuti `windowMs` yang dideklarasikan tiap
// limiter. Versi sebelumnya memaksa 60 detik (`resetMs = 60 * 1000`) dan
// mengabaikan windowMs, sehingga kalau Redis mati semua limiter jadi jauh lebih
// longgar dari yang dimaksud — batas login 5/15 menit efektif jadi 5/1 menit
// (300 per jam, bukan 20). express-rate-limit v8 menaruh logika jendela di
// dalam store, jadi store inilah yang harus memegang windowMs yang benar.
const DEFAULT_WINDOW_MS = 60 * 1000;

function createMemoryStore() {
  const hits = new Map();
  let windowMs = DEFAULT_WINDOW_MS;

  return {
    // Dipanggil express-rate-limit lewat wrapper init() di createStore.
    // Prioritaskan windowMs dari limiter; abaikan nilai tak masuk akal
    // (0/NaN) supaya tidak pernah jadi 0 yang membuat semua request di-429.
    init(options) {
      const declared = Number(options?.windowMs);
      windowMs = Number.isFinite(declared) && declared > 0
        ? declared
        : DEFAULT_WINDOW_MS;
    },

    async increment(key) {
      const now = Date.now();
      const current = hits.get(key);

      if (!current || now > current.expiresAt) {
        hits.set(key, { count: 1, expiresAt: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      }

      current.count += 1;
      return {
        totalHits: current.count,
        resetTime: new Date(current.expiresAt),
      };
    },
    async decrement(key) {
      const current = hits.get(key);
      if (current) current.count = Math.max(0, current.count - 1);
    },
    async resetKey(key) {
      hits.delete(key);
    },
  };
}

function createStore(limiterName) {
  warnLooseLimitOnce();
  const memoryStore = createMemoryStore();
  let redisStore = null;

  if (process.env.NODE_ENV !== "test" && process.env.REDIS_URL) {
    const redis = getRedis();
    if (redis) {
      redisStore = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: `rl:${limiterName}:`,
      });
    }
  }

  return {
    async init(options) {
      // Selalu beri tahu memoryStore nilai windowMs, TERLEPAS apakah Redis
      // hidup atau tidak. Jalur ini yang membuat jendela fallback memori sama
      // dengan yang dideklarasikan limiter, bukandefault 60 detik.
      memoryStore.init(options);

      if (redisStore && (await isRedisReady())) {
        const fn = redisStore.init?.bind(redisStore);
        return fn ? fn(options) : undefined;
      }
    },
    async increment(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.increment(key);
        } catch (err) {
          // redis baru saja down → fallback memori
        }
      }
      return memoryStore.increment(key);
    },
    async decrement(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.decrement(key);
        } catch (err) {
          // lanjut ke memori
        }
      }
      return memoryStore.decrement(key);
    },
    async resetKey(key) {
      if (redisStore) {
        try {
          if (await isRedisReady()) return await redisStore.resetKey(key);
        } catch (err) {
          // lanjut ke memori
        }
      }
      return memoryStore.resetKey(key);
    },
  };
}

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: effectiveMax(10),
  standardHeaders: true,
  legacyHeaders: false,
  // Hanya percobaan GAGAL yang dihitung. Tanpa ini login yang berhasil ikut
  // memakai jatah, jadi user yang loginya benar tetap terkunci 429 setelah
  // beberapa kali masuk — apalagi kalau banyak orang devs lewat IP/proxy yang
  // sama di jaringan lokal. Batas tetap ada untuk menahan brute force.
  skipSuccessfulRequests: true,
  skip: () => isRateLimitDisabled,
  store: createStore("login"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
});

exports.verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: effectiveMax(10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("verify-code"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan verifikasi. Coba lagi dalam 15 menit.",
  },
});

// Limiter untuk /reset-password.
//
// Endpoint ini membandingkan kode reset dengan plaintext secara langsung
// (services/authService.js:731+), persis seperti /verify-reset-code. Sebelumnya
// keduanya tidak punya limiter di sini, padahal /verify-reset-code sudah
// dilindungi verifyCodeLimiter -- jadi proteksinya hanya ilusi. Kode reset
// hanya 6 digit (utils/generateCode.js), jadi hanya ada 1 juta kombinasi.
// Dengan batas 10/15 menit, menebak semua butuh sekitar 17 hari; tanpa batas,
// penyerang bisa exhausting dalam hitungan jam.
//
// Batas dan jendela waktunya sama dengan verifyCodeLimiter secara sengaja:
// user yang salah ketik kode lalu memakai /reset-password tidak boleh ikut
// terkunci lebih cepat daripada yang dijanjikan oleh verifyCodeLimiter.
exports.resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: effectiveMax(10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  // Store terpisah dari "verify-code" supaya kuota /verify-reset-code tidak
  // dimakan oleh percobaan di endpoint ini (dan sebaliknya).
  store: createStore("reset-password"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan reset password. Coba lagi dalam 15 menit.",
  },
});

exports.checkEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: effectiveMax(30),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("check-email"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi dalam 10 menit.",
  },
});

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: effectiveMax(5),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("register"),
  message: {
    success: false,
    message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
  },
});

exports.googleLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: effectiveMax(10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("google"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi dalam 10 menit.",
  },
});

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: effectiveMax(3),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("forgot-password"),
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan reset password. Coba lagi dalam 15 menit.",
  },
});

exports.resendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: effectiveMax(3),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("resend-code"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan kode. Coba lagi dalam 15 menit.",
  },
});

// --- Limiter untuk endpoint tulis publik ---
// POST /api/projects/:id/view dan POST /api/stats/visit tidak butuh login dan
// sebelumnya tidak punya limiter sama sekali. Keduanya menulis ke database
// (3-4 query per panggilan), jadi bot atau reload berkali-kali bisa menghabiskan
// seluruh connection pool sebelum request asli pengguna dilayani.

exports.viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: effectiveMax(30),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("project-view"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi sebentar.",
  },
});

exports.visitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: effectiveMax(10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled,
  store: createStore("site-visit"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi sebentar.",
  },
});

// Cadangan untuk setiap POST/PUT/PATCH/DELETE di /api yang tidak punya
// limiter sendiri. Dipasang SEBELUM router di server.js, jadi path yang sudah
// punya limiter khusus (auth, project view, site visit) harus dilewati di
// sana — kalau tidak, satu request terhitung dua kali dan v8 melempar
// ERR_ERL_DOUBLE_COUNT.
exports.apiWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: effectiveMax(60),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isRateLimitDisabled || process.env.NODE_ENV === "test",
  store: createStore("api-write"),
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi sebentar.",
  },
});
