const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authentication middleware that verifies a JSON Web Token (JWT).  The token
 * should be provided in the Authorization header as a Bearer token.  If
 * valid, the middleware attaches the decoded user to req.user and calls
 * `next()`.  If invalid or missing, it responds with 401 Unauthorized.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user id to request for downstream controllers
    req.user = { id: decoded.id };
    // Optionally you could fetch the full user document:
    // req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticate;