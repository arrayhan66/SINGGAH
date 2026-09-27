const BASE_URL = "https://singgah-production.up.railway.app";

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
    {
      name: "Project Revisions",
      path: "/api/projects/revisions?status=pending&limit=1",
    },
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
