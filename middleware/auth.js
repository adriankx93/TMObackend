

const jwt = require('jsonwebtoken');

// Sprawdza czy użytkownik jest zalogowany (czyli JWT)
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Brak tokena' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'tajnyklucz');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Nieprawidłowy token' });
  }
}

// Sprawdza czy użytkownik jest Adminem
function admin(req, res, next) {
  if (req.user?.role === 'Admin') return next();
  return res.status(403).json({ message: 'Brak uprawnień (Admin).' });
}

// Admin lub Koordynator
function adminOrCoord(req, res, next) {
  if (['Admin', 'Koordynator'].includes(req.user?.role)) return next();
  return res.status(403).json({ message: 'Brak uprawnień (Admin/Koordynator).' });
}

// Admin, Koordynator lub Dyżurny BMS
function adminCoordOrDyżurny(req, res, next) {
  if (['Admin', 'Koordynator', 'Dyżurny BMS'].includes(req.user?.role)) return next();
  return res.status(403).json({ message: 'Brak uprawnień (Admin/Koordynator/Dyżurny BMS).' });
}

module.exports = {
  auth,
  admin,
  adminOrCoord,
  adminCoordOrDyżurny
};
