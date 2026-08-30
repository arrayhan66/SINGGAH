import { test, expect } from "@playwright/test";

// Register & alur lupa password — diuji utk VALIDASI form (tidak submit nyata
// agar tidak membuat akun/data baru di backend). Perilaku lintas state diuji lewat
// pengecekan gating localStorage pada route guard.

test.describe("REGISTER — form", () => {
  test("AF-15 langkah 1 'Daftar Sebagai' punya 3 pilihan tipe", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Daftar Sebagai").first()).toBeVisible();
    await expect(page.getByText("Umum", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Mahasiswa", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Dosen", { exact: true }).first()).toBeVisible();
  });

  test("AF-17 username ilegal -> validasi", async ({ page }) => {
    await page.goto("/register");
    // pilih Mahasiswa -> Selanjutnya ke step 2
    await page.getByText("Mahasiswa", { exact: true }).first().click();
    await page.getByRole("button", { name: /Selanjutnya/i }).first().click();

    // step 2: [0]=Nama, [1]=Username, [2]=Email
    const inputs = page.locator("input");
    await inputs.nth(0).fill("Nama Uji");
    await inputs.nth(1).fill("ab"); // username terlalu pendek
    await inputs.nth(2).fill("uji@example.com");
    await page.getByRole("button", { name: /Selanjutnya/i }).first().click();

    await expect(
      page.getByText(/Username minimal 3 karakter dan hanya boleh huruf, angka, dan underscore/i),
    ).toBeVisible();
  });
});

test.describe("LUPA PASSWORD — form", () => {
  test("AF-36 email kosong -> validasi", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("button", { name: /Kirim Kode Verifikasi/i }).click();
    await expect(page.getByText("Email tidak boleh kosong.")).toBeVisible();
  });

  test("AF-45 route guard /reset-password tanpa otpVerified -> /forgot-password", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("otpVerified");
      localStorage.removeItem("resetEmail");
    });
    await page.goto("/reset-password");
    await page.waitForURL(/\/forgot-password/);
  });
});
