const serverless = require("serverless-http")

// mysql2 dimuat Sequelize secara DINAMIS, sehingga bundler serverless Vercel
// tidak ikut membundelnya. Require statis ini memastikan driver DB ikut ter-bundle.
require("mysql2")

const app = require("../server.js")

const BINARY_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
]

module.exports = serverless(app, { binary: BINARY_TYPES })