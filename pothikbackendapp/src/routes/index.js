// const fs = require("fs");
// const path = require("path");
// const express = require("express");

// const router = express.Router();

// // Path of this folder
// const routesPath = __dirname;

// // Read all files ending with .routes.js
// const routeFiles = fs.readdirSync(routesPath).filter((file) =>
//   file.endsWith(".routes.js")
// );

// routeFiles.forEach((file) => {
//   const fullPath = path.join(routesPath, file);
//   const route = require(fullPath);

//   // Validate export
//   if (typeof route !== "function") {
//     console.error(
//       `❌ ERROR: '${file}' does not export an Express router. Skipping this file.`
//     );
//     return;
//   }

//   // Build route name from file → Example: users.routes.js → /users
//   const routeName = "/" + file.replace(".routes.js", "");

//   console.log(`✔ Loaded route: ${routeName} from ${file}`);

//   router.use(routeName, route);
// });

// module.exports = router;
