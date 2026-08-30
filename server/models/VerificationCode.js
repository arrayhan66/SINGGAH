const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const VerificationCode = sequelize.define(
  "VerificationCode",
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
    tableName: "verification_codes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { name: "verification_codes_user_id", fields: ["user_id"] },
      { name: "verification_codes_code", fields: ["code"] },
    ],
  },
)

module.exports = VerificationCode
