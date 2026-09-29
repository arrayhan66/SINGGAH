/**
 * Pembaca kredensial test yang sama untuk semua suite.
 *
 * Kenapa file ini ada dan bukan pakai dotenv:
 *
 * dotenv mengikuti aturan shell -- karakter "#" memulai komentar. Password
 * test yang diakhiri "#" jadi terpotong diam-diam:
 *
 *   TEST_USER_PASSWORD=Sesuatu#   ->  dotenv hanya melihat "Sesuatu"
 *
 * Password jadi salah, server membalas 401 "Email atau password salah", dan
 * gejalanya persis seperti kredensial basi -- padahal kredensialnya benar.
 * Ini yang membuat suite auth dan idor gagal sementara dua akun lain
 * berhasil login.
 * Suite auth/idor sempat gagal gara-gara ini dan sulit didiagnosis karena
 * tidak ada error parse, hanya login yang ditolak.
 *
 * Jadi file ini membaca key=value apa adanya: tanpa ekspansi, tanpa pemotongan
 * di "#", tanpa tanda kutip yang dibuang. Nilai dibaca persis seperti yang
 * diketik di file.
 *
 * Password bisa mengandung karakter "#", spasi, atau tanda kutip. Jangan
 * balik ke dotenv tanpa sengaja -- itulah sumber bug yang membuat suite auth
 * dan idor gagal padahal kredensialnya benar.
 */

const fs = require("fs");
const path = require("path");

const CREDENTIALS_FILE = path.join(__dirname, "..", ".env.security");

function readCredentials(file = CREDENTIALS_FILE) {
  if (!fs.existsSync(file)) return {};

  const values = {};

  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();

    // Baris kosong dan baris komentarutuh. Perhatikan: ini menolak baris yang
    // MULAI dengan "#", bukan baris yang mengandung "#" -- itu yang membuat
    // password ber-"#" tetap utuh.
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    // Nilai TIDAK di-trim di sebelah kanan dan tidak dibungkus tanda kutip:
    // spasi bisa jadi bagian dari password yang sah.
    const value = trimmed.slice(eq + 1).trim();

    if (key) values[key] = value;
  }

  return values;
}

const creds = readCredentials();

/**
 * Daftar akun yang perlu login, plus_password yang aman untuk ditampilkan di
 * pesan error (hanya panjang dan karakter pertama, tidak pernah isinya).
 */
const ACCOUNTS = {
  user: {
    email: creds.TEST_USER_EMAIL,
    password: creds.TEST_USER_PASSWORD,
  },
  other: {
    email: creds.TEST_OTHER_EMAIL,
    password: creds.TEST_OTHER_PASSWORD,
  },
  admin: {
    email: creds.TEST_ADMIN_EMAIL,
    password: creds.TEST_ADMIN_PASSWORD,
  },
};

/**
 * Account mana yang siap dipakai. Suite di-skip kalau email/password belum
 * diisi di .env.security, supaya `npm run test:hosted` tetap bisa jalan di
 * mesin tanpa file tersebut.
 */
function hasCredentials(role) {
  const account = ACCOUNTS[role];
  return Boolean(account?.email && account?.password);
}

/**
 * Diagnosa login yang gagal, dibedakan per penyebab supaya pesan errornya
 * bisa langsungunjuk ke jalan keluarnya.
 */
function explainLoginFailure(role, status, body) {
  const account = ACCOUNTS[role];
  const passwordLength = account?.password?.length ?? 0;

  if (status === 429) {
    return (
      `Login ${role} kena rate limit (429). Batasnya 10 percobaan/15 menit ` +
      `per IP dan kunci ini dipakai bersama test lain dari IP yang sama. ` +
      `Tunggu 15 menit, atau jalankan suite ini sendirian tanpa ` +
      `test:security di waktu berdekatan.`
    );
  }

  if (status === 403) {
    return (
      `Login ${role} ditolak 403. Di authService.js:166-181 ini berarti akun ` +
      `ada tapi: status bukan "active" (nonaktif), atau is_verified masih ` +
      `false (email belum diverifikasi), atau maintenanceMode aktif dan ` +
      `role-nya bukan admin. Cek di database, bukan di file kredensial.`
    );
  }

  if (status === 401) {
    return (
      `Login ${role} gagal 401 "email atau password salah". Cek ` +
      `authService.js:160-174: email tidak ditemukan, atau bcrypt tidak ` +
      `cocok. Kredensial yang dipakai file ini: ` +
      `${account?.email} (password ${passwordLength} karakter). ` +
      `Kalau email-nya BENAR tapi tetap 401, perhatikan aturan dari ` +
      `tests/credentials.js: password yang mengandung "#" akan terpotong ` +
      `kalau dibaca pakai dotenv.`
    );
  }

  return (
    `Login ${role} gagal dengan status tak terduga (${status}): ` +
    `${JSON.stringify(body).slice(0, 200)}`
  );
}

module.exports = {
  CREDENTIALS_FILE,
  readCredentials,
  ACCOUNTS,
  hasCredentials,
  explainLoginFailure,
};
