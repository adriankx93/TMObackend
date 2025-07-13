require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fetch = require('node-fetch');

const app = express();

// ===== CORS – tylko Twój frontend oraz lokalny dev =====
const allowedOrigins = [
  'https://techspie.onrender.com', // Twój frontend produkcyjny
  'http://localhost:5173'          // Twój lokalny frontend (Vite, dev)
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// ===== Połączenie z bazą =====
connectDB();

// ===== API Endpoints =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sheets', require('./routes/sheets'));
app.use('/api/Warehouse', require('./routes/warehouse'));

// ===== PROXY do pobierania zgłoszenia SPIE =====
app.get('/api/protokol', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Brak url!");
  try {
    const html = await fetch(url).then(r => r.text());
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd pobierania HTML");
  }
});

// ===== Start serwera =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serwer backend działa na porcie ${PORT}`));
