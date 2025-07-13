const express = require("express");
const router = express.Router();
const WarehouseItem = require("../models/WarehouseItem");

// Pobierz wszystkie pozycje
router.get("/items", async (req, res) => {
  try {
    const items = await WarehouseItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania pozycji magazynowych" });
  }
});

// Dodaj nową pozycję
router.post("/items", async (req, res) => {
  try {
    const newItem = new WarehouseItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu pozycji" });
  }
});

module.exports = router;
