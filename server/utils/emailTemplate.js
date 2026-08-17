const BRAND_NAME = "SINGGAH"
const BRAND_TAGLINE = "Pameran Karya & Inovasi Digital"

const BRAND_DARK = "#041d38"
const BRAND_NAVY = "#06294d"
const BRAND_CYAN = "#06b6d4"
const TEXT_DARK = "#0f172a"
const TEXT_BODY = "#475569"
const TEXT_MUTED = "#64748b"
const BG_BODY = "#f1f5f9"
const BG_CARD = "#ffffff"

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function wrap(contentHtml) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${BRAND_NAME}</title>
    </head>
    <body style="margin:0;padding:0;background-color:${BG_BODY};font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_BODY};padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BG_CARD};border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="background:linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_NAVY} 100%);padding:32px 32px 28px;text-align:center;">
                  <div style="font-size:28px;font-weight:800;letter-spacing:6px;color:#ffffff;line-height:1;">${BRAND_NAME}</div>
                  <div style="margin-top:6px;font-size:12px;letter-spacing:2px;color:#67e8f9;text-transform:uppercase;">${BRAND_TAGLINE}</div>
                </td>
              </tr>
              ${contentHtml}
              <tr>
                <td style="background-color:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0 0 8px;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
                    ${BRAND_NAME} &mdash; ${BRAND_TAGLINE}
                  </p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                    Email ini dikirim otomatis. Jika Anda tidak melakukan permintaan ini, abaikan email ini.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function codeBox(code) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px 16px;">
          <div style="font-size:13px;color:${TEXT_MUTED};margin-bottom:6px;">KODE VERIFIKASI ANDA</div>
          <span style="font-size:34px;font-weight:800;letter-spacing:10px;color:#0369a1;font-family:monospace;">${code}</span>
        </td>
      </tr>
    </table>
  `
}

function verificationEmail({ name, code, minutes }) {
  const contentHtml = `
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:${TEXT_DARK};font-weight:700;">Halo ${escapeHtml(name)},</h1>
        <p style="margin:0 0 24px;font-size:14px;color:${TEXT_BODY};line-height:1.7;">
          Terima kasih telah mendaftar di <strong>${BRAND_NAME}</strong>. Masukkan kode verifikasi di bawah ini untuk mengaktifkan akun Anda.
        </p>
        ${codeBox(code)}
        <p style="margin:20px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
          Kode ini hanya berlaku selama <strong>${minutes} menit</strong> dan hanya dapat digunakan sekali.
        </p>
      </td>
    </tr>
  `
  return wrap(contentHtml)
}

function resetPasswordEmail({ name, code, minutes }) {
  const contentHtml = `
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:${TEXT_DARK};font-weight:700;">Halo ${escapeHtml(name)},</h1>
        <p style="margin:0 0 24px;font-size:14px;color:${TEXT_BODY};line-height:1.7;">
          Kami menerima permintaan untuk mereset password akun <strong>${BRAND_NAME}</strong> Anda. Gunakan kode di bawah ini untuk membuat password baru.
        </p>
        ${codeBox(code)}
        <p style="margin:20px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
          Kode ini hanya berlaku selama <strong>${minutes} menit</strong> dan hanya dapat digunakan sekali. Jangan bagikan kode ini kepada siapa pun.
        </p>
      </td>
    </tr>
  `
  return wrap(contentHtml)
}

const TIPE_LABELS = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
}

function emailChangeEmail({ name, code, minutes }) {
  const contentHtml = `
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:${TEXT_DARK};font-weight:700;">Halo ${escapeHtml(name)},</h1>
        <p style="margin:0 0 24px;font-size:14px;color:${TEXT_BODY};line-height:1.7;">
          Kami menerima permintaan untuk mengubah alamat email akun <strong>${BRAND_NAME}</strong> Anda ke email ini. Masukkan kode verifikasi di bawah ini untuk mengonfirmasi alamat email baru Anda.
        </p>
        ${codeBox(code)}
        <p style="margin:20px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
          Kode ini hanya berlaku selama <strong>${minutes} menit</strong> dan hanya dapat digunakan sekali. Jika Anda tidak melakukan permintaan ini, segera hubungi admin ${BRAND_NAME}.
        </p>
      </td>
    </tr>
  `
  return wrap(contentHtml)
}

function tipeApprovalEmail({ name, approved, tipe, reason }) {
  const tipeLabel = TIPE_LABELS[tipe] || "Umum"

  const contentHtml = `
    <tr>
      <td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:${TEXT_DARK};font-weight:700;">Halo ${escapeHtml(name)},</h1>
        ${
          approved
            ? `
        <p style="margin:0 0 16px;font-size:14px;color:${TEXT_BODY};line-height:1.7;">
          Kabar baik! Permintaan verifikasi akun <strong>${tipeLabel}</strong> Anda telah
          <strong style="color:#059669;">disetujui</strong> oleh admin ${BRAND_NAME}.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:18px 16px;">
              <div style="font-size:13px;color:#047857;">Tipe akun Anda sekarang</div>
              <span style="font-size:22px;font-weight:800;color:#065f46;">${tipeLabel}</span>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
          Silakan login kembali untuk mengaktifkan fitur khusus ${tipeLabel}.
        </p>`
            : `
        <p style="margin:0 0 16px;font-size:14px;color:${TEXT_BODY};line-height:1.7;">
          Mohon maaf, permintaan verifikasi akun <strong>${tipeLabel}</strong> Anda
          <strong style="color:#dc2626;">ditolak</strong> oleh admin ${BRAND_NAME}.
        </p>
        ${
          reason
            ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;">
              <div style="font-size:13px;color:#b91c1c;margin-bottom:6px;">Alasan penolakan</div>
              <div style="font-size:14px;font-weight:600;color:#7f1d1d;line-height:1.6;">${escapeHtml(reason)}</div>
            </td>
          </tr>
        </table>`
            : ""
        }
        <p style="margin:16px 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.6;">
          Akun Anda tetap aktif sebagai tipe <strong>Umum</strong>. Anda dapat mengajukan
          verifikasi ulang dengan data yang benar.
        </p>`
        }
      </td>
    </tr>
  `
  return wrap(contentHtml)
}

module.exports = {
  verificationEmail,
  emailChangeEmail,
  resetPasswordEmail,
  tipeApprovalEmail,
  BRAND_NAME,
}
