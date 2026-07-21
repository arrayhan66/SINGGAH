const router = require("express").Router()

const authMiddleware = require("../middlewares/authMiddleware")

router.get("/", authMiddleware, (req, res) => {
  res.json({
    message: "Token valid",
    user: req.user,
  })
})

module.exports = router
