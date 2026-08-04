const { fail } = require("../utils/response")
const logger = require("../utils/logger")

module.exports = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    body: req.body,
    user: req.user ? req.user.id : null,
  })

  fail(res, err.message || "Internal Server Error", err.statusCode || 500)
}
