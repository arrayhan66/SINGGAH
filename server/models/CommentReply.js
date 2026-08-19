const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const CommentReply = sequelize.define(
  "CommentReply",
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
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "comments", key: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
    },
  },
  {
    tableName: "comment_replies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["comment_id"] }, { fields: ["user_id"] }],
  },
)

module.exports = CommentReply
