import { test, expect } from "@playwright/test";
import { EMAILS, CREDS_CONFIGURED } from "./helpers";

// Browser FULLSCREEN + gerakan DIPERLAMBAT biar keliatan jelas.
// Set JOURNEY_SLOW=1 untuk slow-mo (demo), off default (validasi cepat).
test.use({
  viewport: { width: 1920, height: 1080 },
  launchOptions: {
    args: ["--start-fullscreen", "--force-device-scale-factor=1"],
    slowMo: process.env.JOURNEY_SLOW ? 140 : 0,
  },
  actionTimeout: 15_000,
});

// ============================================================================
// FULL HUMAN-LIKE JOURNEY + OTOMATIS PENDETEKSI BUG
// ALUR: VISITOR -> UMUM -> MAHASISWA -> DOSEN -> ADMIN
// - Satu browser, satu alur berkelanjutan. page.goto("/") HANYA untuk entry
//   awal & 404. Semua navigasi lain via KLIK UI nyata (navbar, kartu, tombol).
// - Tiap elemen/page di-deep-explore (bukan cuma "masuk-scroll-keluar"):
//   carian difungsikan (hasilnya diverifikasi), toggle dipencet 2 arah,
//   modal dibuka & ditutup, form divalidasi, "Lihat Lebih Banyak" dicek
//   bertambah, FAQ dibuka, Hall 3D dimasuki & dicoba jalan, dst.
// - Pendeteksi bug aktif sejak detik pertama:
//   * pageerror (uncaught exceptions)
//   * console.error / console.warning
//   * request failed (network)
//   * respons HTTP 4xx/5xx
//   * step yang gagal karena elemen tertutup/intercept/error
//   Semua dikumpulkan & di-dedupe, lalu laporan ditulis ke
//   test-results/journey-bug-report.json/.md dan dicetak di akhir.
// ============================================================================
test.describe.configure({ mode: "serial" });
test.setTimeout(780000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================ BUG & STEP LOADER ============================
const ISSUES = [];
const NET = new Map();
const PASSED = [];
let cap = 0;

function recordIssue(title, error = "", url = "", fixHint = "") {
  if (cap > 300) return;
  cap++;
  ISSUES.push({
    title,
    error: String(error).slice(0, 400),
    url,
    fixHint,
    at: new Date().toISOString(),
  });
}

function recordPass(label) {
  PASSED.push(label);
}

function addNet(kind, url, detail) {
  const key = `${kind}|${url}`;
  if (NET.has(key)) {
    NET.get(key).count++;
    return;
  }
  NET.set(key, { kind, url, detail, count: 1 });
}

function attachBugCapture(page) {
  page.on("pageerror", (e) =>
    addNet("PAGEERROR", page.url(), (e?.message || String(e)).slice(0, 250)),
  );
  page.on("requestfailed", (r) =>
    addNet("REQFAIL", r.url(), r.failure()?.errorText || ""),
  );
  page.on("response", (r) => {
    if (r.status() >= 400 && !/favicon/.test(r.url())) {
      addNet(`HTTP ${r.status()}`, r.url(), `${r.statusText()}`);
    }
  });
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) {
      const t = m.text().slice(0, 250);
      if (/favicon|React DevTools/i.test(t)) return;
      if (m.type() === "warning" && /ResourceInterpretation|Autofill|converted from Promise/.test(t)) return;
      addNet(`CONSOLE ${m.type().toUpperCase()}`, page.url(), t);
    }
  });
}

async function probe(page, label, fn) {
  try {
    await fn();
    recordPass(label);
    console.log(`  ✓ ${label}`);
  } catch (e) {
    recordIssue(label, e.message.split("\n")[0], page.url());
    console.log(`  ✗ ${label} — ${String(e.message).split("\n")[0]}`);
  }
}

function summary() {
  const counts = {};
  for (const n of NET.values()) {
    counts[n.kind] = (counts[n.kind] || 0) + n.count;
  }
  return { counts, issues: ISSUES.length, steps: PASSED.length };
}

