process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test_jwt_secret_key_123456789"

// config/env.js menolak start kalau 7 variabel ini kosong, tapi test tidak
// pernah menyentuhnya: database memakai SQLite in-memory (config/database.js),
// Redis dimatikan di config/redis.js, dan utils/sendEmail.js return awal saat
// NODE_ENV=test. Nilai di bawah hanya formalitas agar modul bisa di-require
// di mesin/CI yang tidak punya .env — tanpa ini `npm test` hanya jalan di
// laptop yang kebetulan sudah punya file .env.
process.env.DB_HOST ||= "127.0.0.1";
process.env.DB_PORT ||= "3306";
process.env.DB_NAME ||= "singgah_test";
process.env.DB_USER ||= "test";
process.env.DB_PASSWORD ||= "test";
process.env.EMAIL_USER ||= "test@singgah.test";
process.env.EMAIL_PASSWORD ||= "test";

const { sequelize } = require("../models")

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})
