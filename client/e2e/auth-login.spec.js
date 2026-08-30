import { test, expect } from "@playwright/test";
import { EMAILS, CREDS_CONFIGURED } from "./helpers";

test.describe("LOGIN", () => {
  test("AF-02 submit kosong -> validasi", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Masuk/i }).click();
    await expect(page.getByText("Email tidak boleh kosong.")).toBeVisible();
    await expect(page.getByText("Kata sandi tidak boleh kosong.")).toBeVisible();
  });

  test("AF-03 email format salah", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Masukkan Email").fill("bukan-email");
    await page.getByPlaceholder("••••••••").fill("123456");
    await page.getByRole("button", { name: /Masuk/i }).click();
    await expect(page.getByText("Format email tidak valid (contoh: nama@email.com).")).toBeVisible();
  });

  test("AF-04 password <6 karakter", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Masukkan Email").fill("a@b.com");
    await page.getByPlaceholder("••••••••").fill("12345");
    await page.getByRole("button", { name: /Masuk/i }).click();
    await expect(page.getByText("Kata sandi minimal 6 karakter.")).toBeVisible();
  });

  test("AF-11 hover 'Lupa sandi?' & 'Daftar' memunculkan underline (regresi)", async ({ page }) => {
    await page.goto("/login");
    const lupa = page.getByRole("link", { name: /Lupa sandi/i });
    await lupa.hover();
    await expect(lupa).toHaveCSS("text-decoration-line", "underline");
    const daftar = page.getByRole("link", { name: /Daftar/i });
    await daftar.hover();
    await expect(daftar).toHaveCSS("text-decoration-line", "underline");
  });

  test("AF-06 admin login -> /admin", async ({ page }) => {
    test.skip(!CREDS_CONFIGURED.admin, "TEST_ADMIN_* belum disetel — isi di .env.test");
    await page.goto("/login");
    await page.getByPlaceholder("Masukkan Email").fill(EMAILS.admin);
    await page.getByPlaceholder("••••••••").fill(EMAILS.adminPassword);
    await page.getByRole("button", { name: /Masuk/i }).click();
    await page.waitForURL(/\/admin/);
    await expect(page).toHaveURL(/\/admin/);
  });

  test("AF-09 login kredensial salah -> pesan error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Masukkan Email").fill("tidak@ada.example");
    await page.getByPlaceholder("••••••••").fill("salahpass1A");
    await page.getByRole("button", { name: /Masuk/i }).click();
    // salah satu dari: pesan API atau fallback
    await expect(page.locator("[role='alert'], .text-red-400, .text-red-500").first()).toBeVisible();
  });
});
