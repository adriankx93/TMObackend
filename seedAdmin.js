require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tmo');

async function createTester() {
  try {
    // Usuń użytkownika "admin" jeśli istnieje
    await User.deleteOne({ email: 'admin' });

    // Sprawdź czy już jest "tester"
    const exists = await User.findOne({ email: 'tester' });
    if (!exists) {
      await User.create({
        firstName: 'Test',
        lastName: 'Tester',
        email: 'tester',
        password: 'test1234',
        role: 'Admin'
      });
      console.log('Konto tester utworzone!');
    } else {
      console.log('Tester już istnieje.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createTester();
