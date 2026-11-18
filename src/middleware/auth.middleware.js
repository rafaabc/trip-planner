const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token not provided' });

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    req.user = { id: decoded.id, email: decoded.email };
    next();
  });
}

module.exports = authMiddleware;
