const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const SiteVisit = sequelize.define(
  "SiteVisit",
  {
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    visit_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "site_visits",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { unique: true, fields: ["ip_address", "visit_date"] },
      { fields: ["visit_date"] },
    ],
  },
)

module.exports = SiteVisit