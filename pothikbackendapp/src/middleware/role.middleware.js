// role.middleware.js

// check admin permission
const isAdmin = (req, res, next) => {
  // authMiddleware must run first
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Login required",
    });
  }

  // our admin login token contains isAdmin = true
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }

  next();
};

module.exports = {
  isAdmin,
};
