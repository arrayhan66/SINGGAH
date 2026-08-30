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
        dialectOptions: useSsl
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: true,
              },
            }
          : undefined,
      },
    )

module.exports = sequelize