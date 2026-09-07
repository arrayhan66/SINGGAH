const winston = require("winston")
const path = require("path")

const isTest = process.env.NODE_ENV === "test"
const isProduction = process.env.NODE_ENV === "production"

const logDir = path.join(__dirname, "..", "logs")

const transports = []

// Di production (Vercel/Render) filesystem bersifat read-only/ephemeral,
// jadi log file di-skip; log tetap tampil di console/stdout.
if (!isTest && !isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  )
}

if (!isTest) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  )
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  silent: isTest,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
})

module.exports = logger
