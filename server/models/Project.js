const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Project = sequelize.define(
  "Project",
  {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "published", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = Project
