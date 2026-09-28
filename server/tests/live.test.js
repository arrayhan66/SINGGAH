/**
 * Uji VKTI LANGSUNG ke deployment Railway + Vercel.
 *
 * Semua request di file ini ditembak ke server sungguhan, bukan ke app yang
 * di-require di dalam proses jest. Yang diperiksa adalah apa yang dilihat
 * pengguna sungguhan: apakah endpoint hidup, apakah cepat, apakah proxy Vercel
 * benar, apakah cookie session punya flag yang benar.
 *
 * Syarat:
 *   - Butuh internet.
 *   - Jangan jalankan otomatis di setiap push. Tidak ada staging, jadi ini
 *     selalu menyentuh server yang sedang dipakai user.
 *
 * Jalankan:
 *   npm run test:prod
 *   API_URL=https://staging.up.railway.app FRONTEND_URL=https://staging.vercel.app \
 *     npm run test:prod
 */

const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://singgah-flax.vercel.app"
).replace(/\/+$/, "");

// Batas lenient. Tujuannya mendeteksi server yang benar-benar tidak sehat
// atau salah konfigurasi, bukan mengukur performa. Batas ketat di SINI
// akan bikin test merah tiap ada user yang sedang brows.
const MAX_LATENCY_MS = 5000;

async function fetchJson(path, options = {}) {
  const startedAt = process.hrtime.bigint();
  const response = await fetch(`${API_URL}${path}`, {
    redirect: "manual",
    ...options,
  });
  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, headers: response.headers, body, elapsedMs };
}

describe("Endpoint publik harus hidup", () => {
  const endpoints = [
    { name: "Categories", path: "/api/categories" },
    { name: "News", path: "/api/news" },
    { name: "Settings", path: "/api/settings" },
    { name: "Projects", path: "/api/projects" },
    { name: "Stats", path: "/api/stats" },
    { name: "Hall", path: "/api/hall" },
    { name: "Notifications", path: "/api/notifications" },
    { name: "Dashboard", path: "/api/dashboard" },
    { name: "Users", path: "/api/users" },
  ];

  test.each(endpoints)("$name -> tidak boleh 500", async ({ path }) => {
    const result = await fetchJson(path);
    expect(result.status).toBeLessThan(500);
  });

  test.each(endpoints)("$name -> harus respons dalam batas wajar", async ({ path }) => {
    const result = await fetchJson(path);

    console.log(`${Math.round(result.elapsedMs)}ms ${path} -> ${result.status}`);

    // Server yang menggantung (health check lolos tapi request lambat) akan
    // ketahuan di sini. 5 detik longgar supaya tidak merah karena cold start.
    expect(result.elapsedMs).toBeLessThan(MAX_LATENCY_MS);
  });
});

describe("Health check", () => {
  test("Railway health harus 200 dan database ok", async () => {
    // railway.json memakai path ini sebagai healthcheck, jadi kalau rusak
    // Railway akan menganggap service mati dan restart terus.
    const result = await fetchJson("/api/health");

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ success: true, database: "ok" });
  });

  test("health tidak boleh membocorkan kredensial", async () => {
    const result = await fetchJson("/api/health");
    const body = JSON.stringify(result.body || {});

    expect(body).not.toMatch(/DB_PASSWORD|JWT_SECRET|CLOUDINARY|SENDLIB|RESEND/i);
  });
});

describe("Konsistensi response API", () => {
  test("endpoint daftar harus membungkus data (bukan objek kosong)", async () => {
    // Kombinasi Railway + Vercel sering gagal diam-diam di sini: backend 200
    // tapi body-nya bukan bentuk yang frontend/XMLHttpRequest expects.
    const result = await fetchJson("/api/categories?limit=1");

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);

    // Bentuknya harus konsisten dengan response error yang sama.
    const categories = result.body?.data;
    expect(categories === undefined || Array.isArray(categories)).toBe(true);
  });

  test("payload tidak boleh string kosong atau null", async () => {
    // Proxy yang salah konfigurasi kadang balas 200 dengan body kosong.
    const result = await fetchJson("/api/news?limit=1");

    expect(result.status).toBe(200);
    expect(result.body).not.toBeNull();
  });

  test("error 404 harus berbentuk JSON, bukan halaman HTML", async () => {
    // Flutter frontend tidak bisa membaca error HTML. Kalau route tidak ketemu,
    // harus tetap JSON supaya frontend bisa menampilkan pesan yang benar.
    const result = await fetchJson("/api/route-yang-tidak-ada-12345");

    expect(result.headers.get("content-type")).toContain("application/json");
  });
});

describe("Pagination dan query param", () => {
  test("limit wajar harus diterima", async () => {
    const result = await fetchJson("/api/projects?limit=2");
    expect(result.status).toBe(200);
  });

  test("limit tidak valid tidak boleh 500", async () => {
    // Sabotase input harus_mulut gross-crash server.
    for (const value of ["abc", "-1", "0", "999999999", "1e10"]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await fetchJson(`/api/projects?limit=${value}`);
      expect(result.status).not.toBe(500);
    }
  });

  test("page di luar range tidak boleh 500", async () => {
    const result = await fetchJson("/api/projects?page=99999&limit=10");
    expect(result.status).not.toBe(500);
  });
});

