const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");

router.post("/", couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
router.get("/:id", couponController.getCouponById);
router.get("/code/:code", couponController.getCouponByCode);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.patch("/:id/toggle", couponController.toggleCouponStatus);

module.exports = router;
