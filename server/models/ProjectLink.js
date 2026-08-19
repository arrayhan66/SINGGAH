const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectLink = sequelize.define(
  "ProjectLink",
  {
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
  },
  {
    tableName: "project_links",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }],
  },
)

module.exports = ProjectLink