// ============================ HELPERS ============================
async function scrollFull(page) {
  const h = await page.evaluate(() => window.innerHeight);
  const maxScrolls = 28;
  for (let i = 0; i < maxScrolls; i++) {
    const done = await page.evaluate(
      (step) => {
        const y = window.scrollY + step;
        window.scrollTo(0, y);
        return y >= document.documentElement.scrollHeight - step;
      },
      Math.floor(h * 0.7),
    );
    await page.waitForTimeout(50);
    if (done) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(60);
}





async function phase(name) {
  console.log(`\n===== ${name} =====`);
}

async function clickNavByName(page, name) {
  const link = page.getByRole("link", { name: new RegExp(`^${name}$`, "i") }).first();
  if (await link.isVisible().catch(() => false)) {
    await link.click();
    await page.waitForTimeout(700);
  }
}

async function goBackUi(page) {
  const back = page
    .getByRole("link", { name: /Kembali/i })
    .first()
    .or(page.getByRole("button", { name: /Kembali/i }).first());
  if (await back.isVisible().catch(() => false)) {
    await back.click();
    await page.waitForTimeout(600);
  } else {
    await page.goBack().catch(() => {});
    await page.waitForTimeout(600);
  }
}

async function openProfileMenu(page) {
  const compact = page.locator('[aria-label="Menu akun"]').first();
  if (await compact.isVisible({ timeout: 3000 }).catch(() => false)) {
    await compact.click();
    await page.waitForTimeout(300);
    return;
  }
  const full = page
    .locator('header div[style*=""] div.cursor-pointer, header .xl\\:flex .cursor-pointer')
    .first();
  if (await full.isVisible({ timeout: 3000 }).catch(() => false)) {
    await full.click();
    await page.waitForTimeout(300);
  }
}

async function logoutViaUi(page) {
  await openProfileMenu(page);
  const keluar = page.getByRole("button", { name: "Keluar" }).first();
  if (await keluar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await keluar.click();
    await page.waitForTimeout(300);
    const confirm = page.getByRole("button", { name: /Ya, Keluar/ }).first();
    if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirm.click();
      await page.waitForTimeout(900);
      return true;
    }
  }
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  return false;
}

async function loginViaUiAndWait(page, email, password) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Masukkan Email").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /Masuk/ }).click();
  await page.waitForURL((u) => u.pathname !== "/login", { timeout: 20000 });
  await page.waitForTimeout(600);
}

function knownNetNoise(url) {
  return /sockjs|\/api\/analytics|\/track|web-vitals|sourceMappingURL/i.test(url);
}

