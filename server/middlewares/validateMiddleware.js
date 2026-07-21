const { validationResult } = require("express-validator")
const AppError = require("../utils/AppError")

const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg
    return next(new AppError(firstError, 400))
  }

  next()
}

module.exports = validate
