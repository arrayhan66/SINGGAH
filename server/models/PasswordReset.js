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
    indexes: [
      { name: "password_resets_user_id", fields: ["user_id"] },
      { name: "password_resets_code", fields: ["code"] },
    ],
  },
)

module.exports = PasswordReset
