const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectDocument = sequelize.define(
  "ProjectDocument",
  {
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
  },
  {
    tableName: "project_documents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }],
  },
)

module.exports = ProjectDocument
