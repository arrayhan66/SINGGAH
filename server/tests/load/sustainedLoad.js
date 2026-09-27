/**
 * Beban berkelanjutan memakai autocannon.
 *
 * Kenapa tidak pakai klien http bawaan Node? Pada 1000 koneksi ke endpoint
 * berat seperti /api/hall (~122 KB per respons, jadi 122 MB/detik), klien Node
 * di mesin Windows kehabisan sumber daya dan mulai menolak koneksi sendiri.
 * Diperuktikan: 8.555 ECONNREFUSED, sementara autocannon di skenario yang sama
 * 0 error. Yang diukur mestinya server, bukan keterbatasan alat ukur.
 *
 * autocannon sudah jadi dependency dev di package.json, jadi tidak perlu
 * di-install ulang.
 */

const { execFile } = require("child_process");

const AUTOCANNON = require.resolve("autocannon/autocannon.js");

/**
 * Jalankan autocannon dan kembalikan ringkasan yang sama bentuknya dengan
 * helpers.summarize() supaya bisa langsungcompared.
 */
function sustainedViaAutocannon({
  host,
  port,
  path,
  connections,
  durationSec,
}) {
  return new Promise((resolve, reject) => {
    const url = `http://${host}:${port}${path}`;
    execFile(
      process.execPath,
      [
        AUTOCANNON,
        "-c",
        String(connections),
        "-d",
        String(durationSec),
        "-j",
        url,
      ],
      { maxBuffer: 64 * 1024 * 1024, windowsHide: true },
      (err, stdout) => {
        if (err && !stdout) return reject(err);
        let raw;
        try {
          raw = JSON.parse(stdout);
        } catch {
          return reject(new Error("autocannon tidak mengembalikan JSON"));
        }

        // PENTING: autocannon tidak punya key "p95". Percentil yang tersedia
        // p90/p97_5/p99, jadi pakai p97_5 sebagai pengganti terdekat p95.
        // Kalau key-nya diambil apa adanya hasilnya undefined -> 0, dan
        // skenario sustained akan "lolos" tanpa mengukur apa pun.
        const latency = raw.latency || {};
        const requests = raw.requests || {};
        const throughput = raw.throughput || {};

        const pick = (...keys) => {
          for (const k of keys) {
            if (Number.isFinite(latency[k])) return latency[k];
          }
          return 0;
        };

        // error = yang benar-benar gagal: timeout, reset, 4xx, 5xx, mismatch.
        // "non2xx" di autocannon hanya menghitung 3xx, jadi tidak dipakai.
        const failed =
          (raw.timeouts || 0) +
          (raw.resets || 0) +
          (raw["1xx"] || 0) +
          (raw["4xx"] || 0) +
          (raw["5xx"] || 0) +
          (raw.mismatches || 0);

        const total = requests.total || 0;

        resolve({
          path,
          total,
          p50: pick("p50"),
          p95: pick("p97_5", "p99"),
          p99: pick("p99"),
          max: pick("max"),
          errors: failed,
          errorKinds: {
            timeout: raw.timeouts || 0,
            reset: raw.resets || 0,
            "4xx": raw["4xx"] || 0,
            "5xx": raw["5xx"] || 0,
          },
          errorRate: total > 0 ? failed / total : 0,
          bytesMB: (throughput.total || 0) / 1048576,
          perSec: requests.average || 0,
          elapsedSec: raw.duration,
          concurrency: connections,
          okCodes: raw["2xx"] || 0,
          via: "autocannon",
        });
      },
    );
  });
}

/** Cek apakah autocannon tersedia sebelum skenario dijalankan. */
function isAvailable() {
  try {
    require.resolve("autocannon/autocannon.js");
    return true;
  } catch {
    return false;
  }
}

module.exports = { sustainedViaAutocannon, isAvailable };
