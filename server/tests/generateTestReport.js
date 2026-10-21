/**
 * Runner -> laporan HTML untuk test yang menyentuh hosting sungguhan.
 *
 * Menjalankan suite yang sama persis dengan tests/runHosted.js (lihat
 * tests/suites.js), menangkap hasil Jest dalam bentuk JSON, lalu merendernya
 * menjadi satu file HTML mandiri yang bisa dibuka di browser untuk dilihat
 * atau di-screenshot.
 *
 * Mode:
 *   (default, TEST_REPORT_MODE sedeng/bukan "summary") -> lengkap, memuat
 *     rincian per kasus uji.
 *   TEST_REPORT_MODE=summary -> ringkas (header + ringkasan per suite saja),
 *     cocok untuk lampiran berisi 1 halaman.
 *
 * Hasil test yang terakhir dijalankan disimpan ke server/docs/hasil-test-run.json,
 * sehingga laporan bisa dibuat ulang TANPA menjalankan test lagi (menghemat
 * kuota rate-limit login) lewat TEST_REPORT_USE_CACHE=1.
 */

const { spawnSync, exec } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { SUITES } = require("./suites");

const serverRoot = path.join(__dirname, "..");
const jestBin = path.join(serverRoot, "node_modules", "jest", "bin", "jest.js");
const OUT_DIR = process.env.TEST_REPORT_DIR || path.join(serverRoot, "docs");
const OUT_FILE =
  process.env.TEST_REPORT_FILE || path.join(OUT_DIR, "hasil-pengujian-otomatis.html");
const CACHE_FILE =
  process.env.TEST_REPORT_CACHE || path.join(OUT_DIR, "hasil-test-run.json");
const SUMMARY_ONLY = process.env.TEST_REPORT_MODE === "summary";
const USE_CACHE = process.env.TEST_REPORT_USE_CACHE === "1";

function runSuite(suite) {
  const tmp = path.join(os.tmpdir(), `singgah-jest-${suite.name}-${Date.now()}.json`);
  const startedAt = Date.now();

  const res = spawnSync(
    process.execPath,
    [
      jestBin,
      "--runInBand",
      "--json",
      "--no-colors",
      "--silent",
      `--outputFile=${tmp}`,
      ...suite.args,
    ],
    { stdio: "inherit", env: process.env },
  );

  const wallMs = Date.now() - startedAt;
  let json = null;
  if (fs.existsSync(tmp)) {
    try {
      json = JSON.parse(fs.readFileSync(tmp, "utf8"));
    } catch {
      json = null;
    }
    fs.unlinkSync(tmp);
  }

  return { suite, json, ok: res.status === 0, wallMs };
}

function toCache(results) {
  return {
    generatedAt: new Date().toISOString(),
    suites: results.map((r) => ({
      name: r.suite.name,
      title: r.suite.title,
      logins: r.suite.logins,
      args: r.suite.args,
      ok: r.ok,
      wallMs: r.wallMs,
      numTotalTests: r.json?.numTotalTests ?? 0,
      numPassedTests: r.json?.numPassedTests ?? 0,
      numFailedTests: r.json?.numFailedTests ?? 0,
      numPendingTests: r.json?.numPendingTests ?? 0,
      tests: (r.json?.testResults ?? []).flatMap((file) =>
        (file.assertionResults ?? []).map((t) => ({
          title: t.title,
          status: t.status,
          duration: t.duration,
          failure: t.failureMessages?.length ? t.failureMessages[0] : "",
        })),
      ),
    })),
  };
}

function fromCache() {
  const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  return cached.suites.map((su) => ({
    suite: { name: su.name, title: su.title, logins: su.logins, args: su.args },
    ok: su.ok,
    wallMs: su.wallMs,
    json: {
      numTotalTests: su.numTotalTests,
      numPassedTests: su.numPassedTests,
      numFailedTests: su.numFailedTests,
      numPendingTests: su.numPendingTests,
      testResults: [
        {
          name: su.title,
          assertionResults: su.tests.map((t) => ({
            title: t.title,
            status: t.status,
            duration: t.duration,
            failure: t.failure,
          })),
        },
      ],
    },
  }));
}

