const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

// === REJESTRACJA ===
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Brak wymaganych danych' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email już istnieje' });
  const user = new User({ firstName, lastName, email, password });
  await user.save();
  res.status(201).json({ message: 'Użytkownik zarejestrowany!' });
});

// === LOGOWANIE ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Błędny login lub hasło' });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'tajnyklucz',
    { expiresIn: '7d' }
  );
  res.json({
    token,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      id: user._id
    }
  });
});

// === POBIERANIE PROFILU ===
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// === EDYCJA PROFILU ===
router.put('/profile', auth, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  await user.save();
  res.json({ message: 'Zaktualizowano profil' });
});

// === ZMIANA HASŁA ===
router.put('/profile/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
  if (!await bcrypt.compare(oldPassword, user.password)) {
    return res.status(400).json({ message: 'Stare hasło nieprawidłowe' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Hasło zmienione' });
});

module.exports = router;