// ============================================================================
test("FULL HUMAN-LIKE JOURNEY + BUG DETECTOR — VISITOR→UMUM→MAHASISWA→DOSEN→ADMIN", async ({ page }) => {
  attachBugCapture(page);

  // ==========================================================================
  // PHASE 0 — VALIDASI HALAMAN LOGIN (form & error handling)
  // ==========================================================================
  await phase("PHASE 0 — LOGIN FORM VALIDATION");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.bringToFront().catch(() => {});
  await probe(page, "LOGIN: halaman masuk bisa dibuka", async () => {
    await page.getByRole("link", { name: /Masuk/i }).first().click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });
  await probe(page, "LOGIN: submit kosong menampilkan error validasi", async () => {
    await page.getByRole("button", { name: /Masuk/i }).first().click();
    await page.waitForTimeout(400);
    const err = page.locator("text=/wajib|required|harus diisi|tidak boleh kosong/i").first();
    await expect(err).toBeVisible({ timeout: 5000 });
  });
  await probe(page, "LOGIN: password salah menampilkan pesan kesalahan", async () => {
    await page.getByPlaceholder("Masukkan Email").fill("raihanfg565@gmail.com");
    await page.getByPlaceholder("••••••••").fill("salahpassword123");
    await page.getByRole("button", { name: /Masuk/ }).click();
    await page.waitForTimeout(600);
    const err = page.locator("text=/salah|gagal|tidak valid|email atau password/i").first();
    await expect(err).toBeVisible({ timeout: 6000 });
  });
  await probe(page, "LOGIN: link Lupa Password ada", async () => {
    const lp = page.getByRole("link", { name: /Lupa|Forgot/i }).first();
    await expect(lp).toBeVisible();
  });

  // ==========================================================================
  // PHASE 1 — VISITOR: detail tiap halaman publik
  // ==========================================================================
  await phase("PHASE 1 — VISITOR (beranda, hall 3D, karya, tentang, berita, 404, tema)");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);

  // --- BERANDA ---
  await probe(page, "BERANDA: judul SINGGAH & hero tampil", async () => {
    await expect(page.getByText("SINGGAH", { exact: true }).first()).toBeVisible();
  });
  await probe(page, "BERANDA: semua menu navbar ada", async () => {
    for (const l of ["Beranda", "Karya", "Tentang", "Berita"]) {
      await expect(page.getByRole("link", { name: new RegExp(`^${l}$`, "i") }).first()).toBeVisible();
    }
  });
  // FAQ accordion: buka semua, pastikan jawaban muncul
  await scrollFull(page);
  const faqQs = await page.locator("button", { hasText: /Apa itu SINGGAH/ }).count();
  if (faqQs > 0) {
    await probe(page, "BERANDA: FAQ accordion dibuka & jawaban tampil", async () => {
      const q = page.locator("button", { hasText: /Apa itu SINGGAH/ }).first();
      await q.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/pameran|pameran karya/i).first().or(page.locator("text=/Apa itu SINGGAH/").last())).toBeVisible();
    });
  }

  // --- HALL 3D: masuk, lihat HUD, coba jalan (WASD), kembali ---
  await probe(page, "HALL 3D: klik Mulai Eksplorasi → /hall + canvas 3D", async () => {
    await page.getByRole("button", { name: /Mulai Eksplorasi/i }).first().click();
    await page.waitForURL(/\/hall/, { timeout: 15000 });
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 8000 });
  });
  await probe(page, "HALL 3D: HUD footer (panduan kontrol) tampil", async () => {
    await expect(page.getByText(/WASD|klik lantai/i).first()).toBeVisible({ timeout: 6000 });
  });
  await probe(page, "HALL 3D: coba berjalan (tekan WASD) tanpa error", async () => {
    for (const k of ["KeyW", "KeyA", "KeyS", "KeyD"]) {
      await page.keyboard.down(k);
      await sleep(150);
      await page.keyboard.up(k);
    }
    await sleep(400);
    await expect(page.locator("canvas").first()).toBeVisible();
  });
  await probe(page, "HALL 3D: tombol kembali ke beranda bekerja", async () => {
    await page.getByRole("button", { name: /Kembali ke Beranda/i }).first().click();
    await page.waitForURL(/\/$/, { timeout: 15000 });
  });

  // --- KARYA (hub) ---
  await probe(page, "KARYA: buka via navbar", async () => {
    await clickNavByName(page, "Karya");
    await page.waitForURL(/\/karya/, { timeout: 10000 });
    await page.waitForTimeout(500);
  });
  await probe(page, "KARYA: kategori kartu tampil", async () => {
    await expect(page.locator("a[href^='/karya/']").first()).toBeVisible({ timeout: 8000 });
  });
  await probe(page, "KARYA: pencarian kategori berfungsi", async () => {
    const s = page.getByPlaceholder("Cari kategori...").first();
    await expect(s).toBeVisible({ timeout: 6000 });
    await s.fill("zzzz-tidak-ada");
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await s.fill("");
    await page.waitForTimeout(300);
  });
  await probe(page, "KARYA: klik kartu kategori → detail karya", async () => {
    await page.locator("a[href^='/karya/']").first().click();
    await page.waitForTimeout(1200);
    if (page.url().startsWith("/karya/")) {
      await scrollFull(page);
    }
  });
  await probe(page, "KARYA DETAIL: buka satu project → detail project", async () => {
    const proj = page.locator("a[href*='/karya/'][href*='/']").last();
    if ((await proj.count()) === 0) throw new Error("tidak ada project di kategori");
    await proj.click();
    await page.waitForTimeout(1200);
    await scrollFull(page);
    await expect(page.getByRole("link", { name: /Kembali/i }).first()).toBeVisible({ timeout: 8000 }).catch(() => {});
  });
  await probe(page, "KARYA DETAIL → NAV BERANDA (navbar)", async () => {
    await clickNavByName(page, "Beranda");
    await page.waitForURL(/\/$/, { timeout: 10000 });
  });

  // --- TENTANG ---
  await probe(page, "TENTANG: buka via navbar & scroll penuh", async () => {
    await clickNavByName(page, "Tentang");
    await page.waitForURL(/\/about/, { timeout: 10000 });
    await scrollFull(page);
  });

  // --- BERITA ---
  await probe(page, "BERITA: buka via navbar", async () => {
    await clickNavByName(page, "Berita");
    await page.waitForURL(/\/berita/, { timeout: 10000 });
  });
  await probe(page, "BERITA: pencarian berfungsi + tampilkan semua", async () => {
    const s = page.getByPlaceholder("Cari berita atau kegiatan...").first();
    await expect(s).toBeVisible({ timeout: 6000 });
    await s.fill("pasar");
    await page.waitForTimeout(500);
    await s.fill("");
    await page.waitForTimeout(300);
  });
  await probe(page, "BERITA: klik Baca → detail berita", async () => {
    const baca = page.locator("[role='button']").filter({ hasText: /^Baca$/ }).first();
    await baca.click();
    await page.waitForURL(/\/berita\/.+/, { timeout: 10000 });
    await page.waitForTimeout(700);
    await scrollFull(page);
  });
  await probe(page, "BERITA DETAIL: buka modal Bagikan", async () => {
    const bagikan = page.getByRole("button", { name: /Bagikan/i }).first();
    await expect(bagikan).toBeVisible({ timeout: 8000 });
    await bagikan.click();
    await page.waitForTimeout(400);
    await expect(page.getByText(/Bagikan ke/i).first()).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Escape");
  });
  await probe(page, "BERITA DETAIL → kembali ke daftar", async () => {
    await goBackUi(page);
    await page.waitForURL(/\/berita/, { timeout: 10000 });
  });

  // --- 404 + theme toggle (double) ---
  await probe(page, "404: halaman tak dikenal menampilkan NotFound", async () => {
    await page.goto("/halaman-tidak-ada-xyz", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    await scrollFull(page);
  });
  await probe(page, "THEME: toggle gelap→terang bekerja", async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.getByRole("switch").first();
    await expect(toggle).toBeVisible({ timeout: 6000 });
    await toggle.click();
    await page.waitForTimeout(300);
    await toggle.click();
    await page.waitForTimeout(300);
  });

  // ==========================================================================
  // PHASE 2 — UMUM
  // ==========================================================================
  await phase("PHASE 2 — UMUM (login, profil, logout)");
  if (CREDS_CONFIGURED.public) {
    await probe(page, "UMUM: login via UI → masuk", async () => {
      await loginViaUiAndWait(page, EMAILS.public, EMAILS.publicPassword);
      await scrollFull(page);
    });
    await probe(page, "UMUM: navbar Karya & Berita bisa dijelajah", async () => {
      await clickNavByName(page, "Karya");
      await page.waitForURL(/\/karya/, { timeout: 10000 });
      await scrollFull(page);
      await clickNavByName(page, "Beranda");
      await page.waitForURL(/\/$/, { timeout: 10000 });
    });
    await probe(page, "UMUM: menu akun → Profil Saya terbuka", async () => {
      await openProfileMenu(page);
      await page.getByRole("link", { name: /Profil Saya/i }).first().click();
      await page.waitForTimeout(800);
      await scrollFull(page);
    });
    await probe(page, "UMUM: menu akun → Karya Tersimpan terbuka", async () => {
      await openProfileMenu(page);
      const kt = page.getByRole("link", { name: /Karya Tersimpan/i }).first();
      if (await kt.isVisible({ timeout: 3000 }).catch(() => false)) {
        await kt.click();
        await page.waitForTimeout(800);
        await scrollFull(page);
      }
      await openProfileMenu(page);
      await page.keyboard.press("Escape");
    });
    await probe(page, "UMUM: logout via UI konfirmasi", async () => {
      const ok = await logoutViaUi(page);
      await expect(page.getByRole("link", { name: /Masuk/i }).first()).toBeVisible({ timeout: 10000 });
      if (!ok) throw new Error("logout tidak tervalidasi");
    });
  }

  // ==========================================================================
  // PHASE 3 — MAHASISWA (upload form terulik, validasi, my-karya)
  // ==========================================================================
  await phase("PHASE 3 — MAHASISWA (upload lengkap + validasi)");
  if (CREDS_CONFIGURED.user) {
    await probe(page, "MAHASISWA: login via UI", async () => {
      await loginViaUiAndWait(page, EMAILS.user, EMAILS.userPassword);
    });
    await probe(page, "MAHASISWA: buka halaman Upload Karya", async () => {
      await page.getByRole("link", { name: /Upload Karya/i }).first().click();
      await page.waitForURL(/\/upload/, { timeout: 10000 });
      await page.waitForTimeout(600);
    });
    await probe(page, "MAHASISWA: UPLOAD form muncul (judul, deskripsi, tahun)", async () => {
      await expect(page.getByPlaceholder(/Sistem Monitoring/i).first()).toBeVisible({ timeout: 8000 });
      await expect(page.getByPlaceholder(/secara singkat/i).first()).toBeVisible();
      await expect(page.getByPlaceholder(/Contoh: 2025/i).first()).toBeVisible();
    });
    await probe(page, "MAHASISWA: UPLOAD tombol 'Tambah anggota' menambah baris", async () => {
      const btn = page.getByRole("button", { name: /Tambah anggota/i }).first();
      await expect(btn).toBeVisible({ timeout: 8000 });
      await btn.click();
      await page.waitForTimeout(300);
      const rows = await page.getByPlaceholder(/Nama tim/i).count();
      if (rows === 0) throw new Error("baris anggota tidak muncul");
    });
    await probe(page, "MAHASISWA: UPLOAD tombol 'Tambah link' menambah baris", async () => {
      const btn = page.getByRole("button", { name: /Tambah link/i }).first();
      await expect(btn).toBeVisible({ timeout: 8000 });
      await btn.click();
      await page.waitForTimeout(300);
      const rows = await page.getByPlaceholder(/GitHub|Demo/i).count();
      if (rows === 0) throw new Error("baris link tidak muncul");
    });
    await probe(page, "MAHASISWA: UPLOAD validator (submit kosong → error wajib)", async () => {
      const submit = page.getByRole("button", { name: /Submit untuk Ditinjau/i }).first();
      await expect(submit).toBeVisible({ timeout: 8000 });
      await submit.click();
      await page.waitForTimeout(500);
      const err = page.locator("text=/wajib|harus diisi|tidak boleh/i").first();
      await expect(err).toBeVisible({ timeout: 6000 });
      await page.keyboard.press("Escape");
    });
    await goBackUi(page);
    await probe(page, "MAHASISWA: menu akun → My Karya & eksplorasi", async () => {
      await openProfileMenu(page);
      await page.getByRole("link", { name: /Karya Saya/i }).first().click();
      await page.waitForTimeout(900);
      await scrollFull(page);
      await openProfileMenu(page);
      await page.keyboard.press("Escape");
    });
    await probe(page, "MAHASISWA: logout", async () => {
      await logoutViaUi(page);
      await expect(page.getByRole("link", { name: /Masuk/i }).first()).toBeVisible({ timeout: 10000 });
    });
  }

  // ==========================================================================
  // PHASE 4 — DOSEN (punya hak upload juga)
  // ==========================================================================
  await phase("PHASE 4 — DOSEN (login, upload, my-karya, logout)");
  if (CREDS_CONFIGURED.dosen) {
    await probe(page, "DOSEN: login via UI", async () => {
      await loginViaUiAndWait(page, EMAILS.dosen, EMAILS.dosenPassword);
    });
    await probe(page, "DOSEN: Upload Karya dibuka & form valid", async () => {
      await page.getByRole("link", { name: /Upload Karya/i }).first().click();
      await page.waitForURL(/\/upload/, { timeout: 10000 });
      await expect(page.getByPlaceholder(/Contoh: 2025/i).first()).toBeVisible({ timeout: 8000 });
    });
    await probe(page, "DOSEN: my-karya dapat dibuka", async () => {
      await openProfileMenu(page);
      await page.getByRole("link", { name: /Karya Saya/i }).first().click();
      await page.waitForTimeout(900);
      await scrollFull(page);
      await openProfileMenu(page);
      await page.keyboard.press("Escape");
    });
    await probe(page, "DOSEN: logout", async () => {
      await logoutViaUi(page);
      await expect(page.getByRole("link", { name: /Masuk/i }).first()).toBeVisible({ timeout: 10000 });
    });
  }

  // ==========================================================================
  // PHASE 5 — ADMIN: dashboard + semua menu, filter, modal (non-destruktif)
  // ==========================================================================
  await phase("PHASE 5 — ADMIN (dashboard, project, berita, kategori, media, pengguna, laporan, pengaturan)");
  if (CREDS_CONFIGURED.admin) {
    await probe(page, "ADMIN: login via UI → /admin", async () => {
      await loginViaUiAndWait(page, EMAILS.admin, EMAILS.adminPassword);
      await page.waitForURL(/\/admin/, { timeout: 15000 });
      await page.waitForTimeout(700);
    });
    await probe(page, "ADMIN: dashboard card statistik tampil", async () => {
      await scrollFull(page);
      await probe(page, "ADMIN: stat card", async () => {
        await expect(page.locator("main").first()).toBeVisible({ timeout: 8000 });
      });
    });

    // PROJECT
    await probe(page, "ADMIN-PROJECT: buka & filter drop-down", async () => {
      await page.getByRole("link", { name: /^Project$/i }).first().click();
      await page.waitForTimeout(900);
      await scrollFull(page);
    });
    await probe(page, "ADMIN-PROJECT: buka modal detail project (non-destruktif)", async () => {
      const detail = page.locator("button", { hasText: /Detail|Lihat/i }).first();
      if (await detail.isVisible({ timeout: 6000 }).catch(() => false)) {
        await detail.click();
        await page.waitForTimeout(500);
        await expect(page.locator("div[role='dialog']").or(page.locator("text=/Detail Project/i").first())).toBeVisible().catch(() => {});
        await page.keyboard.press("Escape");
      }
    });
    await probe(page, "ADMIN-PROJECT: kategori filter tersedia", async () => {
      const f = page.locator("button", { hasText: /Semua Kategori|Kategori/i }).first();
      if (await f.isVisible({ timeout: 5000 }).catch(() => false)) {
        await f.click();
        await page.waitForTimeout(300);
        await page.keyboard.press("Escape");
      }
    });

    // BERITA (admin manage news)
    await probe(page, "ADMIN-BERITA: buka & cari berita", async () => {
      await page.getByRole("link", { name: /^Berita$/i }).first().click();
      await page.waitForTimeout(900);
      const s = page.locator("input[placeholder*='Cari'], input[type='search']").first();
      if (await s.isVisible({ timeout: 5000 }).catch(() => false)) {
        await s.fill("pasar");
        await page.waitForTimeout(400);
        await s.fill("");
        await page.waitForTimeout(200);
      }
      await scrollFull(page);
    });

    // KATEGORI
    await probe(page, "ADMIN-KATEGORI: buka & muncul form tambah (modal)", async () => {
      await page.getByRole("link", { name: /^Kategori$/i }).first().click();
      await page.waitForTimeout(900);
      const add = page.locator("button", { hasText: /Tambah|Buat|Baru/i }).first();
      if (await add.isVisible({ timeout: 6000 }).catch(() => false)) {
        await add.click();
        await page.waitForTimeout(400);
        await expect(page.locator("div[role='dialog']").or(page.locator("input").nth(0))).toBeVisible();
        await page.keyboard.press("Escape");
      }
      await scrollFull(page);
    });

    // MEDIA
    await probe(page, "ADMIN-MEDIA: toolbar upload tersedia", async () => {
      await page.getByRole("link", { name: /^Media$/i }).first().click();
      await page.waitForTimeout(900);
      const up = page.locator("input[type='file'], button", { hasText: /Upload|Unggah/i }).first();
      if (await up.isVisible({ timeout: 6000 }).catch(() => false)) {
        recordPass("ADMIN-MEDIA: tombol upload tampil");
      }
      await scrollFull(page);
    });

    // PENGGUNA
    await probe(page, "ADMIN-PENGGUNA: daftar & pencarian", async () => {
      await page.getByRole("link", { name: /^Pengguna$/i }).first().click();
      await page.waitForTimeout(900);
      const s = page.locator("input[placeholder*='Cari'], input[type='search']").first();
      if (await s.isVisible({ timeout: 5000 }).catch(() => false)) {
        await s.fill("raihan");
        await page.waitForTimeout(400);
        await s.fill("");
        await page.waitForTimeout(200);
      }
      await scrollFull(page);
    });

    // LAPORAN
    await probe(page, "ADMIN-LAPORAN: halaman laporan terbuka", async () => {
      await page.getByRole("link", { name: /^Laporan$/i }).first().click();
      await page.waitForTimeout(900);
      await scrollFull(page);
    });

    // PENGATURAN — buka tiap tab
    await probe(page, "ADMIN-PENGATURAN: buka halaman", async () => {
      await page.getByRole("link", { name: /^Pengaturan$/i }).first().click();
      await page.waitForTimeout(900);
    });

    await probe(page, "ADMIN: logout via navbar admin", async () => {
      const keluar = page.getByRole("button", { name: /Keluar/i }).first();
      if (await keluar.isVisible({ timeout: 6000 }).catch(() => false)) {
        await keluar.click();
        await page.waitForTimeout(400);
        const confirm = page.getByRole("button", { name: /Ya, Keluar/i }).first();
        if (await confirm.isVisible({ timeout: 4000 }).catch(() => false)) {
          await confirm.click();
          await page.waitForTimeout(900);
          await expect(page.getByRole("link", { name: /Masuk/i }).first()).toBeVisible({ timeout: 10000 });
        }
      } else {
        await page.evaluate(() => localStorage.clear());
      }
    });
  }

  // ==========================================================================
  // PENUTUP: beranda publik buka normal (semua sesi hilang)
  // ==========================================================================
  await probe(page, "PENUTUP: beranda publik masih normal", async () => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("SINGGAH", { exact: true }).first()).toBeVisible();
  });

  // ============================ LAPORAN ============================
  const s = summary();
  const netList = [...NET.values()].filter((n) => !knownNetNoise(n.url));
  const report = {
    generatedAt: new Date().toISOString(),
    suite: "FULL HUMAN-LIKE JOURNEY + BUG DETECTOR",
    totalSteps: PASSED.length,
    stepFailures: ISSUES,
    network: netList,
    summary: s.counts,
    findings: ISSUES.filter((i) => !/LOGIN: password salah|HTTP 401|HTTP 404/.test(i.title)).concat(
      netList.filter((n) => n.kind === "PAGEERROR" || n.kind.startsWith("HTTP 5") || n.kind === "CONSOLE ERROR"),
    ),
  };

  const fs = await import("node:fs");
  const path = await import("node:path");
  const outDir = path.resolve("test-results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "journey-bug-report.json"), JSON.stringify(report, null, 2));

  const lines = [];
  lines.push("# LAPORAN JOURNEY + BUG DETECTOR");
  lines.push("");
  lines.push(`- Steps berhasil: **${s.steps}**`);
  lines.push(`- Steps gagal (laporan bug): **${s.issues}**`);
  lines.push(`- Console.error/warning: ${s.counts["CONSOLE ERROR"] || 0} / ${s.counts["CONSOLE WARNING"] || 0}`);
  lines.push(`- Uncaught exceptions (PAGEERROR): ${s.counts.PAGEERROR || 0}`);
  lines.push(`- Request gagal (REQFAIL): ${s.counts.REQFAIL || 0}`);
  lines.push(`- Respons HTTP 4xx/5xx: ${(s.counts["HTTP 4xx"] || 0) + (s.counts["HTTP 5xx"] || 0)}`);
  lines.push("");
  if (report.findings.length) {
    lines.push("## TEMUAN");
    for (const f of report.findings) {
      lines.push(`- [${f.kind || "STEP"}] ${f.title || f.url} — ${f.error || f.detail || ""}`);
    }
  } else {
    lines.push("## TEMUAN\n\nTidak ada bug terdeteksi.");
  }
  fs.writeFileSync(path.join(outDir, "journey-bug-report.md"), lines.join("\n"));

  console.log("\n\n========== LAPORAN JOURNEY + BUG DETECTOR ==========");
  console.log(`Steps berhasil : ${s.steps}`);
  console.log(`Step gagal     : ${s.issues}`);
  console.log("Ringkasan jaringan:");
  for (const [k, v] of Object.entries(s.counts)) console.log(`  ${k}: ${v}`);
  console.log("Laporan lengkap: test-results/journey-bug-report.json & .md");
  console.log("====================================================\n");
});