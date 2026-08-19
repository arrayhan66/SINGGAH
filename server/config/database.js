const { Sequelize } = require("sequelize")

const isTest = process.env.NODE_ENV === "test"

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
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: true,
          },
        },
      },
    )

module.exports = sequelize