const { fail } = require("../utils/response")

module.exports = (err, req, res, next) => {
  console.error(err)

  fail(res, err.message || "Internal Server Error", err.statusCode || 500)
}
