require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tmo');

async function createAdmin() {
  const exists = await User.findOne({ email: 'admin' });
  if (!exists) {
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin',
      password: 'adrian128',
      role: 'Admin'
    });
    console.log('Admin utworzony!');
  } else {
    console.log('Admin już istnieje.');
  }
  process.exit();
}
createAdmin();
