import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_URL = process.env.VITE_API_URL || "https://api.singgah.site";
const SITE_URL = "https://singgah.site";
const today = new Date().toISOString().slice(0, 10);

function rows(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function fetchList(pathname) {
  try {
    const response = await fetch(`${API_URL}${pathname}?limit=100`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    return rows(await response.json());
  } catch (error) {
    void error;
    return [];
  }
}

function dateOf(item) {
  const value =
    item?.updatedAt ||
    item?.createdAt ||
    item?.updated_at ||
    item?.created_at ||
    today;
  return String(value).slice(0, 10);
}

function segment(value) {
  return encodeURIComponent(String(value));
}

const staticEntries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/karya", changefreq: "daily", priority: "0.9" },
  { path: "/berita", changefreq: "daily", priority: "0.8" },
  { path: "/hall", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const [news, projects, categories] = await Promise.all([
  fetchList("/api/news"),
  fetchList("/api/projects"),
  fetchList("/api/categories"),
]);

const entries = [...staticEntries];
const seen = new Set(staticEntries.map((entry) => entry.path));

function add(pathname, changefreq, priority, lastmod = today) {
  if (seen.has(pathname)) return;
  seen.add(pathname);
  entries.push({ path: pathname, changefreq, priority, lastmod });
}

for (const item of news) {
  if (item?.slug) {
    add(`/berita/${segment(item.slug)}`, "monthly", "0.7", dateOf(item));
  }
}

for (const item of categories) {
  if (item?.slug) {
    add(`/karya/${segment(item.slug)}`, "weekly", "0.8", dateOf(item));
  }
}

for (const item of projects) {
  const slug = item?.slug || item?.id;
  if (!slug) continue;
  const rawCategory =
    item?.categorySlug ||
    item?.category?.slug ||
    item?.kategori?.slug ||
    item?.category;
  const category = typeof rawCategory === "string" ? rawCategory : "";
  const pathname = category
    ? `/karya/${segment(category)}/${segment(slug)}`
    : `/karya/${segment(slug)}`;
  add(pathname, "monthly", "0.6", dateOf(item));
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries
    .map(
      (entry) =>
        `  <url>\n` +
        `    <loc>${SITE_URL}${entry.path}</loc>\n` +
        `    <lastmod>${entry.lastmod || today}</lastmod>\n` +
        `    <changefreq>${entry.changefreq}</changefreq>\n` +
        `    <priority>${entry.priority}</priority>\n` +
        `  </url>`,
    )
    .join("\n") +
  "\n</urlset>\n";

await writeFile(path.join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${entries.length} URL`);
