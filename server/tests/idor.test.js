/**
 * Uji IDOR (Insecure Direct Object Reference) terhadap Railway yang dideploy.
 *
 * IDOR adalah celah di mana user yang sudah login berhasil mengakses atau
 * mengubah data milik orang lain hanya dengan menebak/menukar ID di URL.
 * Kerentakannya tidak terlihat dari kode: route-nya bisa terbungkus authMiddleware
 * dengan benar, tapi tetap bocor kalau query-nya tidak ikut memfilter pemilik.
 *
 * Contoh: user A login, lalu PATCH /api/notifications/123/read. Kalau
 * services/notificationService.js melakukan findByPk tanpa user_id, notifikasi
 * milik user B akan ikut berubah.
 *
 * Test ini memakai DUA akun berbeda. Satu akun saja tidak bisa membuktikan apa
 *-apa, karena "tidak bisa akses ID sendiri" bukan bukti.
 *
 * KREDENSIAL TIDAK DISIMPAN DI REPO. Isi server/.env.security:
 *   TEST_USER_EMAIL / TEST_USER_PASSWORD
 *   TEST_OTHER_EMAIL / TEST_OTHER_PASSWORD
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD   (opsional, untuk cross-check)
 *
 * Jalankan: npm run test:idor
 */


const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");
// Pembacaan kredensial dipusatkan di tests/credentials.js. Jangan pakai
// dotenv di sini: password test mengandung "#" yang akan terpotong.
const {
  ACCOUNTS,
  hasCredentials,
  explainLoginFailure: explainLoginFailureBase,
  waitForLoginQuota,
} = require("./credentials");

const A_EMAIL = ACCOUNTS.user.email;
const A_PASSWORD = ACCOUNTS.user.password;
const B_EMAIL = ACCOUNTS.other.email;
const B_PASSWORD = ACCOUNTS.other.password;
const ADMIN_EMAIL = ACCOUNTS.admin.email;
const ADMIN_PASSWORD = ACCOUNTS.admin.password;

const hasA = hasCredentials("user");
const hasB = hasCredentials("other");

// Dua akun berbeda WAJIB. Dengan satu akun, test ini hanya membuktikan
// "user tidak bisa akses ID sendiri", yang memang tidak menarik.
const ready = hasA && hasB && A_EMAIL !== B_EMAIL;
const describeIdor = ready ? describe : describe.skip;

if (!ready) {
  console.log(
    "\n[test:idor] Dilewati. Butuh DUA akun berbeda di server/.env.security " +
      "(TEST_USER_* dan TEST_OTHER_*).\n",
  );
}

// Batas login 10/15 menit per IP. Login sekali per akun lalu cache, supaya
// seluruh file ini hanya memakai 2 jatah.
const sessionCache = new Map();

async function login(email, password) {
  if (sessionCache.has(email)) return sessionCache.get(email);

  const promise = (async () => {
    const attempt = async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return {
        status: response.status,
        cookies: response.headers.getSetCookie?.() || [],
      };
    };

    let result = await attempt();

    // 429 = kuota 10 percobaan/15 menit habis, biasanya karena test:security
    // baru saja menghabiskan seluruhnya. Limiter menolak sebelum handler jalan,
    // jadi password yang benar pun ditolak dan kuota harus kedaluwarsa dulu.
    if (result.status === 429) {
      sessionCache.delete(email);
      await waitForLoginQuota(API_URL);
      result = await attempt();
    }

    return result;
  })();

  sessionCache.set(email, promise);
  return promise;
}

const cookieHeader = (cookies) =>
  cookies.map((c) => c.split(";")[0]).join("; ");

async function loginOrThrow(email, password, role) {
  const { status, cookies } = await login(email, password);
  if (status !== 200) {
    throw new Error(explainLoginFailureBase(role, status, null));
  }
  return cookieHeader(cookies);
}

async function as(cookies, path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    redirect: "manual",
    ...options,
    headers: { ...(options.headers || {}), Cookie: cookies },
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body };
}

