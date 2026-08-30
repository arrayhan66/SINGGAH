const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id", onDelete: "SET NULL", onUpdate: "CASCADE" },
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { name: "activity_logs_user_id", fields: ["user_id"] },
      { name: "activity_logs_action", fields: ["action"] },
      { name: "activity_logs_target", fields: ["target_type", "target_id"] },
    ],
  },
)

module.exports = ActivityLog
