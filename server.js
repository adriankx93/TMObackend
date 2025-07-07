require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fetch = require('node-fetch'); // <--- NOWA LINIA

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sheets', require('./routes/sheets'));

// ---- PROXY DO POBIERANIA ZGŁOSZENIA SPIE ----
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serwer backend działa na porcie ${PORT}`));
