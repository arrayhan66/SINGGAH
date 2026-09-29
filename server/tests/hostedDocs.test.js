/**
 * Uji VKTI dokumentasi API yang di-deploy di Railway.
 *
 * Halaman /api/docs adalah satu-satunya "kontrak" yang dibaca orang lain
 * (frontend, integrator, developer baru) sebelum menyentuh API. Failure-nya
 * sulit ketahuan dari sisi aplikasi: server tetap jalan, semua endpoint tetap
 * hijau, tapi dokumennya sudah berbohong atau halamannya kosong.
 *
 * Karena itu suite ini menutup dua kelas bug yang tidak caught test biasa:
 *   1. Halaman docs mati / spec tidak termuat (loadSwagger() gagal diam-diam).
 *   2. Spec dan route asli sudah berbeda -- drift.
 *
 * Syarat: butuh internet, menyentuh server production.
 *
 * Jalankan:
 *   npm run test:docs
 *   API_URL=https://staging.up.railway.app npm run test:docs
 */

const API_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

const DOCS_URL = `${API_URL}/api/docs`;

/**
 * swagger-ui-init.js membungkus spec di dalam object literal JavaScript,
 * bukan JSON murni, jadi JSON.parse langsung akan gagal. Ambil objek
 * "swaggerDoc"-nya dengan brace matching yang sadar terhadap string dan
 * escape, lalu JSON.parse hasilnya.
 */
function extractSpec(text) {
  const key = text.indexOf('"swaggerDoc"');
  if (key === -1) throw new Error('Key "swaggerDoc" tidak ada di init.js');

  const start = text.indexOf("{", key);
  let depth = 0;
  let end = -1;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) throw new Error("Object swaggerDoc tidak tertutup");
  return JSON.parse(text.slice(start, end));
}

// Spec diambil sekali per suite. 27 request untuk cek drift hanya akan
// menambah beban tanpa menambah cakupan.
let cachedSpec = null;

async function loadSpec() {
  if (cachedSpec) return cachedSpec;

  const response = await fetch(`${DOCS_URL}/swagger-ui-init.js`);
  if (!response.ok) {
    throw new Error(`swagger-ui-init.js balas ${response.status}`);
  }

  cachedSpec = extractSpec(await response.text());
  return cachedSpec;
}

describe("Halaman /api/docs harus hidup", () => {
  test("halaman utama docs harus 200 dan menyajikan HTML", async () => {
    const response = await fetch(`${DOCS_URL}/`, { redirect: "follow" });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
  });

  test("tanpa garis miring di akhir juga harus dilayani", async () => {
    // swagger-ui-express menempel mount persis di /api/docs, jadi /api/docs
    // tanpa garis miring bisa kena 404 tergantung strict routing Express.
    const response = await fetch(DOCS_URL, { redirect: "follow" });

    expect(response.status).toBe(200);
  });

  test("dokumentasi tidak boleh butuh login", async () => {
    // Kalau docs ikut ter-proteksi authMiddleware, orang yang lagi cari
    // referensi tidak bisa membukanya dan dokumentasi jadi tidak berguna.
    const response = await fetch(`${DOCS_URL}/`);

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });

  test("aset statis docs harus termuat semua", async () => {
    // Tanpa CSS/JS ini, halaman terbuka tapi tampilannya kosong putih --
    // lolos cek status 200 tapi jelas rusak.
    const assets = [
      { name: "CSS", path: "/swagger-ui.css" },
      { name: "bundle JS", path: "/swagger-ui-bundle.js" },
      { name: "preset JS", path: "/swagger-ui-standalone-preset.js" },
      { name: "favicon", path: "/favicon-32x32.png" },
    ];

    for (const asset of assets) {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(`${DOCS_URL}${asset.path}`);

      expect({ asset: asset.name, status: response.status }).toEqual({
        asset: asset.name,
        status: 200,
      });
    }
  });
});

