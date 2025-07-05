require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// 🚀 DODAJ TĘ LINIĘ, aby działała trasa z danymi Google Sheets
app.use('/api/sheets', require('./routes/sheets'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serwer backend działa na porcie ${PORT}`));
