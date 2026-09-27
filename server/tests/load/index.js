require("dotenv").config();
const {
  createRequester,
  burst,
  sustained,
  visitHomepage,
  summarize,
  clearCaches,
  CACHE_PREFIXES,
  fmt,
  ms,
} = require("./helpers");
const {
  sustainedViaAutocannon,
  isAvailable: isAutocannonAvailable,
} = require("./sustainedLoad");

// ---- Parameter CLI ----
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? fallback : hit.split("=")[1];
};
const flag = (name) => process.argv.includes(`--${name}`);

const PORT = Number(arg("port", 5000));
const HOST = arg("host", "127.0.0.1");
const QUICK = flag("quick");
const USERS = Number(arg("users", 1000));
const DURATION = Number(arg("duration", QUICK ? 5 : 30)) * 1000;
const ONLY = arg("only", "");
const COLD = flag("cold");
// Pemecah gelombang untuk--"stagger". Diperlukan di mesin lokal Windows yang
// punya 16.384 ephemeral port; 0 berarti tembak benar-benar serempak.
const STAGGER = Number(arg("stagger", 0));

// Batas penilaian. p95 longgar karena beban 1000 koneksi terus-menerus itu
// jauh lebih brutal daripada 1000 orang yang sedang brows.
const MAX_ERROR_RATE = Number(arg("maxerrors", 0));
const MAX_P95 = Number(arg("p95", 1500));
const MAX_DRAIN_MS = Number(arg("drain", 15000));

// Endpoint yang diuji, lengkap dengan anggaran latensinya sendiri.
// Angka diambil dari beban nyata: 1000 request tiba serentak ke 1 proses.
// - news & projects payload ~11-13 KB per orang, jadi ringan.
// - hall mengembalikan ~122 KB per orang; 1000 orang sekaligus = 122 MB,
//   jadi wajar kalau latensinya paling tinggi di antara ketiganya.
const ENDPOINTS = [
  {
    name: "news",
    path: "/api/news?limit=10",
    prefixes: CACHE_PREFIXES.news,
    maxP95: 1500,
  },
  {
    name: "projects",
    path: "/api/projects?limit=10",
    prefixes: CACHE_PREFIXES.projects,
    maxP95: 1500,
  },
  {
    name: "hall",
    path: "/api/hall",
    prefixes: CACHE_PREFIXES.hall,
    maxP95: 3000,
  },
];

// Urutan panggilan browser saat membuka beranda.
const HOMEPAGE_CALLS = [
  "/api/settings",
  "/api/categories",
  "/api/projects?limit=10",
  "/api/news?limit=10",
  "/api/auth/me",
];

const results = [];

function verdict(r) {
  const p95Limit = r.maxP95 || MAX_P95;
  if (r.errorRate > MAX_ERROR_RATE)
    return {
      ok: false,
      why: `error ${(r.errorRate * 100).toFixed(2)}% > ${(MAX_ERROR_RATE * 100).toFixed(2)}%`,
    };
  if (r.p95 > p95Limit)
    return { ok: false, why: `p95 ${ms(r.p95)} > ${ms(p95Limit)}` };
  if (r.drainMs !== undefined && r.drainMs > MAX_DRAIN_MS)
    return { ok: false, why: `drain ${ms(r.drainMs)} > ${ms(MAX_DRAIN_MS)}` };
  return { ok: true, why: "lolos" };
}

function record(scenario, name, r, extra = {}) {
  // maxP95 per endpoint harus ikutmerged sebelum verdict, kalau tidak
  // verdict() selalu memakai MAX_P95 global.
  const v = verdict({ ...r, ...extra });
  results.push({ scenario, name, ...r, ...extra, ...v });
  const mark = v.ok ? "LULOS" : "GAGAL";
  console.log(`  [${mark}] ${name}`);
  console.log(
    `         ${fmt(r.total)} request | gagal ${fmt(r.errors)} | p50 ${ms(r.p50)} | p95 ${ms(r.p95)} | p99 ${ms(r.p99)} | ${r.bytesMB.toFixed(1)} MB`,
  );
  if (r.drainMs !== undefined)
    console.log(`         habis dalam ${(r.drainMs / 1000).toFixed(2)} detik`);
  if (
    r.errors &&
    r.errorKinds &&
    Object.values(r.errorKinds).some((v) => v > 0)
  ) {
    const detail = Object.entries(r.errorKinds)
      .map(([k, v]) => `${k} x${fmt(v)}`)
      .join(", ");
    console.log(`         jenis error : ${detail}`);
  }
  if (r.perSec) console.log(`         ${fmt(r.perSec)} request/detik`);
  if (!v.ok) console.log(`         alasan: ${v.why}`);
  console.log("");
}

function want(scenario) {
  return !ONLY || ONLY === scenario;
}

// Burst 1000 koneksi prowess leaves thousands of sockets in TIME_WAIT, so
// consecutive bursts falsely produce ECONNRESET / timeouts on the client side.
// Wait for the socket pool to drain first, otherwise the server gets blamed.
async function cooldown(ms = 5000) {
  if (ms > 0) {
    console.log(
      `  (jeda ${(ms / 1000).toFixed(0)} detik agar socket selesai bersih)`,
    );
    await new Promise((r) => setTimeout(r, ms));
  }
}

