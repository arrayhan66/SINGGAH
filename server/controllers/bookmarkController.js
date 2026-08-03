const asyncHandler = require("../utils/asyncHandler")
const bookmarkService = require("../services/bookmarkService")
const { success } = require("../utils/response")

exports.toggleBookmark = asyncHandler(async (req, res) => {
  const result = await bookmarkService.toggleBookmark(req.params.id, req.user)
  success(res, result)
})

exports.getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await bookmarkService.getUserBookmarks(req.user.id)
  success(res, bookmarks)
})
