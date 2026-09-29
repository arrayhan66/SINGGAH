/**
 * Runner untuk test yang menyentuh hosting sungguhan.
 *
 * Kenapa file ini perlu ada: semua suite ini berjalan dari IP yang sama, dan
 * /api/auth/login dibatasi 10 percobaan per 15 menit. Kalau dijalanin bareng
 * dalam satu proses jest, suite yang login duluan menghabiskan kuota dan
 * suite berikutnya gagal dengan 429 -- itu bukan bug aplikasi.
 *
 * Di sini tiap suite dijalankan sebagai proses terpisah, dan URUTANNYA
 * disengaja: yang boros kuota (brute force) ditaruh paling akhir, supaya
 * suite yang butuh login sah (auth, idor) kebagian kuota dulu.
 */

const { spawnSync } = require("child_process");
const path = require("path");

const SUITES = [
  {
    name: "live",
    title: "Smoke test Railway + Vercel",
    logins: 0,
    args: ["tests/live.test.js", "tests/production.test.js"],
  },
  {
    name: "docs",
    title: "Dokumentasi API (/api/docs) dan drift spec",
    logins: 0,
    args: ["tests/hostedDocs.test.js"],
  },
  {
    name: "endpoints",
    title: "Endpoint read-only yang belum pernah diuji di hosting",
    logins: 0,
    args: ["tests/hostedEndpoints.test.js"],
  },
  {
    name: "auth",
    title: "Alur auth (butuh akun)",
    logins: 1,
    args: ["tests/authFlows.test.js"],
  },
  {
    name: "idor",
    title: "IDOR lintas dua akun",
    logins: 2,
    args: ["tests/idor.test.js"],
  },
  {
    name: "security",
    title: "Keamanan (brute force, boros kuota)",
    logins: 12,
    args: ["tests/security.test.js"],
  },
];

function run(suite) {
  console.log(
    `\n${"=".repeat(70)}\n${suite.title}\n` +
      `kebutuhan login: ${suite.logins} | ${"=".repeat(70)}`,
  );

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, "..", "node_modules", "jest", "bin", "jest.js"),
      "--runInBand",
      ...suite.args,
      "--silent",
    ],
    { stdio: "inherit", env: process.env },
  );

  return result.status === 0;
}

const failed = [];

for (const suite of SUITES) {
  if (!run(suite)) failed.push(suite.name);
}

console.log(`\n${"=".repeat(70)}`);
if (failed.length === 0) {
  console.log("Semua suite hosting lolos.");
} else {
  console.log(`Suite gagal: ${failed.join(", ")}`);
  console.log(
    "\nKalau yang gagal ONLY 'auth' atau 'idor' dengan alasan 429,\n" +
      "itu rate limit, bukan bug. Tunggu 15 menit lalu ulangi.\n" +
      "Kalau 401, berarti kredensial di server/.env.security salah.",
  );
}
console.log("=".repeat(70));

process.exit(failed.length === 0 ? 0 : 1);
