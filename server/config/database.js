const { Sequelize } = require("sequelize")

const isTest = process.env.NODE_ENV === "test"
const useSsl = process.env.DB_SSL !== "false" && process.env.DB_SSL !== "0"

const sequelize = isTest
  ? new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: "mysql",
        logging: false,
        pool: {
          max: parseInt(process.env.DB_POOL_MAX) || 10,
          min: parseInt(process.env.DB_POOL_MIN) || 2,
          acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
          idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
        },
        dialectOptions: {
          ...(useSsl
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: true,
                },
              }
            : {}),
          // mysql2: timeout koneksi per-attempt & jaga koneksi tetap hidup agar
          // koneksi warm dipakai ulang, bukan bikin TCP baru tiap request
          // (mengurangi ENOTFOUND / ETIMEDOUT ke TiDB Cloud saat jaringan blip).
          connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 15000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 5000,
        },
      },
    )

module.exports = sequelize