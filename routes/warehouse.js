const express = require("express");
const router = express.Router();
const WarehouseItem = require("../models/WarehouseItem");
// Jeśli chcesz chronić dostęp tylko dla zalogowanych:
const { auth } = require("../middleware/auth");

// Pobierz wszystkie pozycje
router.get("/items", auth, async (req, res) => {
  try {
    const items = await WarehouseItem.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: "Błąd pobierania pozycji magazynowych" });
  }
});

// Dodaj nową pozycję
router.post("/items", auth, async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: "Brak nazwy pozycji" });
    const newItem = new WarehouseItem(req.body);
    await newItem.save();
    return res.status(201).json(newItem);
  } catch (err) {
    return res.status(500).json({ error: "Błąd zapisu pozycji" });
  }
});

module.exports = router;
