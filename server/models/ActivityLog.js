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
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "users", key: "id", onDelete: "SET NULL", onUpdate: "CASCADE" },
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    target_id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    indexes: [{ fields: ["user_id"] }, { fields: ["action"] }],
  },
)

module.exports = ActivityLog
