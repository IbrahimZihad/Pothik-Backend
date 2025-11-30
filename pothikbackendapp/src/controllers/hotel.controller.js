const { Hotel, HotelRoom } = require("../models");

module.exports = {
  async getHotels(req, res) {
    const data = await Hotel.findAll({ include: HotelRoom });
    res.json(data);
  },

  async addHotel(req, res) {
    const hotel = await Hotel.create(req.body);
    res.json(hotel);
  },

  async addRoom(req, res) {
    const room = await HotelRoom.create(req.body);
    res.json(room);
  },
};
