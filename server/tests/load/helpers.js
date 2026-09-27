/**
 * Primitive untuk uji beban: satu request, burst, dan perhitungan statistik.
 *
 * Dipakai oleh tests/load/index.js. Sengaja tidak memakai jest supaya tidak ikut
 * jalan di `npm test` yang memakai database in-memory SQLite.
 */

const http = require("http");

const DEFAULT_PORT = 5000;
const DEFAULT_HOST = "127.0.0.1";

// PENTING: jangan naikkan maxSockets di sini.
// Diuji: maxSockets 20000 membuat burst 1000 gagal dengan ECONNRESET/ECONNREFUSED
// (agent membuat soket lebih cepat dari yang bisa dicerna OS), sedangkan 2000
// memberi 1000/1000 tanpa error berulang. Jangan diubah tanpa diukur ulang.
function makeAgent(maxSockets = 2000) {
  return new http.Agent({ keepAlive: true, maxSockets });
}

// Error koneksi yang terjadi karena ada socket keep-alive yang ditutup server
// di detik yang sama lalu dipakai ulang. Browser asli (dan fetch) mencoba
// ulang request ini, jadi alat ukur juga sebaiknya begitu agar yang terukur
// adalah perilaku server, bukan race condition di sisi pemanggil.
const CONNECTION_RACE = new Set(["ECONNRESET", "ECONNREFUSED", "EPIPE"]);

function createRequester({
  host = DEFAULT_HOST,
  port = DEFAULT_PORT,
  timeout = 30000,
  retries = 1,
} = {}) {
  const agent = makeAgent();

  const once = (path) =>
    new Promise((resolve) => {
      const startedAt = process.hrtime.bigint();
      const req = http.get({ host, port, path, agent, timeout }, (res) => {
        let bytes = 0;
        res.on("data", (chunk) => (bytes += chunk.length));
        res.on("end", () =>
          resolve({
            path,
            code: res.statusCode,
            bytes,
            ms: Number(process.hrtime.bigint() - startedAt) / 1e6,
          }),
        );
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ path, code: 0, bytes: 0, ms: timeout, error: "timeout" });
      });
      req.on("error", (err) =>
        resolve({
          path,
          code: 0,
          bytes: 0,
          ms: Number(process.hrtime.bigint() - startedAt) / 1e6,
          error: err.code || err.message,
        }),
      );
    });

  return async function request(path) {
    let result = await once(path);
    for (let attempt = 0; attempt < retries; attempt++) {
      if (!CONNECTION_RACE.has(result.error)) break;
      result = await once(path);
    }
    return result;
  };
}

/** percentile dari array latensi (ms). */
function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.floor((p / 100) * sorted.length),
  );
  return sorted[index];
}

/** Ringkasan satu batch hasil request. */
function summarize(results, extra = {}) {
  const latencies = results.map((r) => r.ms);
  const errors = results.filter((r) => r.code === 0 || r.code >= 500);
  const timeout = results.filter((r) => r.error === "timeout");
  const unauthorized = results.filter((r) => r.code === 401);
  const bytes = results.reduce((sum, r) => sum + r.bytes, 0);

  // Rincian jenis error supaya mudah tahu ini socket habis, timeout, atau 5xx.
  const errorKinds = {};
  errors.forEach((e) => {
    const kind = e.error ? e.error : `HTTP ${e.code}`;
    errorKinds[kind] = (errorKinds[kind] || 0) + 1;
  });

  return {
    total: results.length,
    ok: results.length - errors.length,
    errors: errors.length,
    errorKinds,
    timeouts: timeout.length,
    unauthorized: unauthorized.length,
    errorRate: results.length ? errors.length / results.length : 0,
    bytesMB: bytes / 1048576,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    max: latencies.length ? Math.max(...latencies) : 0,
    ...extra,
  };
}

async function burst(request, path, count, staggerMs = 0) {
  const startedAt = process.hrtime.bigint();

  let results;
  if (staggerMs > 0) {
    const waveSize = Math.max(
      1,
      Math.ceil(count / Math.ceil((count * staggerMs) / 2000)),
    );
    results = [];
    for (let start = 0; start < count; start += waveSize) {
      const wave = Array.from(
        { length: Math.min(waveSize, count - start) },
        () => request(path),
      );
      results.push(...(await Promise.all(wave)));
      if (start + waveSize < count)
        await new Promise((r) => setTimeout(r, staggerMs));
    }
  } else {
    results = await Promise.all(
      Array.from({ length: count }, () => request(path)),
    );
  }
  const drainMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  return { ...summarize(results, { path, count }), drainMs };
}

async function sustained(request, path, concurrency, durationMs) {
  const deadline = Date.now() + durationMs;
  const results = [];
  const startedAt = process.hrtime.bigint();

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (Date.now() < deadline) {
        results.push(await request(path));
      }
    }),
  );

  const elapsedSec = Number(process.hrtime.bigint() - startedAt) / 1e9;
  return summarize(results, {
    path,
    concurrency,
    elapsedSec,
    perSec: results.length / elapsedSec,
  });
}

/** Simulasi satu pengunjung membuka beranda (panggilan berurutan). */
async function visitHomepage(request, calls) {
  const results = [];
  for (const path of calls) {
    results.push(await request(path));
  }
  return results;
}

async function clearCaches(prefixes) {
  const cache = require("../../utils/cache");
  for (const prefix of prefixes) {
    await cache.delPrefix(prefix);
  }
}

const CACHE_PREFIXES = {
  news: ["news:list:", "news:detail:", "count:news:total"],
  projects: ["projects:list:", "count:projects:"],
  hall: ["hall:projects", "categories:list"],
};

/** Format angka dengan pemisah ribuan agar mudah dibaca. */
const fmt = (n, digits = 0) =>
  Number(n).toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const ms = (n) => `${fmt(n)} ms`;

module.exports = {
  DEFAULT_PORT,
  DEFAULT_HOST,
  CACHE_PREFIXES,
  createRequester,
  percentile,
  summarize,
  burst,
  sustained,
  visitHomepage,
  clearCaches,
  fmt,
  ms,
};
