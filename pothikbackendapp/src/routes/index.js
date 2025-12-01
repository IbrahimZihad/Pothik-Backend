const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();

// Directory of this file
const routesPath = __dirname;

// Read all files in this directory
fs.readdirSync(routesPath)
  .filter((file) => {
    // Exclude this index.js file
    return (
      file !== "index.js" &&
      file.endsWith(".js")
    );
  })
  .forEach((file) => {
    const route = require(path.join(routesPath, file));

    // Convert file name to route path
    // Example: packages.routes.js → /packages
    const routeName = "/" + file.replace(".routes.js", "").replace(".js", "");

    router.use(routeName, route);
  });

module.exports = router;
