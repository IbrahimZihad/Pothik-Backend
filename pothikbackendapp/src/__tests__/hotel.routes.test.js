const request = require('supertest');
const express = require('express');

// Mock controller
jest.mock('../controllers/hotel.controller', () => ({
  getHotels: jest.fn((req, res) =>
    res.status(200).json({ hotels: [] })
  ),
  getHotelById: jest.fn((req, res) =>
    res.status(200).json({ id: 'hotel-1' })
  ),
  addHotel: jest.fn((req, res) =>
    res.status(201).json({ message: 'Hotel added' })
  ),
  updateHotel: jest.fn((req, res) =>
    res.status(200).json({ message: 'Hotel updated' })
  ),
  deleteHotel: jest.fn((req, res) =>
    res.status(200).json({ message: 'Hotel deleted' })
  ),

  getRooms: jest.fn((req, res) =>
    res.status(200).json({ rooms: [] })
  ),
  getRoomById: jest.fn((req, res) =>
    res.status(200).json({ id: 'room-1' })
  ),
  addRoom: jest.fn((req, res) =>
    res.status(201).json({ message: 'Room added' })
  ),
  updateRoom: jest.fn((req, res) =>
    res.status(200).json({ message: 'Room updated' })
  ),
  deleteRoom: jest.fn((req, res) =>
    res.status(200).json({ message: 'Room deleted' })
  ),
}));

const routes = require('../routes/hotel.routes');
const controller = require('../controllers/hotel.controller');

const app = express();
app.use(express.json());
app.use('/', routes);

describe('Hotel Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── HOTEL ─────────────────────────────────────
  describe('GET /hotels', () => {
    it('should return all hotels', async () => {
      const res = await request(app).get('/hotels');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('hotels');
    });
  });

  describe('POST /hotels', () => {
    it('should add hotel', async () => {
      const res = await request(app).post('/hotels').send({});
      expect(res.statusCode).toBe(201);
    });
  });

  describe('PUT /hotels/:id', () => {
    it('should update hotel', async () => {
      const res = await request(app).put('/hotels/h1').send({});
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /hotels/:id', () => {
    it('should delete hotel', async () => {
      const res = await request(app).delete('/hotels/h1');
      expect(res.statusCode).toBe(200);
    });
  });

  // ─── ROOMS ─────────────────────────────────────
  describe('GET /rooms', () => {
    it('should return all rooms', async () => {
      const res = await request(app).get('/rooms');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('rooms');
    });
  });

  describe('POST /rooms', () => {
    it('should add room', async () => {
      const res = await request(app).post('/rooms').send({});
      expect(res.statusCode).toBe(201);
    });
  });

  describe('PUT /rooms/:id', () => {
    it('should update room', async () => {
      const res = await request(app).put('/rooms/r1').send({});
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should delete room', async () => {
      const res = await request(app).delete('/rooms/r1');
      expect(res.statusCode).toBe(200);
    });
  });
});