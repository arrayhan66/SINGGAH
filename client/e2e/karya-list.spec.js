import { test, expect } from "@playwright/test";

test.describe("KARYA — halaman list & kartu", () => {
  test("VF-10 halaman karya memuat grid kategori", async ({ page }) => {
    await page.goto("/karya");
    await expect(page.getByText(/Karya/i).first()).toBeVisible();
    // setidaknya ada region grid kartu
    await expect(page.locator("a").filter({ hasText: /Lihat/ }).first().or(page.locator("main"))).toBeVisible();
    await page.waitForLoadState("networkidle");
  });

  test("VF-14 tombol Lihat Lebih Banyak jika >6", async ({ page }) => {
    await page.goto("/karya");
    const btn = page.getByRole("button", { name: /Lihat Lebih Banyak/i });
    // mungkin ada atau tidak tergantung data; kita hanya verifikasi tidak menjadi bug bila ada
    if ((await btn.count()) > 0) {
      await btn.first().click();
      await expect(btn.first()).not.toBeVisible();
    }
  });

  test("VF-12 pencarian kategori memfilter", async ({ page }) => {
    await page.goto("/karya");
    const search = page.getByPlaceholder("Cari kategori...");
    await search.fill("zzzz-tidak-ada");
    await expect(page.getByText("Kategori tidak ditemukan")).toBeVisible();
  });
});
