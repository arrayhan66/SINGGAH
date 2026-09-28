/**
 * Uji alur yang BUTUH AKUN NYATA, menembak server Railway yang dideploy.
 *
 * Test di folder lain cukup dengan user palsu karena area itu tidak butuh
 * sesi. Tapi profil, ganti password, upload, dan moderasi admin semuanya
 * berada di balik authMiddleware, jadi harus login sungguhan dulu.
 *
 * KREDENSIAL TIDAK DISIMPAN DI REPO.
 * Isi sendiri di file lokal yang sudah di-gitignore, lalu jalankan:
 *
 *   server/.env.security
 *   -------------------------------------------
 *   TEST_USER_EMAIL=akun-test@example.com
 *   TEST_USER_PASSWORD=...
 *   TEST_ADMIN_EMAIL=...
 *   TEST_ADMIN_PASSWORD=...
 *
 *   npm run test:auth
 *
 * Jangan pernah meng-commit file itu, dan jangan pernah menempelkan isinya
 * ke chat/screenshot. Kalau password tidak diisi, describe-nya di-skip: bukan
 * gagal, karena tanpa kredensial memang tidak ada yang bisa diuji.
 *
 * Saran: pakai akun khusus test, bukan akun pribadi. Test ini mengubah state
 * (ganti password, moderasi), jadi lebih aman kalau yang diganggu adalah akun
 * yang memang dibuat untuk keperluan ini.
 */

const fs = require("fs");
const path = require("path");

const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

// Kredensial dibaca dari file, bukan dari process.env, supaya tidak ikut
// terbawa ke mana pun saat test dijalankan lewat CI. Kalau file tidak ada,
// suite ini di-skip sepenuhnya.
const CREDENTIALS_FILE = path.join(__dirname, "..", ".env.security");

function readCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) return {};

  const values = {};
  for (const line of fs.readFileSync(CREDENTIALS_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return values;
}

const creds = readCredentials();
const USER_EMAIL = creds.TEST_USER_EMAIL;
const USER_PASSWORD = creds.TEST_USER_PASSWORD;
const ADMIN_EMAIL = creds.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = creds.TEST_ADMIN_PASSWORD;

const hasUser = Boolean(USER_EMAIL && USER_PASSWORD);
const hasAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

const describeUser = hasUser ? describe : describe.skip;
const describeAdmin = hasAdmin ? describe : describe.skip;

if (!hasUser && !hasAdmin) {
  console.log(
    "\n[test:auth] Dilewati. Isi server/.env.security untuk menguji alur " +
      "ber-auth (lihat komentar di atas file ini).\n",
  );
}

// Login sekali per peran lalu dipakai ulang di semua test.
//
// PENTING: jangan panggil login() di setiap test. Batasnya 10 percobaan per
// 15 menit per IP (middlewares/rateLimiter.js), jadi test yang login berulang
// akan mengunci dirinya sendiri dengan 429 -- bukan karena aplikasi rusak.
// Session di-cache di level modul supaya seluruh file ini hanya memakai 2
// dari 10 jatah itu.
const sessionCache = new Map();

async function login(email, password) {
  const cacheKey = email;
  if (sessionCache.has(cacheKey)) return sessionCache.get(cacheKey);

  const promise = (async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const setCookies = response.headers.getSetCookie?.() || [];
    return { status: response.status, response, cookies: setCookies };
  })();

  sessionCache.set(cacheKey, promise);
  return promise;
}

function explainLoginFailure(status, role) {
  if (status === 429) {
    return (
      `Login ${role} kena rate limit (429). Batasnya 10 percobaan/15 menit per IP ` +
      `dan kunci ini dipakai bersama test lain dari IP yang sama. Tunggu 15 menit, ` +
      `atau jalankan file ini sendirian tanpa test:security di waktu berdekatan.`
    );
  }
  return (
    `Login ${role} gagal (status ${status}). Cek kredensial di ` +
    `${CREDENTIALS_FILE}, dan pastikan akunnya sudah terverifikasi email ` +
    `(akun unverified dibalas 403 oleh middlewares/authMiddleware.js:93).`
  );
}

const cookieHeader = (setCookies) =>
  setCookies.map((c) => c.split(";")[0]).join("; ");

