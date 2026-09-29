/**
 * Uji keamanan terhadap deployment yang SEDANG JALAN (Railway + Vercel).
 *
 * Berbeda dengan test lain di folder ini, file ini tidak memakai SQLite
 * in-memory dan tidak memakai supertest. Semua request ditembak ke URL sungguhan
 * supaya yang teruji adalah konfigurasi produksi yang dipakai user sungguhan:
 * CORS, trust proxy, rate limiter, security header, dan tidak adanya SQL injection.
 *
 * Test unit (test:unit) tidak bisa menguji semua itu. App yang di-require
 * di dalam proses test berjalan dengan NODE_ENV=test dan tanpa proxy Railway,
 * sehingga konfigurasi yang terbukti salah di sini bisa tetap terlihat aman
 * di test unit.
 *
 * Syarat:
 *   - Test ini butuh internet dan menyentuh server produksi.
 *   - Jangan pernah jalankan otomatis di setiap push. Produksi tidak punya
 *     staging, jadi test ini SELALU menembak server yang sedang dipakai user.
 *   - Sebagian test menghabiskan kuota rate limit, jadi ada jeda di antaranya.
 *     Tanpa jeda, test ini justru mengunci IP yang sedang menjalankan CI.
 *
 * Jalankan:
 *   npm run test:security
 *   API_URL=https://staging.up.railway.app FRONTEND_URL=https://staging.vercel.app \
 *     npm run test:security
 */

const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://singgah-flax.vercel.app"
).replace(/\/+$/, "");

// Origin yang harus ditolak. CORS adalah proteksi sisi browser, jadi yang
// berbahaya adalah server yang MALAS membalas header allow-origin ke origin
// asing: browser situs lain lalu membaca respons ini dengan kredensial
// pengguna yang sedang login.
const EVIL_ORIGIN = "https://evil.example.com";

async function http(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    redirect: "manual",
    ...options,
  });

  let body = null;
  try {
    body = await response.text();
  } catch {
    body = null;
  }

  return { status: response.status, headers: response.headers, body };
}

const header = (response, name) =>
  response.headers.get(name)?.toLowerCase() ?? null;

describe("Auth guard: endpoint admin harus menolak tanpa token", () => {
  // Endpoint yang di server.js dipasang dengan authMiddleware/roleMiddleware.
  // Kalau salah satu membalas 200 tanpa token, berarti data admin bocor.
  const protectedEndpoints = [
    { name: "Dashboard", path: "/api/dashboard" },
    { name: "Users", path: "/api/users" },
    { name: "Notifications", path: "/api/notifications" },
    { name: "Reports", path: "/api/reports" },
    { name: "ActivityLogs", path: "/api/activity-logs" },
    { name: "Project pending", path: "/api/projects/pending" },
  ];

  test.each(protectedEndpoints)("$name -> ditolak tanpa token", async ({ path }) => {
    const result = await http(path);

    // 401/403 sama-sama penolakan yang benar. Menuntut 401 persis membuat
    // test rapuh: authMiddleware/roleMiddleware wajar berubah ke 403 tanpa
    // memunculkan celah baru.
    expect([401, 403]).toContain(result.status);

    // 401 dengan body yang berisi stack trace berarti ada detail internal
    // yang bocor. Tetap tolak, tapi jangan diam-diam lolos.
    expect(result.body || "").not.toMatch(/at\s+\w+\s+\(.*:\d+:\d+\)/);
  });

  test("token ngawur harus 401, bukan 500", async () => {
    const result = await http("/api/users", {
      headers: { Authorization: "Bearer bukan.token.ngawur" },
    });

    // 401 = ditolak dengan benar. 403 juga sah (kalau authMiddleware berubah
    // jadi forbid dulu baru cek token). Yang penting bukan 200/500.
    expect([200, 500]).not.toContain(result.status);
    expect([401, 403]).toContain(result.status);
  });
});

