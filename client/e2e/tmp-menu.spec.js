import { test, expect } from "@playwright/test";

const FAKE_USER = {
  id: 1,
  name: "Ilhammm",
  role: "user",
  tipe: "mahasiswa",
  avatar: null,
};

test("mobile hamburger menu: item clickable + timing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { data: FAKE_USER } }),
  );

  await page.addInitScript(([token, user]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }, ["fake-token", FAKE_USER]);

  await page.goto("/");

  // Open hamburger
  const burger = page.getByRole("button", { name: "Toggle menu" });
  await burger.click();
  await page.waitForTimeout(900); // let stagger animation settle

  const beranda = page.getByRole("link", { name: /Beranda/ }).last();
  const tentang = page.getByRole("link", { name: /Tentang/ }).last();

  await expect(beranda).toBeVisible();

  const t0 = Date.now();
  await tentang.click();
  await page.waitForURL(/\/about/, { timeout: 6000 }).catch(() => {});
  const elapsed = Date.now() - t0;

  console.log("NAV_TIME_MS=", elapsed);
  console.log("URL=", page.url());
  expect(page.url()).toContain("/about");
});