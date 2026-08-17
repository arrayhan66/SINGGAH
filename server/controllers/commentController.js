const asyncHandler = require("../utils/asyncHandler")
const commentService = require("../services/commentService")
const { success } = require("../utils/response")

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getComments(req.params.id)
  success(res, comments)
})

exports.addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(
    req.params.id,
    req.body.text,
    req.user,
  )
  success(res, comment, "Komentar ditambahkan", 201)
})

exports.getReplies = asyncHandler(async (req, res) => {
  const replies = await commentService.getReplies(req.params.commentId)
  success(res, replies)
})

exports.addReply = asyncHandler(async (req, res) => {
  const reply = await commentService.addReply(
    req.params.commentId,
    req.body.text,
    req.user,
  )
  success(res, reply, "Balasan ditambahkan", 201)
})

exports.updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.commentId,
    req.body.text,
    req.user,
  )
  success(res, comment, "Komentar diperbarui")
})

exports.updateReply = asyncHandler(async (req, res) => {
  const reply = await commentService.updateReply(
    req.params.replyId,
    req.body.text,
    req.user,
  )
  success(res, reply, "Balasan diperbarui")
})

exports.removeReply = asyncHandler(async (req, res) => {
  await commentService.removeReply(req.params.replyId, req.user)
  success(res, null, "Balasan dihapus")
})

exports.removeComment = asyncHandler(async (req, res) => {
  await commentService.removeComment(req.params.commentId, req.user)
  success(res, null, "Komentar dihapus")
})
