require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
app.use('/api/warehouse', require('./routes/warehouse'));    // <<< Poprawione (małe litery)
app.use('/api/tasks', require('./routes/tasks'));            // <<< Dodane endpointy do zadań

// ===== PROXY do pobierania zgłoszenia SPIE =====
app.get('/api/protokol', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Brak url!");
  try {
    const fetch = (await import('node-fetch')).default;
    const html = await fetch(url).then(r => r.text());
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd pobierania HTML");
  }
});

// ===== Healthcheck =====
app.get("/", (req, res) => {
  res.json({ message: "API działa!" });
});

// ===== Start serwera =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serwer backend działa na porcie ${PORT}`));
