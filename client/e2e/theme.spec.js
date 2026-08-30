import { test, expect } from "@playwright/test";

test.describe("TEMA dark/light", () => {
  test("TH-01 default mode light (html punya class light)", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("singgah-theme"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("TH-02 toggle berpindah ke dark + aria-checked berubah", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("singgah-theme"));
    await page.goto("/");
    const toggle = page.getByRole("switch");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).not.toHaveClass(/light/);
  });

  test("TH-03 tema dipertahankan setelah reload", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("singgah-theme", "dark"));
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/light/);
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/light/);
  });
});
