import { test, expect } from "@playwright/test";
import { loginViaState, loginViaUi, EMAILS, CREDS_CONFIGURED } from "./helpers";

test.describe("SEKURITI & AKSES KONTROL (E2E)", () => {
  test.describe("Proteksi route per role", () => {
    test("SEC-01: umum tidak bisa akses /upload (diblokir)", async ({ page }) => {
      test.skip(!CREDS_CONFIGURED.public, "TEST_PUBLIC_* belum disetel");
      await loginViaState(page, EMAILS.public, EMAILS.publicPassword);
      await page.goto("/upload");
      // umum -> diarahkan ke "/"
      await page.waitForURL((u) => u.pathname === "/");
      await expect(page).toHaveURL(/\/$/);
    });

    test("SEC-02: mahasiswa bisa akses /upload", async ({ page }) => {
      test.skip(!CREDS_CONFIGURED.user, "TEST_USER_* belum disetel");
      await loginViaState(page, EMAILS.user, EMAILS.userPassword);
      await page.goto("/upload");
      await expect(page.getByText(/Bagikan karya terbaikmu/i).first()).toBeVisible();
    });

    test("SEC-03: mahasiswa (bukan admin) tidak bisa akses /admin", async ({ page }) => {
      test.skip(!CREDS_CONFIGURED.user, "TEST_USER_* belum disetel");
      await loginViaState(page, EMAILS.user, EMAILS.userPassword);
      await page.goto("/admin");
      await page.waitForURL((u) => u.pathname !== "/admin");
      await expect(page).not.toHaveURL(/\/admin/);
    });

    test("SEC-04: belum login akses /profile -> /login", async ({ page }) => {
      await page.goto("/profile");
      await page.waitForURL(/\/login/);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Alur login & redirect", () => {
    test("SEC-05: login admin via UI berhasil ke /admin", async ({ page }) => {
      test.skip(!CREDS_CONFIGURED.admin, "TEST_ADMIN_* belum disetel");
      await loginViaUi(page, EMAILS.admin, EMAILS.adminPassword);
      await page.waitForURL(/\/admin/, { timeout: 15000 });
      await expect(page).toHaveURL(/\/admin/);
    });

    test("SEC-06: login salah password -> muncul error", async ({ page }) => {
      await page.goto("/login");
      await page.getByPlaceholder("Masukkan Email").fill(EMAILS.admin);
      await page.getByPlaceholder("••••••••").fill("pasti-salah-password-xyz");
      await page.getByRole("button", { name: /Masuk/i }).click();
      await expect(page.locator("[role='alert'], .text-red-400, .text-red-500").first()).toBeVisible();
    });

    test("SEC-07: GuestRoute — sudah login ketik /login -> redirect", async ({ page }) => {
      test.skip(!CREDS_CONFIGURED.admin, "TEST_ADMIN_* belum disetel");
      await loginViaState(page, EMAILS.admin, EMAILS.adminPassword);
      await page.goto("/login");
      await page.waitForURL(/\/admin/);
      await expect(page).toHaveURL(/\/admin/);
    });
  });
});