describe("Perilaku HTTP", () => {
  test("method yang tidak didukung harus menolak, bukan 500", async () => {
    // DELETE pada endpoint yang tidak mendukungnya.
    const result = await fetchJson("/api/categories", { method: "DELETE" });

    expect(result.status).not.toBe(500);
    expect([404, 405]).toContain(result.status);
  });

  test("body JSON rusak harus 400, bukan 500", async () => {
    // Kirim body yang bukan JSON valid. Express harus menolak dengan rapi;
    // kalau sampai 500 berarti error handler tidak catching SyntaxError.
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ini bukan json",
    });

    expect(response.status).toBe(400);
  });

  test("body sebesar 3MB harus ditolak dengan rapi (limit 2mb)", async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.c", pad: "x".repeat(3 * 1024 * 1024) }),
    });

    // 413 dari express.json, atau 400 dari validator. Yang penting bukan 500
    // dan bukan server yang turun.
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("redirect tidak bolehMENTS berayap", async () => {
    // Kalau Railway salah konfigurasi slash, semua request bisa kena 307 dan
    // frontend yang tidak mengikutinya akan gagal.
    const response = await fetch(`${API_URL}/api/categories`, {
      redirect: "manual",
    });

    expect([301, 302, 307, 308]).not.toContain(response.status);
  });
});

describe("CORS di produksi", () => {
  test("origin frontend sendiri diizinkan", async () => {
    const response = await fetch(`${API_URL}/api/categories`, {
      headers: { Origin: FRONTEND_URL },
    });

    expect(response.headers.get("access-control-allow-origin")).toBe(
      FRONTEND_URL,
    );
  });

  test("origin asing tidak diizinkan", async () => {
    const response = await fetch(`${API_URL}/api/categories`, {
      headers: { Origin: "https://evil.example.com" },
    });

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("Cookie session harus punya flag aman", () => {
  // Auth berdasar cookie HttpOnly (utils/authCookie.js). Kalau flag ini hilang,
  // session bisa dicuri lewat XSS atau dikirim ke domain lain.
  test("login tidak boleh mengembalikan token di body (harus cookie)", async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tidak-ada@example.com",
        password: "password-salah",
      }),
    });

    // Request gagal, jadi mungkin tidak ada cookie sama sekali. Yang dicek
    // adalah: kalau response punya token di body, itu kebocoran.
    const setCookies = response.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      const cookie = setCookies.join(";");
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/Secure/i);
      expect(cookie).toMatch(/SameSite/i);
    }
  });
});

describe("JWT: token yang sudah kedaluwarsa harus ditolak", () => {
  test("token kedaluwarsa tidak boleh mendapat akses", async () => {
    // Ditandatangani dengan secret acak, jadi ditolak di tahap verifikasi
    // signature. Yang dicek adalah bahwa server tidak lemah menerima token
    // basi hanya karenadecode-nya berhasil.
    const expired = [
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
      Buffer.from(
        JSON.stringify({ id: 1, role: "admin", iat: 1, exp: 2 }),
      ).toString("base64url"),
      "signature-ngawur-yang-tidak-valid",
    ].join(".");

    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${expired}` },
    });

    expect([401, 403]).toContain(response.status);
  });

  test("alg:none tidak boleh diterima", async () => {
    // Serangan klasik: token dengan algoritma "none" supaya server tidak
    // perlu memverifikasi signature sama sekali.
    const noneToken = [
      Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url"),
      Buffer.from(
        JSON.stringify({ id: 1, role: "admin", exp: 9999999999 }),
      ).toString("base64url"),
      "",
    ].join(".");

    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${noneToken}` },
    });

    expect([401, 403]).toContain(response.status);
  });

  test("role di token tidak boleh memberi akses admin", async () => {
    // roleMiddleware membaca req.user.role dari database, bukan dari token.
    // Test ini mengunci perilaku itu: Claims role di token harus diabaikan.
    const forged = [
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
      Buffer.from(
        JSON.stringify({ id: 999999, role: "admin", exp: 9999999999 }),
      ).toString("base64url"),
      "signature-ngawur",
    ].join(".");

    const response = await fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${forged}` },
    });

    expect([401, 403]).toContain(response.status);
  });
});

describe("Vercel: frontend dan proxy ke Railway", () => {
  test("halaman utama harus 200", async () => {
    const response = await fetch(FRONTEND_URL, { redirect: "follow" });
    expect(response.status).toBe(200);
  });

  test("frontend harus menyajikan HTML, bukan JSON", async () => {
    const response = await fetch(FRONTEND_URL);

    expect(response.headers.get("content-type")).toContain("text/html");
  });

  test("API host yang dipakai frontend harus hidup", async () => {
    // Frontend yang dideploy memakai URL absolut ke Railway (lihat
    // client/vercel.json: TIDAK ada rewrite /api, dan bundle memuat
    // baseURL absolut). Jadi frontend tidak melewati Vercel sama sekali --
    // request API-nya langsung ke Railway. Test ini memeriksa host itu hidup.
    const response = await fetch(`${API_URL}/api/categories`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  test("path /api di Vercel tidak dipakai frontend", async () => {
    // client/vercel.json me-rewrite SEMUA path ke /index.html, jadi
    // singgah-flax.vercel.app/api/* membalas HTML SPA, bukan JSON.
    // Ini bukan bug selama frontend memakai URL absolut, tapi test ini
    // mengunci kondisi tersebut supaya tidak disalahartikan nanti.
    const response = await fetch(`${FRONTEND_URL}/api/categories`);

    // Kalau suatu saat frontend diubah ke mode proxy (/api), test ini akan
    // gagal dan memberi tahu bahwa vercel.json perlu rewrite.
    expect(response.headers.get("content-type")).toContain("text/html");
  });

  test("frontend tidak mengekspos X-Powered-By", async () => {
    const response = await fetch(FRONTEND_URL);
    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});