function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtMs(ms) {
  if (ms == null) return "-";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

function statusBadge(status) {
  if (status === "passed") return '<span class="badge ok">Lolos</span>';
  if (status === "failed") return '<span class="badge bad">Gagal</span>';
  return '<span class="badge skip">Pending</span>';
}

let results;
let runNote = "";

if (USE_CACHE && fs.existsSync(CACHE_FILE)) {
  results = fromCache();
  runNote =
    "Hasil dimuat dari hasil pengujian yang disimpan (tidak menjalankan ulang pengujian).";
  console.log(`\nMemuat hasil tersimpan: ${CACHE_FILE}`);
} else {
  results = [];
  for (const suite of SUITES) {
    console.log(`\n${"=".repeat(70)}\n${suite.title}\n${"=".repeat(70)}`);
    const result = runSuite(suite);
    results.push(result);

    if (result.json) {
      console.log(
        `  kasus: ${result.json.numTotalTests} | ` +
          `lolos: ${result.json.numPassedTests} | ` +
          `gagal: ${result.json.numFailedTests} | waktu: ${fmtMs(result.wallMs)}`,
      );
    } else {
      console.log(`  GAGAL menghasilkan JSON (keluar dengan status ${result.ok ? 0 : "!0"}).`);
    }
  }

  const CACHE_BAK_FILE = CACHE_FILE.replace(/\.json$/, ".bak.json");
  const currentOK = results.every((r) => (r.json?.numFailedTests ?? 0) === 0);
  let prevOK = false;
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      prevOK = (prev.suites ?? []).every((s) => s.numFailedTests === 0);
    } catch {
      prevOK = false;
    }
    fs.copyFileSync(CACHE_FILE, CACHE_BAK_FILE);
  }

  if (!currentOK && prevOK) {
    console.log(
      "\nRun kali ini mengandung kegagalan (kemungkinan kuota rate-limit login belum bebas).\n" +
        "Cache HIJAU sebelumnya dipertahankan biar laporan tetap bisa dibuat ulang tanpa ngulang test.",
    );
    runNote =
      "Run terakhir mengandung kegagalan (kemungkinan rate-limit login); hasil hijau sebelumnya dipertahankan.";
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(toCache(results), null, 2));
    runNote = "Hasil juga disimpan untuk pembuatan ulang laporan tanpa menjalankan ulang test.";
  }
}

const totalTests = results.reduce((s, r) => s + (r.json?.numTotalTests ?? 0), 0);
const totalPassed = results.reduce((s, r) => s + (r.json?.numPassedTests ?? 0), 0);
const totalFailed = results.reduce((s, r) => s + (r.json?.numFailedTests ?? 0), 0);
const totalPending = results.reduce((s, r) => s + (r.json?.numPendingTests ?? 0), 0);
const totalMs = results.reduce((s, r) => s + r.wallMs, 0);
const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

const summaryRows = results
  .map((r, i) => {
    const j = r.json;
    const count = j?.numTotalTests ?? 0;
    const passed = j?.numPassedTests ?? 0;
    const failed = j?.numFailedTests ?? 0;
    const badge = failed > 0 || !j ? '<span class="badge bad">Gagal</span>' : '<span class="badge ok">Lolos</span>';
    return `<tr>
      <td>${i + 1}</td>
      <td>${esc(r.suite.title)}</td>
      <td>${esc(r.suite.args.join(", "))}</td>
      <td class="num">${count}</td>
      <td class="num">${passed}</td>
      <td class="num">${failed}</td>
      <td class="num">${fmtMs(r.wallMs)}</td>
      <td>${badge}</td>
    </tr>`;
  })
  .join("");

