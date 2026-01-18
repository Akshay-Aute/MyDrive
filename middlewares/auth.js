const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Access Denied.Unauthorized" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    return next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  next();
};

module.exports = authMiddleware;
