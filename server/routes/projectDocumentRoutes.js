const router = require("express").Router()
const ctrl = require("../controllers/projectDocumentController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/documents", ctrl.getDocuments)
router.post("/:id/documents", authMiddleware, ctrl.addDocument)
router.delete(
  "/:id/documents/:docId",
  authMiddleware,
  ctrl.removeDocument,
)

module.exports = router
