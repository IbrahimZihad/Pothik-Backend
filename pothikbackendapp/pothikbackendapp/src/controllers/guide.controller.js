const { Guide } = require("../models");

module.exports = {
  /* ---------------------- GET ALL GUIDES ---------------------- */
  async getGuides(req, res) {
    const data = await Guide.findAll();
    res.json(data);
  },

  /* ---------------------- GET SINGLE GUIDE ---------------------- */
  async getGuideById(req, res) {
    const { id } = req.params;
    const guide = await Guide.findByPk(id);
    res.json(guide);
  },

  /* ---------------------- CREATE GUIDE ---------------------- */
  async addGuide(req, res) {
    const guide = await Guide.create(req.body);
    res.json(guide);
  },

  /* ---------------------- UPDATE GUIDE ---------------------- */
  async updateGuide(req, res) {
    const { id } = req.params;

    const updated = await Guide.update(req.body, {
      where: { guide_id: id },
    });

    res.json({ message: "Guide updated", updated });
  },

  /* ---------------------- DELETE GUIDE ---------------------- */
  async deleteGuide(req, res) {
    const { id } = req.params;

    await Guide.destroy({ where: { guide_id: id } });

    res.json({ message: "Guide deleted" });
  },
};