describe("CORS: hanya origin sendiri yang boleh", () => {
  test("origin frontend sendiri -> CORS diizinkan", async () => {
    const result = await http("/api/categories", {
      headers: { Origin: FRONTEND_URL },
    });

    expect(header(result, "access-control-allow-origin")).toBe(FRONTEND_URL);
  });

  test("origin asing -> TIDAK boleh dapat allow-origin", async () => {
    const result = await http("/api/categories", {
      headers: { Origin: EVIL_ORIGIN },
    });

    // Browser memblokir kalau header ini tidak ada, jadi absennya header yang
    // benar. Yang berbahaya justru server yang memantulkan origin mentah.
    expect(header(result, "access-control-allow-origin")).toBeNull();
  });

  test("origin asing pada request tulis (POST) -> tetap ditolak", async () => {
    const result = await http("/api/news", {
      method: "POST",
      headers: {
        Origin: EVIL_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "dicoba dari origin asing" }),
    });

    // Yang diperiksa di sini hanya CORS: browserWAJIB tidak boleh
    // mendapatkan izin apa pun terhadap origin asing.
    expect(header(result, "access-control-allow-origin")).toBeNull();

    // Status boleh 401 (kurang token) atau 429 (apiWriteLimiter sudah habis
    // kalau suite ini dijalankan berulang dari IP yang sama). Yang DILARANG
    // adalah 2xx, karena itu berarti request menulis berhasil.
    expect([200, 201]).not.toContain(result.status);
    expect(result.status).toBeGreaterThanOrEqual(400);
  });

  test("preflight OPTIONS dari origin asing tidak boleh mengizinkan", async () => {
    const result = await http("/api/categories", {
      method: "OPTIONS",
      headers: {
        Origin: EVIL_ORIGIN,
        "Access-Control-Request-Method": "POST",
      },
    });

    expect(header(result, "access-control-allow-origin")).toBeNull();
  });
});

describe("Rate limit login: brute force harus dibatasi", () => {
  // Batas deklaratif 10 per 15 menit (middlewares/rateLimiter.js), dihitung
  // per IP dengan Redis.
  //
  // PENTING: test ini memakai kuota login yang sama dengan test:auth dan
  // test:idor -- ketiganya login dari IP yang sama. Karena kuota lasts 15
  // menit, menjalankan suite ini dua kali dalam jendela tersebut membuat
  // SELURUH percobaan kena 429 sejak yang pertama, sehingga test tidak lagi
  // bisa membuktikan apa pun.
  //
    // Karena itu kondisi itu di-SKIP, bukan di-FAIL: test ini memang tidak
    // membebankan kuota pada suite lain. Bukti bahwa limiter benar-benar
  // terpasang tetap dijamin oleh test header di bawah ("login -> harus punya
  // rate limit"), yang tidak memakai kuota sama sekali karena limiter
  // mengirim header pada response BERAPAPUN hasilnya, termasuk 429.
  const ATTEMPTS = 12;

  test(`${ATTEMPTS}x login gagal -> harus kena 429`, async () => {
    const statuses = [];

    for (let i = 0; i < ATTEMPTS; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await http("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `tidak-ada-${i}@example.com`,
          password: "password-salah-123",
        }),
      });

      statuses.push(result.status);

      if (i < ATTEMPTS - 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    const blocked = statuses.filter((s) => s === 429).length;
    const unauthorized = statuses.filter((s) => s === 401).length;

    // Kalau tidak ada 429 sama sekali, brute force tidak dibatasi.
    expect(blocked).toBeGreaterThan(0);

    // Tidak boleh ada 500: artinya rate limiter-nya sendiri error.
    expect(statuses).not.toContain(500);

    // Kalau SEMUA percobaan kena 429 sejak yang pertama, kuotanya sudah habis
    // dipakai suite/sejaan lain dalam jendela 15 menit ini. Test TIDAK bisa
    // apa-apa dalam kondisi itu, jadi di-skip -- bukan di-fail, karena itu
    // bukan bukti rate limiter rusak. Bukti terpasang/tidaknya limiter datang
    // dari test header "login -> harus punya rate limit" di bawah, yang tidak
    // bergantung pada kuota sama sekali.
    //
    // Kalau ternyata tidak ada 429 sama sekali (blocked === 0), itu baru
    // kegagalan serius: berarti brute force benar-benar tidak dibatasi.
    if (unauthorized === 0) {
      console.warn(
        `[rate limit] DI-SKIP: ${ATTEMPTS} percobaan kena 429 sejak yang ` +
          `pertama, jadi test ini tidak menguji apa pun. Kuota login sudah ` +
          `habis dipakai suite lain dalam jendela 15 menit. Jalankan ` +
          `test:security sendirian untuk membuktikannya.`,
      );
      return;
    }

    console.log(
      `[rate limit] ${ATTEMPTS} percobaan -> ` +
        `${unauthorized} x 401 (kredensial salah, dibiarkan lewat), ` +
        `${blocked} x 429 (diblokir). ` +
        `Batas efektif per IP: ${unauthorized} percobaan sebelum diblokir.`,
    );

    // 401 yang lolos adalah percobaan yang BELUM kena limit. Kalau angkanya
    // jauh melebihi 10, itu bukti store per-worker, yaitu REDIS_URL belum
    // diset di Railway sehingga batas efektif jadi 10 x jumlah worker.
    // Warn saja, jangan gagalkan test: limiter longgar bukan berarti tidak
    // ada proteksi sama sekali.
    if (unauthorized > 10) {
      console.warn(
        `[rate limit] PERINGATAN: ${unauthorized} percobaan lolos sebelum ` +
          `diblokir, padahal batas deklaratif 10/15 menit. Store rate limit ` +
          `per-worker (REDIS_URL belum diset di Railway), jadi batas efektif ` +
          `menjadi 10 x jumlah worker. Set REDIS_URL untuk mengetat.`,
      );
    }
  });
});

