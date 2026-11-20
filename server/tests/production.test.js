// Target default adalah api.singgah.site production. Override lewat env untuk
// menguji deployment lain tanpa mengubah kode:
//   API_URL=https://api.contoh.site FRONTEND_URL=https://contoh.site \
//     npx jest tests/production.test.js
const BASE_URL = (
  process.env.API_URL || "https://api.singgah.site"
).replace(/\/+$/, "");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://singgah.site"
).replace(/\/+$/, "");

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }

  return {
    status: response.status,
    body,
  };
}

describe("Production API Smoke Test", () => {
  const endpoints = [
    { name: "Categories", path: "/api/categories" },
    { name: "News", path: "/api/news" },
    { name: "Settings", path: "/api/settings" },
    { name: "Projects", path: "/api/projects" },
    { name: "Stats", path: "/api/stats" },
    { name: "Hall", path: "/api/hall" },
    { name: "Notifications", path: "/api/notifications" },
    { name: "Dashboard", path: "/api/dashboard" },
    { name: "Users", path: "/api/users" },
  ];

  test.each(endpoints)("$name → tidak boleh 500", async ({ path }) => {
    const result = await request(path);

    console.log(
      `${result.status} ${path}`,
      typeof result.body === "object"
        ? JSON.stringify(result.body)
        : result.body,
    );

    expect(result.status).toBeLessThan(500);
  });
});

// Default-nya deployment SINGGAH, jadi `npm test` tanpa env var apa pun tetap
// menguji frontend + backend sungguhan. Kosongkan lewat FRONTEND_URL= kalau
// sengaja mau menonaktifkan bagian ini:
//   FRONTEND_URL= npx jest tests/production.test.js
// Frontend dan backend sekarang memakai domain berbeda, jadi keduanya dicek
// langsung: singgah.site untuk halaman, api.singgah.site untuk data.
describe("Production Frontend (singgah.site)", () => {
  test("halaman utama harus 200", async () => {
    const response = await fetch(FRONTEND_URL, { redirect: "follow" });
    expect(response.status).toBe(200);
  });

  test("backend yang dipakai frontend harus hidup", async () => {
    const response = await fetch(`${BASE_URL}/api/categories`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
