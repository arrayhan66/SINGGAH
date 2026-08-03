const sequelize = require("../config/database")
const User = require("./User")
const Category = require("./Category")
const Project = require("./Project")
const ProjectImage = require("./ProjectImage")
const ProjectMember = require("./ProjectMember")
const ProjectDocument = require("./ProjectDocument")
const ProjectTechnology = require("./ProjectTechnology")
const ProjectVideo = require("./ProjectVideo")
const ProjectLink = require("./ProjectLink")
const ProjectLike = require("./ProjectLike")
const ProjectView = require("./ProjectView")
const Bookmark = require("./Bookmark")
const Comment = require("./Comment")
const News = require("./News")
const VerificationCode = require("./VerificationCode")
const PasswordReset = require("./PasswordReset")
const Notification = require("./Notification")
const Setting = require("./Setting")
const ActivityLog = require("./ActivityLog")
const CommentReply = require("./CommentReply")

/* ================= USERS ================= */
User.hasMany(Project, { foreignKey: "user_id", onDelete: "CASCADE" })
Project.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(News, { foreignKey: "author_id", onDelete: "CASCADE" })
News.belongsTo(User, { foreignKey: "author_id" })

User.hasMany(VerificationCode, { foreignKey: "user_id", onDelete: "CASCADE" })
VerificationCode.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(PasswordReset, { foreignKey: "user_id", onDelete: "CASCADE" })
PasswordReset.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" })
Notification.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(Bookmark, { foreignKey: "user_id", onDelete: "CASCADE" })
Bookmark.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(ProjectLike, { foreignKey: "user_id", onDelete: "CASCADE" })
ProjectLike.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(ProjectView, { foreignKey: "user_id", onDelete: "CASCADE" })
ProjectView.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" })
Comment.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(CommentReply, { foreignKey: "user_id", onDelete: "CASCADE" })
CommentReply.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(ActivityLog, { foreignKey: "user_id", onDelete: "SET NULL" })
ActivityLog.belongsTo(User, { foreignKey: "user_id" })

/* ================= CATEGORIES ================= */
Category.hasMany(Project, { foreignKey: "category_id", onDelete: "RESTRICT" })
Project.belongsTo(Category, { foreignKey: "category_id" })

/* ================= PROJECTS ================= */
Project.hasMany(ProjectImage, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
  as: "images",
})
ProjectImage.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectMember, { foreignKey: "project_id", onDelete: "CASCADE", as: "members" })
ProjectMember.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectDocument, { foreignKey: "project_id", onDelete: "CASCADE", as: "documents" })
ProjectDocument.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectTechnology, { foreignKey: "project_id", onDelete: "CASCADE", as: "technologies" })
ProjectTechnology.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectVideo, { foreignKey: "project_id", onDelete: "CASCADE", as: "videos" })
ProjectVideo.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectLink, { foreignKey: "project_id", onDelete: "CASCADE", as: "links" })
ProjectLink.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectLike, { foreignKey: "project_id", onDelete: "CASCADE", as: "likes" })
ProjectLike.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(ProjectView, { foreignKey: "project_id", onDelete: "CASCADE", as: "views" })
ProjectView.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(Bookmark, { foreignKey: "project_id", onDelete: "CASCADE", as: "bookmarks" })
Bookmark.belongsTo(Project, { foreignKey: "project_id" })

Project.hasMany(Comment, { foreignKey: "project_id", onDelete: "CASCADE", as: "comments" })
Comment.belongsTo(Project, { foreignKey: "project_id" })

Comment.hasMany(CommentReply, { foreignKey: "comment_id", onDelete: "CASCADE", as: "replies" })
CommentReply.belongsTo(Comment, { foreignKey: "comment_id" })

module.exports = {
  sequelize,
  User,
  Category,
  Project,
  ProjectImage,
  ProjectMember,
  ProjectDocument,
  ProjectTechnology,
  ProjectVideo,
  ProjectLink,
  ProjectLike,
  ProjectView,
  Bookmark,
  Comment,
  News,
  VerificationCode,
  PasswordReset,
  Notification,
  Setting,
  ActivityLog,
  CommentReply,
}