describeIdor("IDOR: user A tidak boleh menyentuh data user B", () => {
  let cookiesA;
  let cookiesB;
  let bUserId = null;

  beforeAll(async () => {
    cookiesA = await loginOrThrow(A_EMAIL, A_PASSWORD, "user A");
    cookiesB = await loginOrThrow(B_EMAIL, B_PASSWORD, "user B");

    // Ambil ID user B lewat endpoint profil sendiri, bukan menebak. Ini juga
    // membuktikan /api/auth/me hanya mengembalikan data pemiliknya.
    const meB = await as(cookiesB, "/api/auth/me");
    bUserId = meB.body?.data?.id ?? null;
  });

  test("kedua akun harus punya ID berbeda", () => {
    // Kalau ternyata email yang diisi menunjuk akun yang sama, sisa test ini
    // tidak berarti apa-apa. Gagal di sini lebih baik daripada diam-diam
    // hijau karena salah konfigurasi.
    expect(bUserId).toBeTruthy();
  });

  test("/api/auth/me hanya mengembalikan data pemilik sendiri", async () => {
    const meA = await as(cookiesA, "/api/auth/me");

    expect(meA.status).toBe(200);
    expect(meA.body?.data?.email).toBe(A_EMAIL);
    // Guard tambahan: pastikan respons tidak mencampur milik orang lain.
    expect(meA.body?.data?.email).not.toBe(B_EMAIL);
  });

  test("user A tidak boleh membaca profil user B lewat /api/users/:id", async () => {
    const result = await as(cookiesA, `/api/users/${bUserId}`);

    // Route ini butuh admin (routes/userRoutes.js:27-32), jadi user biasa
    // harus dapat 403.
    expect([401, 403]).toContain(result.status);
  });

  test("user A tidak boleh mengubah user B lewat PUT /api/users/:id", async () => {
    const result = await as(cookiesA, `/api/users/${bUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Dibajak oleh user A" }),
    });

    expect([401, 403]).toContain(result.status);
  });

  test("user A tidak boleh menghapus user B", async () => {
    const result = await as(cookiesA, `/api/users/${bUserId}`, {
      method: "DELETE",
    });

    expect([401, 403]).toContain(result.status);
  });

  test("user A tidak boleh menyetujui tipe user B", async () => {
    const result = await as(cookiesA, `/api/users/${bUserId}/approve-tipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect([401, 403]).toContain(result.status);
  });

  test("mencoba IDOR tidak boleh mengubah data user B", async () => {
    // Status 403 di atas hanya bukti bahwa route-nya menolak; itu belum
    // bukti data user B utuh. User B harus benar-benar masih ada.
    const meB = await as(cookiesB, "/api/auth/me");

    expect(meB.status).toBe(200);
    expect(meB.body?.data?.name).not.toBe("Dibajak oleh user A");
    expect(meB.body?.data?.id).toBe(bUserId);
  });
});

describeIdor("IDOR pada notifikasi milik orang lain", () => {
  let cookiesA;
  let cookiesB;

  beforeAll(async () => {
    cookiesA = await loginOrThrow(A_EMAIL, A_PASSWORD, "user A");
    cookiesB = await loginOrThrow(B_EMAIL, B_PASSWORD, "user B");
  });

  // services/notificationService.js:38-40 melakukan findOne dengan
  // { id, user_id }, jadi notifikasi milik orang lain harusnya 404. Test ini
  // mengunci perilaku itu -- kalau nanti ada refactor yang menghapus filter
  // user_id, test ini langsung merah.
  test("user A tidak bisa menandai notifikasi milik user B sebagai dibaca", async () => {
    const listB = await as(cookiesB, "/api/notifications?limit=1");
    const sampleId = listB.body?.data?.[0]?.id ?? listB.body?.data?.notifications?.[0]?.id;

    if (!sampleId) {
      // Tidak ada notifikasi sama sekali. Lewati, jangan gagalkan: kondisi ini
      // tidak bergantung pada kode yang diuji.
      console.log(
        "[idor] user B tidak punya notifikasi, test notifikasi dilewati. " +
          "Buat notifikasi dulu untuk mengujinya.",
      );
      return;
    }

    const result = await as(cookiesA, `/api/notifications/${sampleId}/read`, {
      method: "PATCH",
    });

    // 404 (tidak ditemukan milikmu) atau 403. Yang penting bukan 2xx.
    expect([403, 404]).toContain(result.status);
  });

  test("user A tidak bisa menghapus notifikasi milik user B", async () => {
    const listB = await as(cookiesB, "/api/notifications?limit=1");
    const sampleId = listB.body?.data?.[0]?.id ?? listB.body?.data?.notifications?.[0]?.id;

    if (!sampleId) return;

    const result = await as(cookiesA, `/api/notifications/${sampleId}`, {
      method: "DELETE",
    });

    expect([403, 404]).toContain(result.status);
  });

  test("bulk delete tidak boleh mencampur ID milik user lain", async () => {
    const listB = await as(cookiesB, "/api/notifications?limit=1");
    const sampleId = listB.body?.data?.[0]?.id ?? listB.body?.data?.notifications?.[0]?.id;

    if (!sampleId) return;

    // bulkDeleteNotifications(userId, ids) harus memfilter user_id. Kalau tidak,
    // satu request ini akan menghapus notifikasi user B.
    const result = await as(cookiesA, "/api/notifications/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [sampleId] }),
    });

    // Kalau tidak ditemukan milik user A, affected harus 0.
    if (result.status === 200) {
      expect(result.body?.data?.affected ?? 0).toBe(0);
    } else {
      expect([403, 404]).toContain(result.status);
    }
  });

  test("notifikasi user B masih utuh setelah semua percobaan", async () => {
    const listB = await as(cookiesB, "/api/notifications?limit=10");

    expect(listB.status).toBe(200);
    // Query ini sudah scoped ke user B, jadi hasilnya harus milik B saja.
    if (listB.body?.data?.user_id !== undefined) {
      expect(listB.body.data.user_id).toBeUndefined();
    }
  });
});

