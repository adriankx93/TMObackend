const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Sprawdzenie uprawnień admina
function onlyAdmin(req, res, next) {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Tylko admin!' });
  next();
}

// Sprawdzenie uprawnień admin/koordynator
function adminOrCoord(req, res, next) {
  if (!['Admin', 'Koordynator'].includes(req.user.role)) return res.status(403).json({ message: 'Brak uprawnień' });
  next();
}

// Lista użytkowników
router.get('/', auth, adminOrCoord, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Dodawanie użytkownika
router.post('/', auth, onlyAdmin, async (req, res) => {
  const { firstName, lastName, email, password, role, phone } = req.body;
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'Brak wymaganych danych' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Taki email już istnieje' });
  const user = new User({ firstName, lastName, email, password, role, phone });
  await user.save();
  res.status(201).json({ message: 'Dodano użytkownika' });
});

// Edycja użytkownika (rola, aktywacja, dane)
router.put('/:id', auth, onlyAdmin, async (req, res) => {
  const { firstName, lastName, phone, role, active } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  user.role = role || user.role;
  user.active = typeof active === 'boolean' ? active : user.active;
  await user.save();
  res.json({ message: 'Zaktualizowano użytkownika' });
});

// Usuwanie/blokada użytkownika
router.delete('/:id', auth, onlyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Użytkownik usunięty' });
});

module.exports = router;
