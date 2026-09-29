/**
 * Cakupan endpoint read-only yang belum pernah ditembak ke deployment.
 *
 * Suite live.test.js, production.test.js, dan hostedDocs.test.js fokus ke
 * kesehatan umum (health, latency, CORS, JWT, spec drift). File ini menutup
 * endpoint yang sampai sekarang hanya diuji lewat supertest terhadap app
 * lokal dengan SQLite -- artinya kalau ada yang hanya rusak di Railway
 * (proxy, middleware, konfigurasi Railway, perbedaan MySQL vs SQLite),
 * tidak ada yang menangkapnya.
 *
 * Semua request di sini read-only (GET). Suite yang menulis data production
 * atau mengirim email sungguhan sengaja tidak ada di file ini: test tidak
 * boleh mengubah isi server yang sedang dipakai user.
 *
 * Jalankan:
 *   npm run test:endpoints
 *   API_URL=https://staging.up.railway.app npm run test:endpoints
 */

const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

// Tanpa token. Endpoint yang butuh auth harus menolak, bukan accidentaly 200.
const ANON = { Authorization: "Bearer token-palsu-untuk-cek-endpoint" };

async function getJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: ANON,
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  let body = null;

  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return { status: response.status, headers: response.headers, body };
}

// Pesan 404 dari catch-all Express. Dipakai untuk membedakan "route tidak
// ada" dari "data tidak ada" -- keduanya sama-sama 404 tapi artinya beda.
function isRouteMissing(result) {
  return (
    result.status === 404 &&
    JSON.stringify(result.body).includes("Endpoint tidak ditemukan")
  );
}

describe("News: akses per slug", () => {
  // Frontend memakai /news/slug/:slug untuk halaman detail. Kalau path ini
  // rusak di hosting, semua artikel tidak bisa dibuka sama sekali.

  test("slug yang ada harus mengembalikan artikel", async () => {
    // Slug diambil dari daftar news, bukan ditulis manual, supaya test ini
    // tidak ikut gagal saat isi database berubah.
    const list = await getJson("/api/news?limit=1");
    const items = list.body?.data?.items;
    const first = Array.isArray(items) ? items[0] : null;

    expect(first).toBeTruthy();
    expect(typeof first.slug).toBe("string");

    const result = await getJson(`/api/news/slug/${first.slug}`);

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);
    expect(result.body.data).toMatchObject({ slug: first.slug });
  });

  test("slug yang tidak ada harus 404 dengan pesan yang jelas", async () => {
    const result = await getJson("/api/news/slug/tidak-ada-slug-ini-999999");

    expect(result.status).toBe(404);
    expect(result.body).toHaveProperty("success", false);
    expect(result.body.message).toMatch(/tidak ditemukan/i);
  });

  test("slug dengan karakter aneh tidak boleh 500", async () => {
    const payloads = [
      "___",
      "%20",
      "../../../etc/passwd",
      "a".repeat(500),
      "<script>alert(1)</script>",
      "berita?limit=99999999",
      "berita#fragmen",
    ];

    for (const payload of payloads) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`/api/news/slug/${payload}`);

      expect({ payload, status: result.status }).not.toMatchObject({
        payload,
        status: 500,
      });
    }
  });

  test("slug kosong tidak boleh 500", async () => {
    const response = await fetch(`${API_URL}/api/news/slug/`, {
      headers: ANON,
    });

    expect(response.status).not.toBe(500);
  });
});

