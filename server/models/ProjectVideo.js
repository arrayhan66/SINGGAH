const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const ProjectVideo = sequelize.define(
  "ProjectVideo",
  {
    video_url: {
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
    tableName: "project_videos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["project_id"] }],
  },
)

module.exports = ProjectVideo
