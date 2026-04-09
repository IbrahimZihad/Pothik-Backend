const request = require("supertest");
const express = require("express");
const bookingRoutes = require("../routes/booking.routes");
const bookingController = require("../controllers/booking.controller");

// Mock the booking controller
jest.mock("../controllers/booking.controller");

const app = express();
app.use(express.json());
app.use("/api", bookingRoutes);

describe("Booking Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/booking", () => {
    it("should create a new booking", async () => {
      const mockBooking = {
        id: 1,
        user_id: 1,
        service_id: 1,
        booking_date: "2024-01-15",
        status: "pending"
      };

      bookingController.createBooking.mockImplementation((req, res) => {
        res.status(201).json(mockBooking);
      });

      const response = await request(app)
        .post("/api/booking")
        .send({
          user_id: 1,
          service_id: 1,
          booking_date: "2024-01-15"
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockBooking);
      expect(bookingController.createBooking).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/booking", () => {
    it("should get all bookings", async () => {
      const mockBookings = [
        { id: 1, user_id: 1, service_id: 1, status: "pending" },
        { id: 2, user_id: 2, service_id: 2, status: "confirmed" }
      ];

      bookingController.getAllBookings.mockImplementation((req, res) => {
        res.status(200).json(mockBookings);
      });

      const response = await request(app).get("/api/booking");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBookings);
      expect(bookingController.getAllBookings).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/booking/:id", () => {
    it("should get booking by ID", async () => {
      const mockBooking = {
        id: 1,
        user_id: 1,
        service_id: 1,
        status: "pending"
      };

      bookingController.getBookingById.mockImplementation((req, res) => {
        res.status(200).json(mockBooking);
      });

      const response = await request(app).get("/api/booking/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
      expect(bookingController.getBookingById).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if booking not found", async () => {
      bookingController.getBookingById.mockImplementation((req, res) => {
        res.status(404).json({ message: "Booking not found" });
      });

      const response = await request(app).get("/api/booking/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Booking not found");
    });
  });

  describe("GET /api/booking/user/:user_id", () => {
    it("should get bookings by user ID", async () => {
      const mockBookings = [
        { id: 1, user_id: 1, service_id: 1, status: "pending" },
        { id: 2, user_id: 1, service_id: 2, status: "confirmed" }
      ];

      bookingController.getBookingsByUser.mockImplementation((req, res) => {
        res.status(200).json(mockBookings);
      });

      const response = await request(app).get("/api/booking/user/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBookings);
      expect(bookingController.getBookingsByUser).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if user has no bookings", async () => {
      bookingController.getBookingsByUser.mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const response = await request(app).get("/api/booking/user/999");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("PUT /api/booking/:id/status", () => {
    it("should update booking status", async () => {
      const mockUpdatedBooking = {
        id: 1,
        user_id: 1,
        service_id: 1,
        status: "confirmed"
      };

      bookingController.updateBookingStatus.mockImplementation((req, res) => {
        res.status(200).json(mockUpdatedBooking);
      });

      const response = await request(app)
        .put("/api/booking/1/status")
        .send({ status: "confirmed" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedBooking);
      expect(bookingController.updateBookingStatus).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if booking not found", async () => {
      bookingController.updateBookingStatus.mockImplementation((req, res) => {
        res.status(404).json({ message: "Booking not found" });
      });

      const response = await request(app)
        .put("/api/booking/999/status")
        .send({ status: "confirmed" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/booking/:id", () => {
    it("should delete booking", async () => {
      bookingController.deleteBooking.mockImplementation((req, res) => {
        res.status(200).json({ message: "Booking deleted successfully" });
      });

      const response = await request(app).delete("/api/booking/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Booking deleted successfully");
      expect(bookingController.deleteBooking).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if booking not found", async () => {
      bookingController.deleteBooking.mockImplementation((req, res) => {
        res.status(404).json({ message: "Booking not found" });
      });

      const response = await request(app).delete("/api/booking/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Booking not found");
    });
  });

  describe("Route parameter validation", () => {
    it("should handle invalid booking ID format", async () => {
      bookingController.getBookingById.mockImplementation((req, res) => {
        res.status(400).json({ message: "Invalid booking ID" });
      });

      const response = await request(app).get("/api/booking/invalid");

      expect(bookingController.getBookingById).toHaveBeenCalled();
    });

    it("should handle invalid user ID format", async () => {
      bookingController.getBookingsByUser.mockImplementation((req, res) => {
        res.status(400).json({ message: "Invalid user ID" });
      });

      const response = await request(app).get("/api/booking/user/invalid");

      expect(bookingController.getBookingsByUser).toHaveBeenCalled();
    });
  });
});