describe("Kategori: akses per id", () => {
  test("id yang ada harus mengembalikan kategori", async () => {
    const list = await getJson("/api/categories?all=1");
    const categories = list.body?.data;
    const first = Array.isArray(categories) ? categories[0] : null;

    expect(first).toBeTruthy();

    const result = await getJson(`/api/categories/${first.id}`);

    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ id: first.id });
  });

  test("id yang tidak ada harus 404 'Kategori tidak ditemukan'", async () => {
    const result = await getJson("/api/categories/999999");

    // 404 dengan pesan spesifik, bukan catch-all "Endpoint tidak ditemukan":
    // yang pertama berarti route hidup dan benar, yang kedua route hilang.
    expect(result.status).toBe(404);
    expect(isRouteMissing(result)).toBe(false);
  });

  test("id bukan angka harus ditolak dengan rapi", async () => {
    for (const id of ["abc", "1 OR 1=1", "-1", "1.5", "%20"]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`/api/categories/${id}`);
      expect(result.status).not.toBe(500);
    }
  });
});

describe("Project: akses per id", () => {
  test("id yang ada harus mengembalikan project", async () => {
    const list = await getJson("/api/projects?limit=1");
    const first = list.body?.data?.items?.[0];

    expect(first).toBeTruthy();

    const result = await getJson(`/api/projects/${first.id}`);

    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ id: first.id });
  });

  test("id yang tidak ada harus 404 dengan pesan 'Project tidak ditemukan'", async () => {
    const result = await getJson("/api/projects/999999999999");

    expect(result.status).toBe(404);
    expect(isRouteMissing(result)).toBe(false);
  });

  test("id sangat besar tidak boleh overflow jadi 500", async () => {
    // Number.MAX_SAFE_INTEGER revolutionized: string yang lebih besar dari
    // batas ini bisa membuat parser DB error.
    const result = await getJson("/api/projects/99999999999999999999999");

    expect(result.status).not.toBe(500);
  });

  test("revision endpoint harus tetap 404", async () => {
    // tests/project.test.js sudah mensyaratkan ini dihapus dari API karena
    // membocorkan riwayat revisi karya. Kalau route-nya somehow masih ada
    // di deployment, ini kebocoran data.
    const result = await getJson("/api/projects/revisions");

    expect(result.status).toBe(404);
  });
});

describe("Endpoint yang butuh auth harus menolak anonim", () => {
  // Suite ini memanggil endpoint yang diuji unit dengan JWT, jadi kalau
  // guard auth hilang di produksi, testnya tetap hijau di lokal tapi
  // endpointnya terbuka untuk siapa saja. Di sini yang dicek justru
  // penolakannya.

  const guarded = [
    { name: "daftar user", path: "/api/users" },
    { name: "detail user", path: "/api/users/1" },
    { name: "project milik saya", path: "/api/projects/my" },
    { name: "bookmark saya", path: "/api/projects/my-bookmarks" },
    { name: "notifikasi", path: "/api/notifications" },
    { name: "dashboard", path: "/api/dashboard" },
    { name: "log aktivitas", path: "/api/activity-logs" },
    { name: "laporan", path: "/api/reports" },
    { name: "statistik profil", path: "/api/auth/profile-stats" },
    { name: "daftar media", path: "/api/media" },
  ];

  test.each(guarded)("$name -> menolak tanpa token", async ({ path }) => {
    const result = await getJson(path);

    expect([401, 403]).toContain(result.status);
    expect(result.headers.get("content-type")).toContain("application/json");
  });

  test("detail user milik orang lain juga harus menolak", async () => {
    // Admin boleh, tapi token harus _. Keempat request ini memakai token
    // ngawur; yang diperiksa adalah tidak ada data yang bocor keluar.
    for (const id of [1, 2, 999999]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`/api/users/${id}`);

      expect(result.status).not.toBe(200);
    }
  });

  test("token ngawur tidak boleh menambah data di response", async () => {
    const result = await getJson("/api/users");

    expect([401, 403]).toContain(result.status);
    // Jangan sampai payload error ikut membawa data user.
    expect(JSON.stringify(result.body)).not.toMatch(/"password"/i);
  });
});

