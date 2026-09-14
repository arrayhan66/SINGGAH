const { sequelize } = require("../models")
const logger = require("../utils/logger")

const ensureSlideshowColumn = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface()
    const table = await queryInterface.describeTable("projects")
    if (!table.is_shown_in_slideshow) {
      await queryInterface.addColumn(
        "projects",
        "is_shown_in_slideshow",
        {
          type: require("sequelize").DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      )
      logger.info("Column projects.is_shown_in_slideshow ditambahkan")
    }
  } catch (err) {
    logger.error("ensureSlideshowColumn:", err.message)
  }
}

module.exports = ensureSlideshowColumn