const detailSections = results
  .map((r, i) => {
    const j = r.json;
    const tests = (j?.testResults ?? []).flatMap((file) =>
      (file.assertionResults ?? []).map((t) => ({
        title: t.title,
        status: t.status,
        duration: t.duration,
        failure: t.failure || "",
        file: file.name ? path.basename(file.name) : r.suite.name,
      })),
    );

    const passed = j?.numPassedTests ?? 0;
    const failed = j?.numFailedTests ?? 0;
    const pending = j?.numPendingTests ?? 0;
    const badge =
      failed > 0 || !j ? '<span class="badge bad">Gagal</span>' : '<span class="badge ok">Lolos</span>';

    const rows = tests
      .map((t, k) => {
        const fail = t.failure
          ? `<div class="fail"><details><summary>Lihat penjelasan</summary><p>${esc(t.failure)}</p></details></div>`
          : "";
        return `<tr>
        <td class="num">${k + 1}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${esc(t.title)}${fail}</td>
        <td>${esc(t.file)}</td>
        <td class="num">${fmtMs(t.duration)}</td>
      </tr>`;
      })
      .join("");

    return `
    <section class="suite">
      <div class="suite-head">
        <h3>${i + 1}. ${esc(r.suite.title)}</h3>
        ${badge}
      </div>
      <p class="suite-meta">
        Kasus: <b>${j?.numTotalTests ?? 0}</b> · Lolos: <b>${passed}</b> ·
        Gagal: <b>${failed}</b> · Pending: <b>${pending}</b> ·
        Waktu: <b>${fmtMs(r.wallMs)}</b>
      </p>
      <table>
        <thead>
          <tr><th>No</th><th>Status</th><th>Kasus Uji</th><th>File</th><th>Durasi</th></tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="5">Tidak ada kasus yang terekam.</td></tr>`}</tbody>
      </table>
    </section>`;
  })
  .join("");

const now = new Date().toLocaleString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Laporan Hasil Pengujian Otomatis — SINGGAH</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; margin: 0; color: #1f2937; background: #f3f4f6; padding: 24px; }
  .wrap { max-width: 960px; margin: 0 auto; }
  header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; border-radius: 14px; padding: 28px 32px; }
  header h1 { margin: 0 0 6px; font-size: 26px; }
  header p { margin: 0; opacity: .92; }
  .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; font-size: 13px; }
  .meta span { background: rgba(255,255,255,.18); padding: 5px 12px; border-radius: 999px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 20px 0; }
  .card { background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .card .v { font-size: 30px; font-weight: 700; }
  .card .l { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .card.green .v { color: #16a34a; } .card.red .v { color: #dc2626; } .card.blue .v { color: #2563eb; } .card.gray .v { color: #374151; }
  .bar { background: #e5e7eb; border-radius: 999px; height: 12px; overflow: hidden; margin-bottom: 24px; }
  .bar > div { height: 100%; background: #16a34a; }
  h2 { margin: 28px 0 12px; font-size: 20px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); font-size: 13px; }
  th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
  th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; color: #475569; }
  tr:last-child td { border-bottom: none; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.ok { background: #dcfce7; color: #15803d; }
  .badge.bad { background: #fee2e2; color: #b91c1c; }
  .badge.skip { background: #fef3c7; color: #b45309; }
  .suite { background: #fff; border-radius: 12px; padding: 20px 22px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 16px; }
  .suite-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .suite-head h3 { margin: 0; font-size: 16px; }
  .suite-meta { margin: 8px 0 14px; font-size: 13px; color: #4b5563; }
  .fail { margin-top: 6px; }
  .fail details { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 10px; }
  .fail summary { cursor: pointer; font-size: 12px; font-weight: 600; color: #b91c1c; }
  .fail p { margin: 6px 0 0; font-size: 12px; color: #7f1d1d; white-space: pre-wrap; }
  .note { font-size: 12px; color: #6b7280; margin: 6px 0 0; }
  footer { margin: 24px 0 8px; text-align: center; font-size: 12px; color: #9ca3af; }
  @media print {
    body { background: #fff; padding: 0; }
    .wrap { max-width: 100%; }
    .suite, table, .card { box-shadow: none; break-inside: avoid; }
  }
  @media (max-width: 640px) {
    .cards { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Laporan Hasil Pengujian Otomatis</h1>
      <p>SINGGAH — Platform Pameran Karya Digital dengan Gedung Virtual 3D</p>
      <div class="meta">
        <span>Backend: Railway</span>
        <span>Frontend: Vercel</span>
        <span>Runner: Node.js + Jest</span>
        <span>Dibuat: ${esc(now)}</span>
      </div>
    </header>

    <div class="cards">
      <div class="card blue"><div class="v">${totalTests}</div><div class="l">Total Kasus Uji</div></div>
      <div class="card green"><div class="v">${totalPassed}</div><div class="l">Lolos</div></div>
      <div class="card red"><div class="v">${totalFailed}</div><div class="l">Gagal</div></div>
      <div class="card gray"><div class="v">${fmtMs(totalMs)}</div><div class="l">Total Waktu</div></div>
    </div>

    <div class="bar"><div style="width:${passRate}%"></div></div>

    <h2>1. Ringkasan per Suite</h2>
    <table>
      <thead>
        <tr><th>No</th><th>Suite Pengujian</th><th>File</th><th class="num">Kasus</th><th class="num">Lolos</th><th class="num">Gagal</th><th class="num">Waktu</th><th>Hasil</th></tr>
      </thead>
      <tbody>${summaryRows}</tbody>
    </table>
    <p class="note">${esc(runNote)}</p>

    ${SUMMARY_ONLY ? "" : `
    <h2>2. Rincian Hasil Pengujian</h2>
    ${detailSections}
    `}

    <footer>Dihasilkan oleh tests/generateTestReport.js · ${esc(now)}</footer>
  </div>
</body>
</html>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html, "utf8");
console.log(`\nLaporan tersimpan: ${OUT_FILE}`);
console.log(`Mode: ${SUMMARY_ONLY ? "ringkas (1 halaman)" : "lengkap (dengan rincian per kasus)"}`);
console.log(`Total: ${totalTests} kasus | ${totalPassed} lolos | ${totalFailed} gagal | ${totalPending} pending`);

if (process.platform === "win32") {
  exec(`start "" "${OUT_FILE}"`);
}