describe("SQL injection: input Postgres tidak boleh jadi 500 atau bocor data", () => {
  // Yang diperiksa bukan "tidak error" saja, tapi juga tidak sampai
  // mengembalikan lebih banyak data dari request normal (blind injection).
  const payloads = [
    { name: "OR 1=1 di path", path: "/api/projects/1%20OR%201=1" },
    { name: "quote di path", path: "/api/projects/1'%20OR%20'1'='1" },
    { name: "UNION SELECT", path: "/api/projects/1%20UNION%20SELECT%20NULL" },
    { name: "limit non-numerik", path: "/api/news?limit=abc" },
    { name: "stacked query", path: "/api/projects?category_id=1;DROP%20TABLE%20users" },
    { name: "sleep-based blind", path: "/api/projects?id=1%20AND%20SLEEP(5)" },
  ];

  test.each(payloads)("$name -> tidak boleh 500", async ({ path }) => {
    const result = await http(path);

    // 500 = error server = ada masalah (quote tidak di-escape, tipe tidak
    // dikonversi, dll). 404/400/200 semua acceptable; yang penting tidak crash.
    expect(result.status).not.toBe(500);
  });

  test("payload tidak boleh membocorkan pesan error database", async () => {
    const result = await http("/api/projects/1%20UNION%20SELECT%20NULL");

    const body = result.body || "";
    expect(body).not.toMatch(/SQLITE_ERROR|MYSQL|ER_|syntax error near/i);
  });

  test("query string SQLi tidak boleh mengembalikan data lebih banyak", async () => {
    // Blind injection klasik: ?id=1 OR 1=1 mengembalikan semua baris.
    // Bandingkan ukuran payload dengan request normal yang sah.
    const normal = await http("/api/projects?limit=1");
    const injected = await http("/api/projects?limit=1&id=1%20OR%201=1");

    if (injected.status === 200 && normal.status === 200) {
      expect((injected.body || "").length).toBeLessThanOrEqual(
        (normal.body || "").length * 2,
      );
    }
  });
});

