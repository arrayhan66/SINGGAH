const router = require("express").Router()

const projectController = require("../controllers/projectController")
const authMiddleware = require("../middlewares/authMiddleware")
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")
const { dynamicUploadFields } = require("../middlewares/uploadMiddleware")
const validate = require("../middlewares/validateMiddleware")
const {
  createProjectValidator,
  updateProjectValidator,
  updateProjectStatusValidator,
  reviewRevisionValidator,
  rejectRevisionValidator,
} = require("../validators/projectValidator")

// DAFTARANNYA harus sebelum "/:id", kalau tidak "revisions" akan tertangkap
// sebagai nilai parameter id.
router.get(
  "/revisions",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.getPendingRevisions,
)

router.get(
  "/revisions/:id",
  authMiddleware,
  projectController.getRevisionById,
)

router.patch(
  "/revisions/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  reviewRevisionValidator,
  validate,
  projectController.approveRevision,
)

router.patch(
  "/revisions/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectRevisionValidator,
  validate,
  projectController.rejectRevision,
)

router.delete(
  "/revisions/:id",
  authMiddleware,
  projectController.cancelRevision,
)

router.get("/", optionalAuthMiddleware, projectController.getProjects)

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.getPendingProjects,
)

router.get("/my", authMiddleware, projectController.getMyProjects)

// Revisi milik karya ini (dipakai form edit mahasiswa untuk tahu apakah
// masih ada pengajuan yang menunggu verifikasi).
router.get(
  "/:id/revision",
  authMiddleware,
  projectController.getProjectPendingRevision,
)

router.get("/:id", optionalAuthMiddleware, projectController.getProjectById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "user"),
  dynamicUploadFields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  createProjectValidator,
  validate,
  projectController.createProject,
)

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateProjectStatusValidator,
  validate,
  projectController.updateProjectStatus,
)

router.patch(
  "/:id/featured",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.setProjectFeatured,
)

router.patch(
  "/:id/slideshow",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.setProjectSlideshow,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "user"),
  dynamicUploadFields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  updateProjectValidator,
  validate,
  projectController.updateProject,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "user"),
  projectController.deleteProject,
)

module.exports = router
