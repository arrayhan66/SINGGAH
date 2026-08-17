require("dotenv").config()
require("../config/env")

const { sequelize } = require("../models")

;(async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connected, syncing schema (alter)...")
    await sequelize.sync({ alter: true })
    console.log("Schema synced successfully")
    process.exit(0)
  } catch (err) {
    console.error("Schema sync failed:", err.message)
    process.exit(1)
  }
})()
