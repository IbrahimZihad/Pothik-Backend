const { Guide } = require("../models");

module.exports = {
  async getGuides(req, res) {
    const data = await Guide.findAll();
    res.json(data);
  },

  async addGuide(req, res) {
    const guide = await Guide.create(req.body);
    res.json(guide);
  },
};
