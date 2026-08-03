const router = require("express").Router()

const projectController = require("../controllers/projectController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")
const validate = require("../middlewares/validateMiddleware")
const {
  createProjectValidator,
  updateProjectValidator,
} = require("../validators/projectValidator")

router.get("/", projectController.getProjects)

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.getPendingProjects,
)

router.get("/my", authMiddleware, projectController.getMyProjects)

router.get("/:id", projectController.getProjectById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "user"),
  upload.fields([
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
  projectController.updateProjectStatus,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "user"),
  upload.fields([
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
