import { test, expect } from "@playwright/test";
import { loginViaState, EMAILS, CREDS_CONFIGURED } from "./helpers";

// Semua tes admin butuh kredensial admin via env. Jika tidak disetel, tes di-skip.
const hasAdmin = () => CREDS_CONFIGURED.admin;

test.describe("ADMIN — dashboard & kelola", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAdmin(), "TEST_ADMIN_* belum disetel di .env.test");
    await loginViaState(page, EMAILS.admin, EMAILS.adminPassword);
  });

  test("AD-01 dashboard menampilkan statistik", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Total Project").first()).toBeVisible();
    await expect(page.getByText("Total Berita").first()).toBeVisible();
  });

  test("AD-10 kelola project termuat", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText("Kelola Project").first()).toBeVisible();
  });

  test("AD-20 kelola berita (RoleSplit) termuat", async ({ page }) => {
    await page.goto("/berita");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("AD-31 kelola user termuat", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText("Total User").first()).toBeVisible();
  });

  test("AD-40 kelola kategori termuat", async ({ page }) => {
    await page.goto("/kategori");
    await expect(page.getByRole("button", { name: /Tambah Kategori/i }).first()).toBeVisible();
  });
});

test.describe("ADMIN — akses kontrol", () => {
  test("AD-05 bukan-admin tidak bisa /admin", async ({ page }) => {
    test.skip(!CREDS_CONFIGURED.user, "TEST_USER_* belum disetel");
    await loginViaState(page, EMAILS.user, EMAILS.userPassword);
    await page.goto("/admin");
    await page.waitForURL((u) => u.pathname !== "/admin");
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
