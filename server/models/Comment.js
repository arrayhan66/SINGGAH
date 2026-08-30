const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Comment = sequelize.define(
  "Comment",
  {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
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
    tableName: "comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { name: "comments_project_id", fields: ["project_id"] },
      { name: "comments_user_id", fields: ["user_id"] },
      { name: "comments_project_created", fields: ["project_id", "created_at"] },
    ],
  },
)

module.exports = Comment
