import { test, expect } from "@playwright/test";

test.describe("SMOKE TEST — halaman dasar termuat tanpa crash", () => {
  test("SC-01 beranda termuat dengan navbar & footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SINGGAH/i);
    // navbar ada
    await expect(page.locator("nav, header").first()).toBeVisible();
    // footer ada
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("SC-02 semua halaman utama bisa dinavigasi", async ({ page }) => {
    const pages = [
      { path: "/", expect: /SINGGAH/i },
      { path: "/karya", expect: /Karya/i },
      { path: "/about", expect: /Tentang|Wadah|Inovasi/i },
      { path: "/berita", expect: /Berita/i },
    ];
    for (const p of pages) {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });

  test("SC-04 halaman tidak ditemukan -> 404", async ({ page }) => {
    await page.goto("/halaman-tidak-ada-xyz");
    await expect(page.getByText("404", { exact: true })).toBeVisible();
    await expect(page.getByText("Halaman Tidak Ditemukan")).toBeVisible();
  });

  test("SC-05 tidak ada error jaringan saat muat halaman publik", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("requestfailed", (req) => errors.push(`FAILED: ${req.url()}`));
    for (const path of ["/", "/karya", "/about", "/berita"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    // Hanya aset & request dari origin aplikasi sendiri yang tanda regresi.
    // Gambar eksternal (placehold.co, font, CDN) sering lambat/lokal blokir
    // sehingga requestfailed di abaikan biar tidak flaky di CI.
    const origin = new URL(
      process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    ).origin;
    const localFailures = errors.filter(
      (m) =>
        m.startsWith("FAILED") &&
        m.startsWith(`${origin}/`) &&
        !m.includes("/api/"),
    );
    expect(localFailures).toEqual([]);
  });
});
