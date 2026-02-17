const { Hotel, HotelRoom } = require("../models");

module.exports = {
  /* ------------------------ HOTEL CONTROLLERS ------------------------ */

  // GET all hotels with rooms
  async getHotels(req, res) {
    const data = await Hotel.findAll({ include: HotelRoom });
    res.json(data);
  },

  // GET single hotel
  async getHotelById(req, res) {
    const { id } = req.params;
    const hotel = await Hotel.findByPk(id, { include: HotelRoom });
    res.json(hotel);
  },

  // CREATE new hotel
  async addHotel(req, res) {
    const hotel = await Hotel.create(req.body);
    res.json(hotel);
  },

  // UPDATE hotel
  async updateHotel(req, res) {
    const { id } = req.params;
    const updated = await Hotel.update(req.body, { where: { hotel_id: id } });
    res.json({ message: "Hotel updated", updated });
  },

  // DELETE hotel
  async deleteHotel(req, res) {
    const { id } = req.params;
    await Hotel.destroy({ where: { hotel_id: id } });
    res.json({ message: "Hotel deleted" });
  },

  /* ------------------------ ROOM CONTROLLERS ------------------------ */

  // GET all rooms
  async getRooms(req, res) {
    const rooms = await HotelRoom.findAll({ include: Hotel });
    res.json(rooms);
  },

  // GET single room
  async getRoomById(req, res) {
    const { id } = req.params;
    const room = await HotelRoom.findByPk(id, { include: Hotel });
    res.json(room);
  },

  // CREATE room
  async addRoom(req, res) {
    const room = await HotelRoom.create(req.body);
    res.json(room);
  },

  // UPDATE room
  async updateRoom(req, res) {
    const { id } = req.params;
    const updated = await HotelRoom.update(req.body, { where: { room_id: id } });
    res.json({ message: "Room updated", updated });
  },

  // DELETE room
  async deleteRoom(req, res) {
    const { id } = req.params;
    await HotelRoom.destroy({ where: { room_id: id } });
    res.json({ message: "Room deleted" });
  },
};