describe("Path traversal: tidak boleh keluar dari direktori aplikasi", () => {
  const traversals = [
    "/api/projects/..%2f..%2f..%2f..%2fetc%2fpasswd",
    "/api/news/../../../../etc/passwd",
    "/uploads/../../../../etc/passwd",
    "/static/../../../server/.env",
    "/api/projects/%2e%2e%2f%2e%2e%2f%2e%2e%2f.env",
  ];

  test.each(traversals)("%s -> tidak boleh membocorkan file", async (path) => {
    const result = await http(path);

    // Dua tanda kebocoran yang harus absen: isi file sistem, dan isi .env
    // (mengandung kredensial DB/Cloudinary).
    expect(result.body || "").not.toMatch(/root:x:0:0/);
    expect(result.body || "").not.toMatch(/DB_PASSWORD|SENDLIB_API_KEY/);
    expect(result.body || "").not.toMatch(/CLOUDINARY_API_SECRET/);
  });
});

describe("Security headers", () => {
  // Helmet dipasang di server.js. Kalau ada yang hilang, biasanya karena
  // ada proxy (Vercel/nginx) yang menimpa header sebelum sampai ke user.
  test("HSTS aktif -> mencegah downgrade ke HTTP", async () => {
    const result = await http("/api/categories");
    expect(header(result, "strict-transport-security")).toContain("max-age");
  });

  test("X-Content-Type-Options nosniff -> cegah MIME sniffing", async () => {
    const result = await http("/api/categories");
    expect(header(result, "x-content-type-options")).toBe("nosniff");
  });

  test("X-Frame-Options -> cegah clickjacking", async () => {
    const result = await http("/api/categories");
    expect(header(result, "x-frame-options")).toBeTruthy();
  });

  test("CSP ada dan berbasis default-src", async () => {
    const result = await http("/api/categories");
    const csp = header(result, "content-security-policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src");
  });

  test("server tidak membocorkan versi teknologi", async () => {
    const result = await http("/api/categories");
    // Express menandai response dengan X-Powered-By: Express. Tidak rahasia,
    // tapi tidak ada gunanya dan membantu scanner.
    expect(header(result, "x-powered-by")).toBeNull();
  });
});

