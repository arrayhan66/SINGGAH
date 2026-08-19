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

    winner: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    date: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gallery: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    contentHTML: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
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
