// /src/config/jwt.js

const jwt = require("jsonwebtoken");
const config = require("./index");

module.exports = {
  sign(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  },

  verify(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return null;
    }
  },
};


