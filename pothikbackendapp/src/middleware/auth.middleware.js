
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Read token from headers
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token not provided",
    });
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token format",
    });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach decoded user info
    req.user = decoded;

    // 4. Allow access
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
