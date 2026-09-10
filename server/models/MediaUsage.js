const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const MediaUsage = sequelize.define(
  "MediaUsage",
  {
    public_id: {
      type: DataTypes.STRING(300),
      primaryKey: true,
      allowNull: false,
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "media_usage",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = MediaUsage