const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();

// Path of this folder
const routesPath = __dirname;

// Load only files ending with .routes.js
fs.readdirSync(routesPath)
  .filter((file) => file.endsWith(".routes.js"))
  .forEach((file) => {
    const routePath = path.join(routesPath, file);
    const route = require(routePath);

    // Validate export
    if (typeof route !== "function") {
      console.error(`ERROR: ${file} does NOT export an Express router. Skipping.`);
      return;
    }

    // Convert "user.routes.js" → "/user"
    const routeName = "/" + file.replace(".routes.js", "");

    router.use(routeName, route);
  });

module.exports = router;
