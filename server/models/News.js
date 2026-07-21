const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const News = sequelize.define(
  "News",
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
    headline_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "news",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
)

module.exports = News
