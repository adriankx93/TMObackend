const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');

// --- Nodemailer config (Gmail, możesz podmienić na SMTP lub SendGrid) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,     // Twój email
    pass: process.env.MAIL_PASS      // Hasło lub app password Gmail!
  }
});

// --- Rejestracja (wymaga e-maila) ---
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane!' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Nieprawidłowy adres e-mail.' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email już zarejestrowany!' });

  const user = new User({ firstName, lastName, email, password });
  await user.save();
  res.status(201).json({ message: 'Rejestracja udana. Teraz możesz się zalogować.' });
});

// --- Logowanie ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Błędny login lub hasło' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklucz', { expiresIn: '7d' });
  res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, id: user._id } });
});

// --- Reset hasła: żądanie resetu (wysłanie maila z linkiem) ---
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Podaj e-mail!" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Użytkownik o tym e-mailu nie istnieje." });

  // Wygeneruj token resetu (ważny 1h)
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600 * 1000;
  await user.save();

  // Wyślij e-mail z linkiem do resetu
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  await transporter.sendMail({
    to: user.email,
    from: process.env.MAIL_USER,
    subject: "Resetowanie hasła – TECH-SPIE",
    html: `
      <h2>Resetowanie hasła TECH-SPIE</h2>
      <p>Kliknij link poniżej, aby ustawić nowe hasło:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Jeśli to nie Ty, po prostu zignoruj tę wiadomość.</p>
    `
  });

  res.json({ message: "Wysłano e-mail z instrukcją resetu hasła." });
});

// --- Reset hasła: zmiana hasła przez link ---
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Nieprawidłowy lub wygasły link resetu." });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Hasło zostało ustawione. Teraz możesz się zalogować." });
});

module.exports = router;
