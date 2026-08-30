import { request } from "@playwright/test";
import "dotenv/config";

export const EMAILS = {
  admin: process.env.TEST_ADMIN_EMAIL || "admin@example.com",
  adminPassword: process.env.TEST_ADMIN_PASSWORD || "changeme",
  user: process.env.TEST_USER_EMAIL || "mahasiswa@example.com",
  userPassword: process.env.TEST_USER_PASSWORD || "changeme",
  dosen: process.env.TEST_DOSEN_EMAIL || "dosen@example.com",
  dosenPassword: process.env.TEST_DOSEN_PASSWORD || "changeme",
  public: process.env.TEST_PUBLIC_EMAIL || "umum@example.com",
  publicPassword: process.env.TEST_PUBLIC_PASSWORD || "changeme",
};

// True jika kredensial belum diisi (masih placeholder). Tes yang butuh login akan di-skip.
const isPlaceholder = (email, pass) =>
  !email || !pass || pass === "changeme" || email.includes("@example.com") || email.includes("@example");

export const CREDS_CONFIGURED = {
  admin: !isPlaceholder(process.env.TEST_ADMIN_EMAIL, process.env.TEST_ADMIN_PASSWORD),
  user: !isPlaceholder(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD),
  dosen: !isPlaceholder(process.env.TEST_DOSEN_EMAIL, process.env.TEST_DOSEN_PASSWORD),
  public: !isPlaceholder(process.env.TEST_PUBLIC_EMAIL, process.env.TEST_PUBLIC_PASSWORD),
};

export const SLUGS = {
  karya: process.env.TEST_KARYA_SLUG || "website",
  project: process.env.TEST_PROJECT_SLUG || "nama-project",
  berita: process.env.TEST_BERITA_SLUG || "slug-berita",
  hall: process.env.TEST_HALL_CATEGORY || "website",
};

/**
 * Login via UI. Setelah itu simpan auth state agar test lain bisa pakai.
 */
export async function loginViaUi(page, email, password) {
  await page.goto("/login");
  await page.getByPlaceholder("Masukkan Email").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /Masuk/ }).click();
}

/**
 * Login via API dan dapatkan token + user (untuk skip UI login bila perlu).
 */
export async function loginViaApi(email, password) {
  const api = await request.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
  });
  const res = await api.post("/api/auth/login", { data: { email, password } });
  const json = await res.json();
  if (!res.ok()) throw new Error(`Login gagal: ${json.message}`);
  return json.data;
}

/**
 * Helper login langsung set localStorage (industri umum untuk E2E),
 * supaya tidak harus melalui klik tiap kali.
 */
export async function loginViaState(page, email, password) {
  const data = await loginViaApi(email, password);
  await page.goto("/");
  await page.evaluate(
    ([token, user]) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    [data.token, data.user],
  );
}
