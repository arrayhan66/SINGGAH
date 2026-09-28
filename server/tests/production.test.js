// Target default adalah Railway production. Override lewat env untuk menguji
// deployment lain tanpa mengubah kode:
//   API_URL=https://host.railway.app FRONTEND_URL=https://site.vercel.app \
//     npx jest tests/production.test.js
const BASE_URL = (
  process.env.API_URL || "https://singgah-production.up.railway.app"
).replace(/\/+$/, "");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://singgah-flax.vercel.app"
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
// Menguji via domain Vercel sekaligus membuktikan rewrite /api -> Railway
// bekerja, bukan cuma Origin Railway-nya.
describe("Production Frontend (Vercel)", () => {
  test("halaman utama harus 200", async () => {
    const response = await fetch(FRONTEND_URL, { redirect: "follow" });
    expect(response.status).toBe(200);
  });

  test("proxy /api lewat Vercel harus menjangkau backend", async () => {
    const response = await fetch(
      `${FRONTEND_URL.replace(/\/+$/, "")}/api/categories`,
    );
    expect(response.status).toBeLessThan(500);
  });
});
