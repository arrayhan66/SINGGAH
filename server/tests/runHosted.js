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
 *
 * Kalau suite security dari RUN SEBELUMNYA masih mengunci kuota (jendela 15
 * menit belum lewat), runner mengeceknya lebih dulu dan melewati auth/idor
 * dengan alasan yang jelas. Lebih baik dilewati daripada merah karena 429,
 * yang bukan bug aplikasi.
 */

const { spawnSync } = require("child_process");
const path = require("path");

const { SUITES } = require("./suites");
const { DEFAULT_API_URL, getLoginQuotaResetSeconds } = require("./credentials");

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
const skipped = [];

async function main() {
  const API_URL = process.env.API_URL || DEFAULT_API_URL;
  let quotaChecked = false;
  let quotaResetSeconds = 0;

  for (const suite of SUITES) {
    if (suite.logins > 0) {
      if (!quotaChecked) {
        quotaResetSeconds = await getLoginQuotaResetSeconds(API_URL);
        quotaChecked = true;
      }

      if (quotaResetSeconds > 0) {
        console.log(
          `\n${"=".repeat(70)}\n${suite.title}\n` +
            `DILEWATI: kuota login masih habis ` +
            `(reset ~${Math.ceil(quotaResetSeconds / 60)} menit). ` +
            `${"=".repeat(70)}`,
        );
        skipped.push(suite.name);
        continue;
      }
    }

    if (!run(suite)) failed.push(suite.name);
  }

  console.log(`\n${"=".repeat(70)}`);
  if (failed.length === 0) {
    console.log(
      "Semua suite hosting yang dijalankan lolos." +
        (skipped.length ? ` Dilewati: ${skipped.join(", ")}.` : ""),
    );
  } else {
    console.log(`Suite gagal: ${failed.join(", ")}`);
  }

  if (skipped.length > 0) {
    console.log(
      `\nSuite ${skipped.join(", ")} dilewati karena kuota login habis ` +
        "dari test:security sebelumnya. Ini bukan bug aplikasi. Tunggu jendela " +
        "15 menit lalu jalankan `npm run test:auth`, `npm run test:idor`, " +
        "dan `npm run test:security`, atau ulangi `npm run test:all`.",
    );
  }

  if (failed.length > 0) {
    console.log(
      "\nKalau yang gagal 'auth' atau 'idor' dengan 429, itu rate limit. " +
        "Kalau 401, cek kredensial di server/.env.security.",
    );
  }
  console.log("=".repeat(70));

  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
