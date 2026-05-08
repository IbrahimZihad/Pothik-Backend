/**
 * Unit Tests for Hotel Controller
 * ==================================
 * Tests: getHotels, getHotelById, addHotel, updateHotel, deleteHotel,
 *        getRooms, getRoomById, addRoom, updateRoom, deleteRoom
 */

const hotelController = require('../controllers/hotel.controller');
const { Hotel, HotelRoom } = require('../models');

jest.mock('../models', () => ({
  Hotel: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  HotelRoom: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockRequest = (body = {}, params = {}) => ({ body, params });

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Hotel Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // HOTEL CONTROLLERS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getHotels', () => {
    it('should return all hotels with rooms', async () => {
      const hotels = [{ hotel_id: 1, name: 'Hotel A' }];
      Hotel.findAll.mockResolvedValue(hotels);

      const req = mockRequest();
      const res = mockResponse();

      await hotelController.getHotels(req, res);

      expect(Hotel.findAll).toHaveBeenCalledWith({ include: HotelRoom });
      expect(res.json).toHaveBeenCalledWith(hotels);
    });
  });

  describe('getHotelById', () => {
    it('should return hotel by id with rooms', async () => {
      const hotel = { hotel_id: 1, name: 'Hotel A' };
      Hotel.findByPk.mockResolvedValue(hotel);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await hotelController.getHotelById(req, res);

      expect(Hotel.findByPk).toHaveBeenCalledWith(1, { include: HotelRoom });
      expect(res.json).toHaveBeenCalledWith(hotel);
    });

    it('should return null if hotel not found', async () => {
      Hotel.findByPk.mockResolvedValue(null);

      const req = mockRequest({}, { id: 999 });
      const res = mockResponse();

      await hotelController.getHotelById(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  describe('addHotel', () => {
    it('should create hotel', async () => {
      const hotel = { hotel_id: 1, name: 'Hotel A' };
      Hotel.create.mockResolvedValue(hotel);

      const req = mockRequest({ name: 'Hotel A', address: 'Dhaka' });
      const res = mockResponse();

      await hotelController.addHotel(req, res);

      expect(Hotel.create).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(hotel);
    });
  });

  describe('updateHotel', () => {
    it('should update hotel', async () => {
      Hotel.update.mockResolvedValue([1]);

      const req = mockRequest({ name: 'Updated Hotel' }, { id: 1 });
      const res = mockResponse();

      await hotelController.updateHotel(req, res);

      expect(Hotel.update).toHaveBeenCalledWith({ name: 'Updated Hotel' }, { where: { hotel_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Hotel updated', updated: [1] });
    });
  });

  describe('deleteHotel', () => {
    it('should delete hotel', async () => {
      Hotel.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await hotelController.deleteHotel(req, res);

      expect(Hotel.destroy).toHaveBeenCalledWith({ where: { hotel_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Hotel deleted' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ROOM CONTROLLERS
  // ─────────────────────────────────────────────────────────────────────────
  describe('getRooms', () => {
    it('should return all rooms with hotel', async () => {
      const rooms = [{ room_id: 1, room_type: 'Deluxe' }];
      HotelRoom.findAll.mockResolvedValue(rooms);

      const req = mockRequest();
      const res = mockResponse();

      await hotelController.getRooms(req, res);

      expect(HotelRoom.findAll).toHaveBeenCalledWith({ include: Hotel });
      expect(res.json).toHaveBeenCalledWith(rooms);
    });
  });

  describe('getRoomById', () => {
    it('should return room by id', async () => {
      const room = { room_id: 1 };
      HotelRoom.findByPk.mockResolvedValue(room);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await hotelController.getRoomById(req, res);

      expect(HotelRoom.findByPk).toHaveBeenCalledWith(1, { include: Hotel });
      expect(res.json).toHaveBeenCalledWith(room);
    });
  });

  describe('addRoom', () => {
    it('should create room', async () => {
      const room = { room_id: 1 };
      HotelRoom.create.mockResolvedValue(room);

      const req = mockRequest({ room_type: 'Deluxe', hotel_id: 1 });
      const res = mockResponse();

      await hotelController.addRoom(req, res);

      expect(HotelRoom.create).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(room);
    });
  });

  describe('updateRoom', () => {
    it('should update room', async () => {
      HotelRoom.update.mockResolvedValue([1]);

      const req = mockRequest({ room_type: 'Suite' }, { id: 1 });
      const res = mockResponse();

      await hotelController.updateRoom(req, res);

      expect(HotelRoom.update).toHaveBeenCalledWith({ room_type: 'Suite' }, { where: { room_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Room updated', updated: [1] });
    });
  });

  describe('deleteRoom', () => {
    it('should delete room', async () => {
      HotelRoom.destroy.mockResolvedValue(1);

      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await hotelController.deleteRoom(req, res);

      expect(HotelRoom.destroy).toHaveBeenCalledWith({ where: { room_id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Room deleted' });
    });
  });
});
