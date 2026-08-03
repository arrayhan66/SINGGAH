const asyncHandler = require("../utils/asyncHandler")
const projectLinkService = require("../services/projectLinkService")
const { success } = require("../utils/response")

exports.getLinks = asyncHandler(async (req, res) => {
  const links = await projectLinkService.getLinks(req.params.id)
  success(res, links)
})

exports.addLink = asyncHandler(async (req, res) => {
  const link = await projectLinkService.addLink(
    req.params.id,
    req.body,
    req.user,
  )
  success(res, link, "Link ditambahkan", 201)
})

exports.removeLink = asyncHandler(async (req, res) => {
  await projectLinkService.removeLink(
    req.params.id,
    req.params.linkId,
    req.user,
  )
  success(res, null, "Link dihapus")
})
