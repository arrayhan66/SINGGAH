const router = require("express").Router()

const projectController = require("../controllers/projectController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")

router.get("/", projectController.getProjects)
router.get("/", projectController.getProjects)

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  projectController.getPendingProjects,
)

router.get("/:id", projectController.getProjectById)

router.get("/:id", projectController.getProjectById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "user"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
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
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  projectController.updateProject,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "user"),
  projectController.deleteProject,
)

module.exports = router
