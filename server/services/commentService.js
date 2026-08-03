const { Comment, CommentReply, Project, User } = require("../models")
const AppError = require("../utils/AppError")
const { createNotification } = require("./notificationService")
const { logActivity } = require("./activityLogService")

exports.getComments = async (projectId) => {
  return await Comment.findAll({
    where: { project_id: projectId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "avatar"],
      },
      {
        model: CommentReply,
        as: "replies",
        include: [
          {
            model: User,
            attributes: ["id", "name", "username", "avatar"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  })
}

exports.addComment = async (projectId, text, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (!text || !text.trim()) {
    throw new AppError("Komentar tidak boleh kosong", 400)
  }

  const comment = await Comment.create({
    text,
    user_id: user.id,
    project_id: projectId,
  })

  if (project.user_id !== user.id) {
    await createNotification({
      user_id: project.user_id,
      type: "comment",
      title: "Komentar baru",
      message: `${user.name} mengomentari project Anda: "${project.title}"`,
      reference_type: "project",
      reference_id: project.id,
    })
  }

  await logActivity({
    userId: user.id,
    action: "comment_added",
    targetType: "project",
    targetId: projectId,
    description: `${user.name} mengomentari project "${project.title}"`,
  })

  return comment
}

exports.getReplies = async (commentId) => {
  const comment = await Comment.findByPk(commentId)
  if (!comment) throw new AppError("Komentar tidak ditemukan", 404)

  return await CommentReply.findAll({
    where: { comment_id: commentId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "avatar"],
      },
    ],
    order: [["created_at", "ASC"]],
  })
}

exports.addReply = async (commentId, text, user) => {
  const comment = await Comment.findByPk(commentId, {
    include: [
      {
        model: Project,
        attributes: ["id", "title", "user_id"],
      },
    ],
  })

  if (!comment) throw new AppError("Komentar tidak ditemukan", 404)

  if (!text || !text.trim()) {
    throw new AppError("Balasan tidak boleh kosong", 400)
  }

  const reply = await CommentReply.create({
    text,
    user_id: user.id,
    comment_id: commentId,
  })

  const replyOwner = comment.user_id
  const projectOwner = comment.Project ? comment.Project.user_id : null

  if (replyOwner !== user.id) {
    await createNotification({
      user_id: replyOwner,
      type: "comment",
      title: "Balasan komentar",
      message: `${user.name} membalas komentar Anda di project "${comment.Project ? comment.Project.title : "Project"}"`,
      reference_type: "project",
      reference_id: comment.project_id,
    })
  } else if (projectOwner && projectOwner !== user.id) {
    await createNotification({
      user_id: projectOwner,
      type: "comment",
      title: "Balasan komentar",
      message: `${user.name} membalas komentar di project "${comment.Project.title}"`,
      reference_type: "project",
      reference_id: comment.project_id,
    })
  }

  return reply
}

exports.removeReply = async (replyId, user) => {
  const reply = await CommentReply.findByPk(replyId)
  if (!reply) throw new AppError("Balasan tidak ditemukan", 404)

  if (user.role !== "admin" && reply.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  await reply.destroy()
  return reply
}

exports.removeComment = async (commentId, user) => {
  const comment = await Comment.findByPk(commentId)
  if (!comment) throw new AppError("Komentar tidak ditemukan", 404)

  if (user.role !== "admin" && comment.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  await comment.destroy()
  return comment
}
