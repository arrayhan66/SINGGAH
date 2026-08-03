const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Setting = sequelize.define(
  "Setting",
  {
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = Setting
