const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller.js");

router.post("/packages", packageController.createPackage);
router.get("/packages", packageController.getAllPackages);
router.get("/packages/:id", packageController.getPackageById);
router.put("/packages/:id", packageController.updatePackage);
router.delete("/packages/:id", packageController.deletePackage);

module.exports = router;