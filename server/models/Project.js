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
    rejection_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    approve_note: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    // Karya unggulan di podium hall 3D. Hanya ada 2 slot (1 & 2),
    // null berarti project tidak menjadi karya unggulan.
    featured_slot: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      validate: {
        isIn: [[1, 2]],
      },
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { name: "projects_user_id", fields: ["user_id"] },
      { name: "projects_category_id", fields: ["category_id"] },
      { name: "projects_status", fields: ["status"] },
    ],
  },
)

module.exports = Project
