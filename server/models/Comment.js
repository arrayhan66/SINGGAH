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
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["project_id"] }, { fields: ["user_id"] }],
  },
)

module.exports = Comment
