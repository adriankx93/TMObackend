const express = require("express");
const Task = require("../models/Task");
const { auth, adminOrCoord } = require("../middleware/auth");
const router = express.Router();

// Pobierz wszystkie zadania (opcjonalnie: można dodać filtry)
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "firstName lastName email role")
      .populate("createdBy", "firstName lastName email role");
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Pobierz konkretne zadanie po ID
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email role")
      .populate("createdBy", "firstName lastName email role");
    if (!task) return res.status(404).json({ message: "Nie znaleziono zadania" });
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Utwórz nowe zadanie (tylko admin/koordynator)
router.post("/", auth, adminOrCoord, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (e) {
    res.status(400).json({ message: "Nieprawidłowe dane zadania" });
  }
});

// Aktualizuj zadanie (tylko admin/koordynator)
router.put("/:id", auth, adminOrCoord, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assignedTo", "firstName lastName email role")
      .populate("createdBy", "firstName lastName email role");
    if (!updated) return res.status(404).json({ message: "Nie znaleziono zadania" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Błąd przy aktualizacji zadania" });
  }
});

// Usuń zadanie (tylko admin/koordynator)
router.delete("/:id", auth, adminOrCoord, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Usunięto zadanie" });
  } catch (e) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

module.exports = router;
