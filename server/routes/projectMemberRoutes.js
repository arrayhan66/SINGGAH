const router = require("express").Router()
const ctrl = require("../controllers/projectMemberController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/members", ctrl.getMembers)
router.post("/:id/members", authMiddleware, ctrl.addMember)
router.delete("/:id/members/:memberId", authMiddleware, ctrl.removeMember)

module.exports = router