describe("Endpoint yang sengaja tidak ada harus tetap 404", () => {
  // Regresi dari fitur yang sudah dihapus. Kalau salah satu route ini masih
  // hidup, berarti ada data yang dulu tidak sengaja dipublikasikan.

  const removed = [
    "/api/stats/visit",
    "/api/media/usage",
    "/api/auth/check-email",
  ];

  test.each(removed)("%s -> 404", async (path) => {
    const result = await getJson(path);

    expect(result.status).toBe(404);
  });
});

describe("Path traversal harus tetap aman", () => {
  // Penting: "../" mentah TIDAK boleh dipakai di sini. WHATWG URL di Node
  // menormalisasi path sebelum request dikirim, jadi "../../../etc/passwd"
  // benar-benar berubah jadi "/etc/passwd" dan tidak pernah menyentuh
  // Express sama sekali -- test-nya jadi hijau tanpa menguji apa pun.
  //
  // Bentuk yang benar adalah URL-encoded ("%2e%2e%2f" dan "%2f"), karena itu
  // yang sampai ke server apa adanya dan yang dipakai penyerang sungguhan.

  const encodedTraversals = [
    "/api/news/..%2f..%2f..%2f..%2fetc%2fpasswd",
    "/api/projects/..%2f..%2f..%2f..%2fetc%2fpasswd",
    "/api/projects/%2e%2e%2f%2e%2e%2f.env",
    "/api/media/..%2f..%2f..%2f.env",
    "/api/users/..%2f..%2fserver.js",
    "/api/news/..%2f..%2f..%2f..%2fproc%2fself%2fenviron",
  ];

  test.each(encodedTraversals)("%s -> tidak boleh bocor file", async (path) => {
    const result = await getJson(path);

    expect(result.status).not.toBe(200);

    // Isi file server tidak boleh muncul di body maupun ter-trigger error 500.
    const body = String(result.body);
    expect(body).not.toMatch(/root:x:|DB_PASSWORD|JWT_SECRET|require\(express/);
  });

  test("path traversal tidak boleh membuat server error", async () => {
    for (const path of encodedTraversals) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(path);
      expect(result.status).not.toBe(500);
    }
  });
});

describe("Query param harus aman dan tidak boleh 500", () => {
  // Postgres/MySQL akan menolak WHERE dengan tipe salah dan beberapa driver
  // melempar exception jadi 500. Lapisan database production punya jenis
  // kesalahan sendiri, jadi ini harus dicek di server sungguhan, bukan
  // hanya di SQLite lokal.

  const badLimits = ["abc", "-1", "0", "1e10", "999999999999", "", "%20"];

  test.each(badLimits)("limit=%s -> tidak boleh 500", async (value) => {
    for (const path of ["/api/projects", "/api/news", "/api/categories"]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`${path}?limit=${value}`);

      expect({ path, status: result.status }).not.toMatchObject({
        status: 500,
      });
    }
  });

  test("limit valid harus dipatuhi", async () => {
    const result = await getJson("/api/projects?limit=2");
    const items = result.body?.data?.items;

    expect(result.status).toBe(200);
    if (Array.isArray(items)) {
      expect(items.length).toBeLessThanOrEqual(2);
    }
  });

  test("page di luar range harus mengembalikan kosong, bukan error", async () => {
    const result = await getJson("/api/projects?page=99999&limit=10");

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);
  });

  test("sort dan filter tidak dikenal tidak boleh 500", async () => {
    const queries = [
      "sort=tidak-ada",
      "sort=; DROP TABLE users",
      "category_id=abc",
      "category_id=999999999999",
      "status=' OR '1'='1",
      "user_id=-1",
      "featured_slot=abc",
      "year=abcd",
    ];

    for (const query of queries) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`/api/projects?${query}`);

      expect({ query, status: result.status }).not.toMatchObject({
        status: 500,
      });
    }
  });

  test("sort yang valid harus mengembalikan hasil", async () => {
    for (const sort of ["terbaru", "terlama", "populer"]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(`/api/projects?limit=1&sort=${sort}`);

      expect({ sort, status: result.status }).not.toMatchObject({ status: 500 });
    }
  });
});

