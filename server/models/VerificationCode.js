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
  },
)

module.exports = VerificationCode
