/**
 * Daftar suite yang menyentuh hosting sungguhan.
 *
 * Dipakai bersama oleh tests/runHosted.js (runner ke terminal) dan
 * tests/generateTestReport.js (runner -> laporan HTML).
 *
 * URUTAN suite disengaja: yang boros kuota login (security) ditaruh paling
 * akhir supaya suite yang butuh login sah (auth, idor) kebagian kuota dulu.
 * /api/auth/login dibatasi 10 percobaan per 15 menit per IP.
 */
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

module.exports = { SUITES };