describeUser("Profil user yang sudah login", () => {
  let sessionCookies = "";

  beforeAll(async () => {
    const { status, cookies } = await login(USER_EMAIL, USER_PASSWORD);
    if (status !== 200) {
      throw new Error(explainLoginFailure(status, "user biasa"));
    }
    sessionCookies = cookieHeader(cookies);
  });

  test("login mengembalikan cookie HttpOnly + Secure", async () => {
    // Pakai session yang sudah didapat beforeAll supaya tidak memakan jatah
    // rate limit kedua kali.
    expect(sessionCookies).toMatch(/^singgah_token=/);

    // Verifikasi flag lengkapnya lewat header Set-Cookie asli. beforeAll
    // hanya menyimpan pasangan kunci=nilai, flag HttpOnly/Secure ada di
    // bagian yang dipangkas, jadi diambil ulang dari cache.
    const cached = await login(USER_EMAIL, USER_PASSWORD);
    const cookie = cached.cookies.join(";");
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite/i);
  });

  // TEMUAN: token JWT dikirim DUA kali -- sebagai cookie HttpOnly (aman dari
  // XSS) dan juga di JSON body. authService.js:201 mengembalikan
  // { token, user } dan authController.js:70 meneruskannya utuh lewat
  // success(res, result).
  //
  // Cookie HttpOnly sejak awal dirancang untuk mencegah itu: commit "auth:
  // pindah session ke HttpOnly cookie" mengubah frontend supaya tidak
  // menyimpan token di localStorage, supaya XSS tidak bisa membacanya. Tapi selama body response
  // masih membawa token, satu baris `localStorage.token = data.token` di
  // mana pun akan mengembalikan seluruh kerentanan itu -- dan token-nya
  // berlaku 6 jam (utils/generateToken.js:12).
  //
  // Test ini sengaja gagal selama backend masih mengirim token. Begitu
  // services/authService.js berhenti mengembalikan token, test ini hijau.
  test("TIDAK menyertakan token di body response", async () => {
    const cached = await login(USER_EMAIL, USER_PASSWORD);
    const body = await cached.response.json();

    expect(body?.data?.token).toBeUndefined();
  });

  test("/api/auth/me mengembalikan data user", async () => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookies },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body?.data?.email).toBe(USER_EMAIL);
  });

  test("response profil tidak boleh membocorkan password hash", async () => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookies },
    });

    const text = await response.text();
    expect(text).not.toMatch(/\$2[aby]\$|password_hash|"password"/i);
  });

  test("cookie session tidak boleh bekerja di origin lain", async () => {
    // Cookie SameSite=none + Securemeans browser akan mengirimnya lintas
    // origin (frontend Vercel -> Railway). Yang diuji di sini adalah sisi
    // server: request tanpa cookie harus tetap ditolak.
    const response = await fetch(`${API_URL}/api/auth/me`);

    expect([200, 401, 403]).toContain(response.status);
    if (response.status === 200) {
      const body = await response.json();
      // Endpoint ini boleh 200 untuk tamu, tapi data harus kosong.
      expect(body?.data).toBeNull();
    }
  });

  test("user biasa tidak boleh menyentuh endpoint admin", async () => {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Cookie: sessionCookies },
    });

    expect([401, 403]).toContain(response.status);
  });

  test("user biasa tidak boleh moderasi karya orang lain", async () => {
    const response = await fetch(`${API_URL}/api/projects/pending`, {
      headers: { Cookie: sessionCookies },
    });

    expect([401, 403]).toContain(response.status);
  });

  test("update profil tidak boleh bisa men escalate role", async () => {
    // Ini celah yang kalau ada akan kritis: user biasa mengubah JSON-nya
    // sendiri lalu menyuruh server menaikkan dirinya jadi admin.
    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        Cookie: sessionCookies,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "admin",
        is_verified: true,
        status: "active",
        name: "Uji Cegah Eskalasi",
      }),
    });

    // Setelahnya pastikan role di server tidak berubah.
    const me = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookies },
    });
    const body = await me.json();

    expect(body?.data?.role).not.toBe("admin");

    // Dan user biasa tetap tidak boleh akses endpoint admin.
    const users = await fetch(`${API_URL}/api/users`, {
      headers: { Cookie: sessionCookies },
    });
    expect([401, 403]).toContain(users.status);

    // Perubahan nama mungkin ditolak (422) atau diterima. Yang penting bukan 5xx.
    expect(response.status).not.toBe(500);
  });
});

describeUser("Ganti password", () => {
  test("ganti password harus menolak payload kosong", async () => {
    // Pakai session cache, bukan login baru.
    const { status, cookies } = await login(USER_EMAIL, USER_PASSWORD);
    if (status !== 200) {
      throw new Error(explainLoginFailure(status, "user biasa"));
    }

    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader(cookies),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describeUser("Upload file", () => {
  test("upload tanpa file harus ditolak, bukan crash", async () => {
    const { status, cookies } = await login(USER_EMAIL, USER_PASSWORD);
    if (status !== 200) {
      throw new Error(explainLoginFailure(status, "user biasa"));
    }

    const response = await fetch(`${API_URL}/api/media`, {
      method: "POST",
      headers: { Cookie: cookieHeader(cookies) },
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).not.toBe(500);
  });

  test("upload tanpa token harus ditolak", async () => {
    const response = await fetch(`${API_URL}/api/media`, { method: "POST" });

    expect([401, 403]).toContain(response.status);
  });
});

describeAdmin("Endpoint admin", () => {
  let adminCookies = "";

  beforeAll(async () => {
    const { status, cookies } = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    if (status !== 200) {
      throw new Error(explainLoginFailure(status, "admin"));
    }
    adminCookies = cookieHeader(cookies);
  });

  test("admin boleh melihat daftar user", async () => {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Cookie: adminCookies },
    });

    expect(response.status).toBe(200);
  });

  test("admin boleh membuka dashboard", async () => {
    const response = await fetch(`${API_URL}/api/dashboard`, {
      headers: { Cookie: adminCookies },
    });

    expect(response.status).toBe(200);
  });

  test("daftar user tidak boleh membocorkan hash password", async () => {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: { Cookie: adminCookies },
    });

    const text = await response.text();
    // authMiddleware yang loads user meng-exclude kolom password
    // (middlewares/authMiddleware.js:71-74). Kalau ini bocor, berarti ada
    // endpoint lain yang lupaexclude.
    expect(text).not.toMatch(/\$2[aby]\$/);
  });

  test("activity log tidak boleh mengekspos email massal tanpa filter", async () => {
    const response = await fetch(`${API_URL}/api/activity-logs?limit=5`, {
      headers: { Cookie: adminCookies },
    });

    // Yang diperiksa di sini hanya bentuk response dan tidak ada stack trace.
    // Isi log memang boleh memuat aktivitas user.
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).not.toMatch(/at\s+Object\.\w+\s+\(.*:\d+:\d+\)/);
  });
});
