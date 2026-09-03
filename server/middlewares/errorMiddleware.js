const { fail } = require("../utils/response")
const logger = require("../utils/logger")

const SENSITIVE_KEYS = /password|token|secret|identitas_photo|avatar|verification/i

function redactBody(body) {
  if (!body || typeof body !== "object") return body
  const out = {}
  for (const [k, v] of Object.entries(body)) {
    out[k] = SENSITIVE_KEYS.test(k) ? "[REDACTED]" : v
  }
  return out
}

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const isServerError = statusCode >= 500

  logger.error(`${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: isServerError ? err.stack : undefined,
    statusCode,
    body: redactBody(req.body),
    user: req.user ? req.user.id : null,
  })

  // Jangan bocorkan detail internal (SQL error, stack, path) ke klien.
  fail(res, isServerError ? "Terjadi kesalahan pada server." : err.message, statusCode, err.data)
}