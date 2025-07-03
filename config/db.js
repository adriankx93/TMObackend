const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tmo');
  console.log('Połączono z MongoDB');
};
