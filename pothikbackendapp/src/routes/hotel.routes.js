const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

/* ------------------------ HOTEL ROUTES ------------------------ */
router.get("/hotels", hotelController.getHotels);
router.get("/hotels/:id", hotelController.getHotelById);
router.post("/hotels", hotelController.addHotel);
router.put("/hotels/:id", hotelController.updateHotel);
router.delete("/hotels/:id", hotelController.deleteHotel);

/* ------------------------ ROOM ROUTES ------------------------ */
router.get("/rooms", hotelController.getRooms);
router.get("/rooms/:id", hotelController.getRoomById);
router.post("/rooms", hotelController.addRoom);
router.put("/rooms/:id", hotelController.updateRoom);
router.delete("/rooms/:id", hotelController.deleteRoom);

module.exports = router;
