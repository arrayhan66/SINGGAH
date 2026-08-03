const asyncHandler = require("../utils/asyncHandler")
const projectMemberService = require("../services/projectMemberService")
const { success } = require("../utils/response")

exports.getMembers = asyncHandler(async (req, res) => {
  const members = await projectMemberService.getMembers(req.params.id)
  success(res, members)
})

exports.addMember = asyncHandler(async (req, res) => {
  const member = await projectMemberService.addMember(
    req.params.id,
    req.body,
    req.user,
  )
  success(res, member, "Anggota ditambahkan", 201)
})

exports.removeMember = asyncHandler(async (req, res) => {
  await projectMemberService.removeMember(
    req.params.id,
    req.params.memberId,
    req.user,
  )
  success(res, null, "Anggota dihapus")
})
