const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectImage = sequelize.define(
  "ProjectImage",
  {
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "project_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

module.exports = ProjectImage
