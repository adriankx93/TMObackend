const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String },
  password:  { type: String, required: true },
  role:      {
    type: String,
    enum: ['Admin', 'Koordynator', 'Dyżurny BMS', 'Technik'],
    default: 'Technik'
  },
  active:    { type: Boolean, default: true },

  // --- Dodaj te dwa pola! ---
  resetPasswordToken: String,
  resetPasswordExpires: Date

}, { timestamps: true });

// Automatyczne hashowanie hasła
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