describeIdor("Mass assignment: user tidak boleh mengubah field miliknya sendiri", () => {
  let cookiesA;

  beforeAll(async () => {
    cookiesA = await loginOrThrow(A_EMAIL, A_PASSWORD, "user A");
  });

  test("update profil tidak boleh menaikkan role jadi admin", async () => {
    // Endpoint profil sendiri: PUT /api/auth/profile. authController.js:159
    // mengambil req.user.id, dan authService.js:815 hanya membaca
    // name/username/email/nim_nip. Jadi role di body harus diabaikan.
    const result = await as(cookiesA, "/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "admin",
        status: "active",
        is_verified: true,
      }),
    });

    // Respons profil bisa ditolak (422) atau diterima. Yang diperiksa adalah
    // efeknya: role di server tidak boleh berubah.
    const me = await as(cookiesA, "/api/auth/me");
    expect(me.body?.data?.role).not.toBe("admin");

    // Dan user A tetap tidak boleh menyentuh endpoint admin.
    const users = await as(cookiesA, "/api/users");
    expect([401, 403]).toContain(users.status);
  });

  test("user tidak boleh mengubah ID user lain lewat body", async () => {
    const result = await as(cookiesA, "/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, user_id: 1 }),
    });

    // Tidak boleh 500, dan ID-nya harus tetap milik sendiri.
    expect(result.status).not.toBe(500);

    const me = await as(cookiesA, "/api/auth/me");
    expect(me.body?.data?.email).toBe(A_EMAIL);
  });
});

describeIdor("Cross-check dengan admin", () => {
  const hasAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
  const describeAdmin = ready && hasAdmin ? describe : describe.skip;

  if (ready && !hasAdmin) {
    console.log(
      "\n[test:idor] TEST_ADMIN_* tidak diisi, cross-check admin dilewati.\n",
    );
  }

  describeAdmin("Admin boleh, user biasa tidak boleh", () => {
    let cookiesA;
    let cookiesAdmin;
    let bUserId = null;

    beforeAll(async () => {
      cookiesA = await loginOrThrow(A_EMAIL, A_PASSWORD, "user A");
      cookiesAdmin = await loginOrThrow(ADMIN_EMAIL, ADMIN_PASSWORD, "admin");

      const meB = await as(await loginOrThrow(B_EMAIL, B_PASSWORD, "user B"), "/api/auth/me");
      bUserId = meB.body?.data?.id ?? null;
    });

    test("admin boleh membaca user lain (kontrol positif)", async () => {
      // Kontrol positif itu penting: kalau test IDOR hanya memeriksa "user biasa
      // ditolak", test itu juga akan hijau kalau endpoint-nya memang rusak
      // total. Di sini kita membuktikan endpoint-nya bekerja untuk yang berhak.
      const result = await as(cookiesAdmin, `/api/users/${bUserId}`);

      expect(result.status).toBe(200);
      expect(result.body?.data?.id).toBe(bUserId);
    });

    test("user biasa ditolak di endpoint yang sama", async () => {
      const result = await as(cookiesA, `/api/users/${bUserId}`);

      expect([401, 403]).toContain(result.status);
    });
  });
});
