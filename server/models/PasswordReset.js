const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "password_resets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
)

module.exports = PasswordReset
