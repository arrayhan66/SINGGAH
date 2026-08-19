const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectMember = sequelize.define(
  "ProjectMember",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
  },
  {
    tableName: "project_members",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }],
  },
)

module.exports = ProjectMember
