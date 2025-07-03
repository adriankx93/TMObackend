const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Brak tokena' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'tajnyklucz');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};
