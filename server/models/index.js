const sequelize = require("../config/database")
const User = require("./User")
const Category = require("./Category")
const Project = require("./Project")
const ProjectImage = require("./ProjectImage")
const News = require("./News")
const VerificationCode = require("./VerificationCode")
const PasswordReset = require("./PasswordReset")
const Notification = require("./Notification")

User.hasMany(Project, { foreignKey: "user_id", onDelete: "CASCADE" })
Project.belongsTo(User, { foreignKey: "user_id" })

Category.hasMany(Project, { foreignKey: "category_id", onDelete: "RESTRICT" })
Project.belongsTo(Category, { foreignKey: "category_id" })

Project.hasMany(ProjectImage, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
  as: "images",
})
ProjectImage.belongsTo(Project, { foreignKey: "project_id" })

User.hasMany(News, { foreignKey: "author_id", onDelete: "CASCADE" })
News.belongsTo(User, { foreignKey: "author_id" })

User.hasMany(VerificationCode, { foreignKey: "user_id", onDelete: "CASCADE" })
VerificationCode.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(PasswordReset, { foreignKey: "user_id", onDelete: "CASCADE" })
PasswordReset.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" })
Notification.belongsTo(User, { foreignKey: "user_id" })

module.exports = {
  sequelize,
  User,
  Category,
  Project,
  ProjectImage,
  News,
  VerificationCode,
  PasswordReset,
  Notification,
}