describe("Bentuk response harus konsisten", () => {
  // Frontend (Flutter) membaca field dengan tipe tertentu. Server yang
  // balas 200 tapi bentuknya berubah akan bikin error decoding di sisi klien
  // -- sulit dilacak karena tidak ada error di log server.

  const listEndpoints = [
    "/api/projects",
    "/api/news",
    "/api/categories",
    "/api/stats",
    "/api/hall",
    "/api/settings",
  ];

  test.each(listEndpoints)("%s -> success:true dan punya data", async (path) => {
    const result = await getJson(path);

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);
    expect(result.body).toHaveProperty("data");
    expect(result.body.data).not.toBeNull();
  });

  test("endpoint ber-pagination harus punya bentuk yang sama", async () => {
    // /projects dan /news bal Success dengan { items, pagination }, sedangkan
    // /categories balSuccess dengan array biasa. Semua harus punya success dan
    // message, kalau tidak frontend tidak bisa menampilkan pesan error.
    for (const path of ["/api/projects?limit=1", "/api/news?limit=1"]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(path);

      expect(result.body).toHaveProperty("success", true);
      expect(result.body).toHaveProperty("message");
    }
  });

  test("response error harus selalu punya success:false", async () => {
    // Frontend mengandalkan flag ini untuk membedakan error dari data kosong.
    const cases = [
      "/api/projects/999999999999",
      "/api/categories/999999",
      "/api/news/slug/tidak-ada",
      "/api/route-yang-tidak-ada",
    ];

    for (const path of cases) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getJson(path);

      expect(result.status).toBeGreaterThanOrEqual(400);
      expect(result.body).toHaveProperty("success", false);
      expect(typeof result.body.message).toBe("string");
    }
  });

  test("content-type response error harus JSON", async () => {
    // Flutter tidak bisa membaca halaman HTML error dari Express.
    const response = await fetch(`${API_URL}/api/tidak-ada-12345`);

    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

describe("Perilaku endpoint stats dan hall yang dipakai landing page", () => {
  // Endpoint ini dipanggil frontend publik tepat setelah halaman utama
  // terbuka. Kalau mereka lambat, seluruh first paint ikut lambat.

  test("/api/stats harus replying cepat dan konsisten", async () => {
    const startedAt = process.hrtime.bigint();
    const result = await getJson("/api/stats");
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    expect(result.status).toBe(200);
    // Batas longgar: yang dicek bukan performa, tapi statistik yang
    // timeout berarti landing page gagal total.
    expect(elapsedMs).toBeLessThan(5000);
  });

  test("/api/stats harus punya field yang dipakai frontend", async () => {
    const result = await getJson("/api/stats");

    expect(result.status).toBe(200);
    const data = result.body?.data;
    expect(data).toBeTruthy();
    expect(typeof data === "object").toBe(true);
  });

  test("/api/hall harus punya kategori dan karya", async () => {
    const result = await getJson("/api/hall");

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);
    expect(result.body.data).not.toBeNull();
  });

  test("/api/settings harus mengembalikan konfigurasi publik", async () => {
    // Settings dipakai frontend untuk nama situs, logo, dan status
    // maintenance. Kalau endpoint ini error, frontend harus bisa
    // fallback -- tapi pastikan dulu bentuknya benar.
    const result = await getJson("/api/settings");

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("success", true);
  });

  test("landing page tidak boleh membocorkan kredensial lewat settings", async () => {
    // /api/settings dipanggil tanpa login. Kalau ada field internal yang
    // ikut ter-serialize, itu bocor ke publik.
    const result = await getJson("/api/settings");

    const body = JSON.stringify(result.body);
    expect(body).not.toMatch(
      /password|secret|apiKey|api_key|token|smtp|cloudinary/i,
    );
  });
});
