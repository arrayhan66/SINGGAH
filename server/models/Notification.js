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
        "announcement",
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
      type: DataTypes.ENUM("project", "comment", "news"),
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
