const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectView = sequelize.define(
  "ProjectView",
  {
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    tableName: "project_views",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }, { fields: ["user_id"] }],
  },
)

module.exports = ProjectView
