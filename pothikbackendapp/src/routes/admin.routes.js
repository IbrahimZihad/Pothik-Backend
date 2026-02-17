const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

router.post("/create", authMiddleware, adminController.createAdmin);
router.get("/", authMiddleware, adminController.getAllAdmins);
router.get("/:id", authMiddleware, adminController.getAdminById);
router.put("/:id", authMiddleware, adminController.updateAdmin);
router.delete("/:id", authMiddleware, adminController.deleteAdmin);
module.exports = router;