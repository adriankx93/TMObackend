const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Get all tasks
router.get("/", auth, async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedTo", "firstName lastName email role");
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Błąd pobierania zadań" });
    }
});

// Create new task
router.post("/", auth, async (req, res) => {
    try {
        const { title, description, status, assignedTo, dueDate } = req.body;
        const task = new Task({
            title,
            description,
            status: status || "pool",
            assignedTo,
            dueDate
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: "Błąd tworzenia zadania" });
    }
});

// Update task
router.put("/:id", auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Zadanie nie znalezione" });

        const { title, description, status, assignedTo, dueDate } = req.body;
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (dueDate !== undefined) task.dueDate = dueDate;

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Błąd aktualizacji zadania" });
    }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Usunięto zadanie" });
    } catch (err) {
        res.status(400).json({ message: "Błąd usuwania zadania" });
    }
});

module.exports = router;
