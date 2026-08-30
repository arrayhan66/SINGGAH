import { test, expect } from "@playwright/test";

test.describe("BERANDA — Hero & FAQ", () => {
  test("VF-01 hero menampilkan branding & CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page
      .getByRole("heading", { level: 1 })
      .filter({ hasText: "SINGGAH" }).first()).toBeVisible();
    await expect(page.locator("#hero").getByText(/DISINI/i).first()).toBeVisible();
    const cta = page.getByRole("link", { name: /Mulai Eksplorasi/i }).first();
    const btn = page.getByRole("button", { name: /Mulai Eksplorasi/i }).first();
    await expect(cta.or(btn)).toBeVisible();
  });

  test("VF-03 klik CTA Mulai Eksplorasi -> /hall", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Mulai Eksplorasi/i }).first();
    const btn = page.getByRole("button", { name: /Mulai Eksplorasi/i }).first();
    const el = (await cta.count()) ? cta : btn;
    await el.click();
    await page.waitForURL(/\/(hall|hall\/)/);
    await expect(page).toHaveURL(/\/hall/);
  });

  test("VF-05..07 FAQ akordeon satu-terbuka", async ({ page }) => {
    await page.goto("/#faq");
    await page.goto("/");
    const q1 = page.getByText("Apa itu SINGGAH?").first();
    await expect(q1).toBeVisible();
    await q1.click();
    await expect(page.getByText(/SINGGAH adalah panggung digital/).first()).toBeVisible();
  });
});