describe("Spec OpenAPI harus benar-benar termuat", () => {
  // Kegagalan paling umum di sini: loadSwagger() melempar error saat bundling
  // $ref. Server tetap start, /api/docs tetap 200, tapi Swagger UI menampilkan
  // "Failed to load API definition" tanpa satu pun endpoint.
  test("spec harus bisa dibaca dan di-parse", async () => {
    const spec = await loadSpec();

    expect(spec).toBeTruthy();
    expect(typeof spec.paths).toBe("object");
  });

  test("spec harus punya versi OpenAPI dan info yang benar", async () => {
    const spec = await loadSpec();

    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info?.title).toBe("SINGGAH API");
  });

  test("spec harus menunjuk ke base URL yang benar", async () => {
    const spec = await loadSpec();

    // Try-it-out di Swagger UI memakai servers[].url. Kalau salah, semua
    // request dari dokumentasi akan tembak ke host yang tidak ada.
    expect(spec.servers?.[0]?.url).toBe("/api");
  });

  test("spec harus punya endpoint yang berarti", async () => {
    const spec = await loadSpec();
    const paths = Object.keys(spec.paths);

    expect(paths.length).toBeGreaterThan(20);
    expect(paths).toEqual(expect.arrayContaining(["/auth/login", "/projects"]));
  });

  test("spec tidak boleh membocorkan kredensial", async () => {
    // Spec ikut ter-bundle dan disajikan publik. Kalau ada yang menulis
    // password contoh yang sebenarnya password asli, itu bocor.
    const response = await fetch(`${DOCS_URL}/swagger-ui-init.js`);
    const body = await response.text();

    expect(body).not.toMatch(
      /DB_PASSWORD|JWT_SECRET|CLOUDINARY_API|SENDLIB_API|RESEND_API|PRIVATE_KEY/,
    );
  });
});

describe("Spec harus sinkron dengan route yang benar-benar ada", () => {
  // openapi.yaml ditulis tangan dan $ref-nya tersebar di 10 file YAML,
  // sementara router-nya ada di 20 file terpisah. Dua-duanya bisa berubah
  // tanpa satu pun tahu. Yang paling berbahaya: route dihapus atau di-rename
  // tapi spec masih menyebutnya -- frontend developer lalu menulis kode yang
  // selalu 404 tanpa sadar.

  test("semua endpoint GET yang didokumentasikan harus ada di server", async () => {
    const spec = await loadSpec();

    const getPaths = Object.entries(spec.paths)
      .filter(([, operations]) => operations.get)
      .map(([path]) => path);

    expect(getPaths.length).toBeGreaterThan(0);

    const drifted = [];

    for (const path of getPaths) {
      // Ganti {param} dengan nilai generik. Suite ini hanya boleh memukul
      // method GET supaya tidak pernah mengubah data production.
      const concrete = path.replace(/\{[^}]+\}/g, "1");

      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(`${API_URL}/api${concrete}`, {
        headers: { Authorization: "Bearer token-palsu-untuk-cek-drift" },
      });

      // eslint-disable-next-line no-await-in-loop
      const body = await response.text();

      // 404 "Endpoint tidak ditemukan" = route-nya hilang/berubah nama.
      // 404 lain (mis. "Project tidak ditemukan") = route hidup, datanya
      // yang tidak ada -- itu kondisi normal, bukan drift.
      if (
        response.status === 404 &&
        body.includes("Endpoint tidak ditemukan")
      ) {
        drifted.push(path);
      }
    }

    expect(drifted).toEqual([]);
  });

  test("endpoint yang tidak ada di spec harus tetap 404", async () => {
    // Kebalikan dari drift: memastikan ada penangkap 404 yang benar, bukan
    // response 200 kosong yang lolos diam-diam.
    const response = await fetch(`${API_URL}/api/route-yang-tidak-pernah-ada`, {
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

describe("Endpoint yang dilindungi auth harus menolak anonim", () => {
  // Pengecekan terpenting bahwa guard auth benar-benar terpasang di produksi.
  // Kalau authMiddleware hilang dari satu route, route itu tetap 200 untuk
  // siapa saja -- dan semua test response-shape di atas tetap hijau karena
  // mereka memang memanggil dengan token.
  const protectedPaths = [
    "/api/users",
    "/api/dashboard",
    "/api/notifications",
    "/api/activity-logs",
    "/api/reports",
    "/api/projects/pending",
    "/api/projects/my-bookmarks",
  ];

  test.each(protectedPaths)("%s -> 401 tanpa token", async (path) => {
    const response = await fetch(`${API_URL}${path}`);

    expect([401, 403]).toContain(response.status);
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  test("/api/auth/me boleh anonim tapi tidak boleh error", async () => {
    // Satu-satunya endpoint yang sengaja memakai optionalAuthMiddleware:
    // frontend memanggilnya untuk cek status login sebelum redirect.
    const response = await fetch(`${API_URL}/api/auth/me`);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("success", true);
    // Tanpa token harus null -- bukan profil user sungguhan.
    expect(body.data).toBeNull();
  });
});
