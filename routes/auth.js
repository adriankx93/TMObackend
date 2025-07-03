const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Logowanie
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Błędny login lub hasło' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklucz', { expiresIn: '7d' });
  res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, id: user._id } });
});

// Pobieranie własnego profilu
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Edycja własnego profilu
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

// Zmiana hasła
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
