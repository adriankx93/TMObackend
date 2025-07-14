// v2 by ChatGPT 2025-07-14
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// --- Nodemailer config (Gmail lub SMTP) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,     // Twój email
    pass: process.env.MAIL_PASS      // Hasło lub app password Gmail!
  }
});

// --- LOGOWANIE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Błędny login lub hasło' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklucz', { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera przy logowaniu." });
  }
});

// --- RESET HASŁA: żądanie maila ---
router.post('/reset-password', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: "Błąd podczas wysyłania e-maila." });
  }
});

// --- RESET HASŁA: zmiana hasła przez link ---
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Podaj nowe hasło." });

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
  } catch (err) {
    res.status(500).json({ message: "Błąd przy zmianie hasła." });
  }
});

// --- POBIERZ SWÓJ PROFIL ---
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Błąd pobierania profilu." });
  }
});

// --- EDYCJA PROFILU --- (teraz zwraca nowego usera)
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony" });

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;

    await user.save();

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active
    };

    res.json({ message: "Zaktualizowano profil", user: userData });
  } catch (err) {
    res.status(400).json({ message: "Błąd aktualizacji profilu" });
  }
});

// --- ZMIANA HASŁA (jako zalogowany użytkownik) ---
router.put('/profile/password', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Podaj stare i nowe hasło." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Stare hasło jest nieprawidłowe." });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Hasło zmienione" });
  } catch (err) {
    res.status(500).json({ message: "Błąd podczas zmiany hasła." });
  }
});

module.exports = router;
