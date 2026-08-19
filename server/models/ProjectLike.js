const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectLike = sequelize.define(
  "ProjectLike",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
  },
  {
    tableName: "project_likes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { unique: true, fields: ["user_id", "project_id"] },
      { fields: ["project_id"] },
    ],
  },
)

module.exports = ProjectLike
