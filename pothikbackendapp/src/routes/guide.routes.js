const express = require("express");
const router = express.Router();
const guideController = require("../controllers/guideController");

/* ------------------------ GUIDE ROUTES ------------------------ */
router.get("/guides", guideController.getGuides);
router.get("/guides/:id", guideController.getGuideById);
router.post("/guides", guideController.addGuide);
router.put("/guides/:id", guideController.updateGuide);
router.delete("/guides/:id", guideController.deleteGuide);

module.exports = router;
