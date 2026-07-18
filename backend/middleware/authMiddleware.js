const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is missing.");
}

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // The payload structure is { user: { id, name, ... } }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("[authMiddleware] Token validation failed:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};