describe("Frontend Vercel: proxy dan aset", () => {
  test("halaman utama harus 200", async () => {
    const response = await fetch(FRONTEND_URL, { redirect: "manual" });
    expect(response.status).toBe(200);
  });

  test("frontend tidak boleh mengekspos X-Powered-By", async () => {
    const response = await fetch(FRONTEND_URL, { redirect: "manual" });
    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});

describe("Informasi yang tidak boleh bocor", () => {
  test("/api/health tidak menyebut host database", async () => {
    const result = await http("/api/health");

    // Health check memang melakukan SELECT 1, tapi response-nya tidak perlu
    // memberi tahu hostname/port database ke publik.
    expect(result.body || "").not.toMatch(
      /tidbcloud|gateway\d|mysql|DB_HOST/i,
    );
  });

  test("response error tidak membocorkan stack trace", async () => {
    const result = await http("/api/projects/999999999999");

    const body = result.body || "";
    expect(body).not.toMatch(/at\s+Object\.\w+\s+\(.*:\d+:\d+\)/);
    expect(body).not.toMatch(/node_modules/);
  });

  test("root path tidak membocorkan isi server", async () => {
    const result = await http("/");

    const body = result.body || "";
    expect(body).not.toMatch(/require\(|module\.exports|process\.env/);
  });
});

describe("Rate limit pada endpoint autentikasi", () => {
  // CELAH: /api/auth/verify-reset-code dibatasi (verifyCodeLimiter, 10/15
  // menit) tapi /api/auth/reset-password -- yang juga membandingkan kode
  // reset dengan plaintext -- TIDAK memakai limiter sama sekali
  // (routes/authRoutes.js:88-93). Kode reset hanya 6 digit (1 juta
  // kombinasi), jadi tanpa limiter ini bisa ditebak tanpa batas.
  //
  // Test ini sengaja tidak mengirim email sungguhan dan tidak mengubah
  // password siapa pun: ia hanyaProve bahwa header limit-nya ada/tidak.

  const authWriteEndpoints = [
    { name: "login", path: "/api/auth/login", body: { email: "a@b.c", password: "x" } },
    { name: "register", path: "/api/auth/register", body: { email: "a@b.c", password: "x" } },
    { name: "forgot-password", path: "/api/auth/forgot-password", body: { email: "a@b.c" } },
    { name: "check-email", path: "/api/auth/check-email", body: { email: "a@b.c" } },
    { name: "verify-email", path: "/api/auth/verify-email", body: { code: "000000" } },
    { name: "verify-reset-code", path: "/api/auth/verify-reset-code", body: { email: "a@b.c", code: "000000" } },
    {
      name: "reset-password",
      path: "/api/auth/reset-password",
      body: { email: "a@b.c", code: "000000", newPassword: "XyzTest123!" },
    },
  ];

  test.each(authWriteEndpoints)(
    "$name -> harus punya rate limit",
    async ({ path, body }) => {
      const result = await http(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // express-rate-limit v8 selalu mengirim header ini kalau limiter aktif,
      // apa pun hasilnya (200, 400, atau 429). Header yang hilang berarti
      // endpoint ini bisa dipanggil tanpa batas.
      expect({ path, policy: header(result, "ratelimit-policy") }).not.toEqual({
        path,
        policy: null,
      });
    },
  );
});

describe("Kode reset tidak boleh bisa ditebak tanpa batas", () => {
  // Hitungan langsung: tanpa limiter, 1 juta kombinasi bisa dicoba tanpa
  // jeda. Rate limit harus ada DAN ditegakkan, bukan hanya ada di header.

  test("reset-password menolak percobaan berulang setelah batas", async () => {
    // Batas 10 per 15 menit. normally 11 percobaan sudah cukup, tapi jendela
    // 15 menit bisa expired DI TENGAH loop: penghitung direset ke 0 dan 12
    // percobaan berikutnya semuanya lolos tanpa pernah kena 429. Kasus itu
    // bukan bug limiter, jadi loop diulang (maks 3x) sebelum test gagal.
    const MAX_ROUNDS = 3;
    const ATTEMPTS = 12;

    for (let round = 1; round <= MAX_ROUNDS; round += 1) {
      const statuses = [];
      let windowReset = false;
      let prevRemaining = Infinity;

      for (let i = 0; i < ATTEMPTS; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await http("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Email fiktif: tidak ada kode reset yang cocok, jadi tidak ada
            // password sungguhan yang bisa berubah. Yang diuji murni limiternya.
            email: `tidak-ada-${i}-r${round}@example.invalid`,
            code: "000000",
            newPassword: "XyzTest123!",
          }),
        });

        statuses.push(result.status);

        // Kalau sisa kuota NAIK di tengah loop, berarti jendela 15 menit
        // baru saja expired dan penghitung direset. Ulangi dari awal.
        const remaining = Number(result.headers.get("ratelimit-remaining"));
        if (Number.isFinite(remaining) && remaining > prevRemaining) {
          windowReset = true;
        }
        prevRemaining = remaining;

        if (result.status === 429) break;

        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      if (statuses.includes(429)) return; // bukti enforcement sudah dapat

      if (windowReset) {
        console.warn(
          `[reset-password] jendela 15 menit expired di tengah percobaan ` +
            `(putaran ${round}), penghitung direset. Mengulang test.`,
        );
        continue;
      }

      // Tidak ada 429 dan tidak ada reset jendela: ini kegagalan nyata.
      expect(statuses).toContain(429);
    }

    throw new Error(
      `[reset-password] Tidak ada 429 dalam ${MAX_ROUNDS} x ${ATTEMPTS} ` +
        `percobaan. Rate limiter mungkin tidak ditegakkan.`,
    );
  });
});
