const express = require("express");
const router = express.Router();
const adminRoutes = require("./admin.routes.js");
const adminController = require("../controllers/admin.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/", authMiddleware, adminController.getAllAdmins);
router.get("/:id", authMiddleware, adminController.getAdminById);
router.put("/:id", authMiddleware, adminController.updateAdmin);
router.delete("/:id", authMiddleware, adminController.deleteAdmin);
router.post("/login", adminController.loginAdmin);
module.exports = router;