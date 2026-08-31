const { sequelize } = require("../models")
const logger = require("../utils/logger")

const ensureGoogleIdColumn = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface()
    const table = await queryInterface.describeTable("users")
    if (!table.google_id) {
      await queryInterface.addColumn("users", "google_id", {
        type: require("sequelize").DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      })
      try {
        await queryInterface.addIndex("users", ["google_id"], {
          name: "users_google_id",
          unique: true,
        })
      } catch (e) {
        logger.warn("Index google_id:", e.message)
      }
      logger.info("Column users.google_id ditambahkan")
    }
  } catch (err) {
    logger.error("ensureGoogleIdColumn:", err.message)
  }
}

module.exports = ensureGoogleIdColumn
