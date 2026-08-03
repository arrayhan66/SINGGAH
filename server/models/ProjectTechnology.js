const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectTechnology = sequelize.define(
  "ProjectTechnology",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "projects", key: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
    },
  },
  {
    tableName: "project_technologies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }],
  },
)

module.exports = ProjectTechnology
