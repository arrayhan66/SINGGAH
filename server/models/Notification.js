const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Notification = sequelize.define(
  "Notification",
  {
    type: {
      type: DataTypes.ENUM(
        "like",
        "comment",
        "project_approved",
        "project_rejected",
        "new_project",
        "project_updated",
        "project_deleted",
        "announcement",
        "user_registered",
        "tipe_approved",
        "tipe_rejected",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.ENUM("project", "comment", "news", "user"),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

module.exports = Notification
