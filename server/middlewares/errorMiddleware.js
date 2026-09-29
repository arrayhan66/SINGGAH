const { fail } = require("../utils/response")
const logger = require("../utils/logger")

const SENSITIVE_KEYS = /password|token|secret|identitas_photo|avatar|verification/i

// Multer melempar MulterError (punya `code`, tanpa `statusCode`) untuk
// pelanggaran batas multipart. Hanya LIMIT_FILE_SIZE yang sudah diterjemahkan
// di uploadMiddleware; error lain di bawah ini sebelumnya jatuh ke 500 padahal
// murni kesalahan request klien.
const MULTER_MESSAGES = {
  LIMIT_FILE_COUNT: "Jumlah file melebihi batas",
  LIMIT_FIELD_COUNT: "Jumlah field melebihi batas",
  LIMIT_FIELD_KEY: "Nama field terlalu panjang",
  LIMIT_FIELD_VALUE: "Nilai field terlalu panjang",
  LIMIT_PART_COUNT: "Jumlah bagian multipart melebihi batas",
  LIMIT_UNEXPECTED_FILE: "Field file tidak dikenali",
}

function redactBody(body) {
  if (!body || typeof body !== "object") return body
  const out = {}
  for (const [k, v] of Object.entries(body)) {
    out[k] = SENSITIVE_KEYS.test(k) ? "[REDACTED]" : v
  }
  return out
}

module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message

  if (err && err.name === "MulterError") {
    statusCode = 400
    message = MULTER_MESSAGES[err.code] || "Unggahan tidak valid"
  }

  const isServerError = statusCode >= 500

  logger.error(`${req.method} ${req.originalUrl}`, {
    name: err && err.name,
    message: err && err.message,
    full: err && String(err),
    stack: isServerError ? err && err.stack : undefined,
    statusCode,
    body: redactBody(req.body),
    user: req.user ? req.user.id : null,
  })

  // Jangan bocorkan detail internal (SQL error, stack, path) ke klien.
  fail(res, isServerError ? "Terjadi kesalahan pada server." : message, statusCode, err.data)
}