(async () => {
  const request = createRequester({ host: HOST, port: PORT });

  console.log("");
  console.log("=".repeat(72));
  console.log("UJI BEBAN SINGGAH");
  console.log("=".repeat(72));
  console.log(`  target       : http://${HOST}:${PORT}`);
  console.log(`  pengguna     : ${fmt(USERS)}`);
  console.log(`  durasi beban : ${(DURATION / 1000).toFixed(0)} detik`);
  console.log(
    `  batas gagal  : error > ${(MAX_ERROR_RATE * 100).toFixed(2)}%, p95 > ${ms(MAX_P95)}, drain > ${fmt(MAX_DRAIN_MS / 1000)} detik`,
  );

  // Pastikan server hidup dan Redis tersambung sebelum mengukur apa pun.
  const health = await request("/api/news?limit=1");
  if (health.code !== 200) {
    console.error("");
    console.error(
      `  Server tidak merespons benar di ${HOST}:${PORT} (kode ${health.code || "tidak ada"}).`,
    );
    console.error("  Jalankan `npm start` di terminal lain lalu ulangi.");
    process.exit(2);
  }
  console.log(`  server       : siap (beranda database & Redis OK)`);
  console.log("");

  // ---- Skenario 1: burst, semua request datang di detik yang sama ----
  if (want("burst")) {
    console.log(`SKENARIO 1 - ${fmt(USERS)} orang mara bareng (burst)`);
    console.log("-".repeat(72));
    for (const ep of ENDPOINTS) {
      if (COLD) await clearCaches(ep.prefixes);
      record(
        "burst",
        `${ep.name} (${ep.path})`,
        await burst(request, ep.path, USERS, STAGGER),
        { maxP95: ep.maxP95 },
      );
      await cooldown(QUICK ? 2000 : 5000);
    }
  }

  // ---- Skenario 2: orang membuka beranda ----
  if (want("homepage")) {
    console.log(
      `SKENARIO 2 - ${fmt(USERS)} orang membuka beranda (${HOMEPAGE_CALLS.length} endpoint berurutan)`,
    );
    console.log("-".repeat(72));

    await visitHomepage(request, HOMEPAGE_CALLS); // pemanasan koneksi
    await new Promise((r) => setTimeout(r, 400));

    const startedAt = process.hrtime.bigint();
    const visits = await Promise.all(
      Array.from({ length: USERS }, () =>
        visitHomepage(request, HOMEPAGE_CALLS),
      ),
    );
    const elapsedSec = Number(process.hrtime.bigint() - startedAt) / 1e9;

    const all = visits.flat();
    const summary = summarize(all, {
      elapsedSec,
      perSec: all.length / elapsedSec,
    });

    record("homepage", `beranda x${fmt(USERS)}`, summary);
    console.log("  rincian per endpoint:");
    for (const path of HOMEPAGE_CALLS) {
      const forPath = all.filter((r) => r.path === path);
      const s = summarize(forPath);
      console.log(
        `    ${path.padEnd(26)} p95 ${ms(s.p95).padStart(9)}   gagal ${s.errors}`,
      );
    }
    console.log(
      `  semua orang selesai beranda dalam ${elapsedSec.toFixed(2)} detik`,
    );
    console.log("");
  }

  // ---- Skenario 3: beban berkelanjutan ----
  if (want("sustained")) {
    console.log(
      `SKENARIO 3 - ${fmt(USERS)} koneksi aktif selama ${(DURATION / 1000).toFixed(0)} detik`,
    );
    console.log("-".repeat(72));
    if (!isAutocannonAvailable) {
      console.log(
        "  autocannon tidak terpasang, memakai klien bawaan (angka bisa terlalu bagus).",
      );
      console.log("");
    }
    for (const ep of ENDPOINTS) {
      const outcome = isAutocannonAvailable
        ? await sustainedViaAutocannon({
            host: HOST,
            port: PORT,
            path: ep.path,
            connections: USERS,
            durationSec: Math.round(DURATION / 1000),
          })
        : await sustained(request, ep.path, USERS, DURATION);
      record("sustained", `${ep.name} (${ep.path})`, outcome, {
        maxP95: ep.maxP95,
      });
      await cooldown(QUICK ? 2000 : 5000);
    }
  }

  // ---- Ringkasan ----
  const failed = results.filter((r) => !r.ok);
  console.log("=".repeat(72));
  console.log("RINGKASAN");
  console.log("=".repeat(72));
  for (const r of results) {
    console.log(
      `  ${r.ok ? "LULOS" : "GAGAL"}  ${r.scenario.padEnd(10)} ${r.name.padEnd(32)} p95 ${ms(r.p95).padStart(9)}  gagal ${r.errors}`,
    );
  }
  console.log("");
  console.log(
    `  ${results.length - failed.length}/${results.length} skenario lolos`,
  );
  console.log("");

  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error("Uji beban gagal dijalankan:", err);
  process.exit(2);
});
